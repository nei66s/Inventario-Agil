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

        console.log('--- Limpando Logo do Novo Tenant (Reset para Padrão) ---');

        await client.query(
            "UPDATE site_settings SET logo_url = NULL, logo_data = NULL, logo_content_type = NULL WHERE tenant_id = $1",
            [tenantId]
        );
        console.log('Logo removido. Voltará para o padrão Black Tower X.');

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await client.end();
    }
}

run();
