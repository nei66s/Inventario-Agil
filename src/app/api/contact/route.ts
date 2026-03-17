import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { getAuthPayload } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'IP Desconhecido';
        
        let userInfoStr = `👤 **Nome:** Visitante Não Logado`;
        const auth = getAuthPayload(req);

        if (auth) {
            const pool = getPool();
            const res = await pool.query(
                `SELECT u.name as user_name, u.email, t.name as tenant_name 
                 FROM users u 
                 LEFT JOIN tenants t ON u.tenant_id = t.id 
                 WHERE u.id = $1 LIMIT 1`,
                [auth.userId]
            );
            
            if (res.rows.length > 0) {
                const user = res.rows[0];
                userInfoStr = `👤 **Usuário:** ${user.user_name} (${user.email})\n🏢 **Empresa:** ${user.tenant_name || 'Desconhecida'}`;
            }
        }

        await sendTelegramMessage(
            `🔔 **Nova Mensagem do Chat!**\n\n` +
            `${userInfoStr}\n\n` +
            `💬 **Mensagem:**\n${message || 'Sem mensagem'}\n\n` +
            `📍 IP: \`${ip}\``
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Contact Error]', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
