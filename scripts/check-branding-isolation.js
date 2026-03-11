const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();

        console.log('--- Verificando E-mail e Tenant ---');
        const userRes = await client.query("SELECT email, tenant_id FROM users WHERE email = 'stripe2@gmail.com'");
        if (userRes.rowCount === 0) {
            console.log('Usuário stripe2@gmail.com não encontrado.');
        } else {
            const user = userRes.rows[0];
            console.log(`E-mail: ${user.email} | Tenant ID: ${user.tenant_id}`);

            console.log('\n--- Verificando Site Settings para este Tenant ---');
            const siteRes = await client.query("SELECT * FROM site_settings WHERE tenant_id = $1", [user.tenant_id]);
            console.table(siteRes.rows);

            if (siteRes.rowCount === 0) {
                console.log('Nenhuma configuração de site encontrada para este tenant.');
            }
        }

        console.log('\n--- Todos os Tenants e suas Configurações ---');
        const allRes = await client.query(`
            SELECT t.name as tenant_name, s.company_name, t.id as tenant_id 
            FROM tenants t 
            LEFT JOIN site_settings s ON t.id = s.tenant_id
        `);
        console.table(allRes.rows);

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await client.end();
    }
}

run();
