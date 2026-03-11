import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool } from '@/lib/db';
import { stripeClient } from '@/lib/billing/stripe';

/**
 * API PÚBLICA DE AUTOCADASTRO (MECANISMO DE NOVOS CLIENTES)
 */
export async function POST(req: NextRequest) {
    const client = await getPool().connect();
    try {
        const body = await req.json();
        const { tenantName, adminEmail, adminPassword } = body;

        if (!tenantName || !adminEmail || !adminPassword) {
            return NextResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        const slug = tenantName.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await client.query('BEGIN');

        // 1. Criar Tenant (Inicia como PENDING)
        const tenantRes = await client.query(
            "INSERT INTO tenants (name, slug, status) VALUES ($1, $2, 'PENDING') RETURNING id",
            [tenantName, slug]
        );
        const tenantId = tenantRes.rows[0].id;

        // 2. Criar Checkout no Stripe
        let stripeCustomerId = null;
        let checkoutUrl = null;

        try {
            // Criar cliente no Stripe
            const stripeCustomer = await stripeClient.createCustomer(adminEmail, tenantName);
            stripeCustomerId = stripeCustomer.id;

            // Criar Sessão de Checkout
            const session = await stripeClient.createCheckoutSession(stripeCustomerId, tenantId);
            checkoutUrl = session.url;

            // Atualizar o tenant com o ID do Stripe
            await client.query(
                "UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2",
                [stripeCustomerId, tenantId]
            );
        } catch (stripeErr) {
            console.error('Stripe Integration Error', stripeErr);
        }

        // 3. Criar Configurações de Site do Tenant
        await client.query(`SET app.current_tenant_id = ${client.escapeLiteral(tenantId)}`);

        await client.query(
            `INSERT INTO site_settings (id, tenant_id, company_name, platform_label) 
             VALUES ($1, $2, $3, $4)`,
            ['primary', tenantId, tenantName, 'Inventário Ágil']
        );

        // 4. Seed Data (Onboarding)
        // Adicionar Unidades de Medida padrão
        const seedUOMs = [
            ['UN', 'Unidade'],
            ['KG', 'Quilograma'],
            ['MT', 'Metros'],
            ['PCT', 'Pacote']
        ];

        for (const [code, desc] of seedUOMs) {
            await client.query(
                `INSERT INTO uoms (code, description, tenant_id) VALUES ($1, $2, $3)`,
                [code, desc, tenantId]
            );
        }

        // 3. Criar Usuário Admin do Tenant
        const userId = `usr-${Math.random().toString(36).substring(2, 10)}`;
        await client.query(
            `INSERT INTO users (id, name, email, password_hash, role, tenant_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, 'Administrador', adminEmail.toLowerCase(), passwordHash, 'Admin', tenantId]
        );


        await client.query('COMMIT');

        return NextResponse.json({
            message: 'Empresa cadastrada com sucesso!',
            tenantId,
            slug,
            checkoutUrl
        });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('Registration error', err);
        if (err.code === '23505') {
            return NextResponse.json({ message: 'Email ou Nome de Empresa já cadastrados' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Erro ao processar cadastro' }, { status: 500 });
    } finally {
        client.release();
    }
}
