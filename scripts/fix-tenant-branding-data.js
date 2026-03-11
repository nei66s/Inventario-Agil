const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();

        const tenantId = 'fa04bb25-240c-4da1-ba2b-2cde3c613180';

        console.log('--- Corrigindo Branding do Tenant ---');

        // 1. Get correct tenant name
        const tenantRes = await client.query("SELECT name FROM tenants WHERE id = $1", [tenantId]);
        if (tenantRes.rowCount === 0) {
            console.log('Tenant não encontrado.');
            return;
        }
        const correctName = tenantRes.rows[0].name;
        console.log(`Nome correto do Tenant: ${correctName}`);

        // 2. Update site_settings
        await client.query(
            "UPDATE site_settings SET company_name = $1 WHERE tenant_id = $2",
            [correctName, tenantId]
        );
        console.log('Site settings atualizado.');

        // 3. Clear logo if it belongs to someone else (optional, but good for privacy)
        // For now, let's just make sure it's correct.

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await client.end();
    }
}

run();
