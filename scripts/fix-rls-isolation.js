const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();

        console.log('--- Corrigindo RLS para Isolamento de Tenant ---');

        const queries = [
            // Enable RLS for site_settings
            "ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY",
            "DROP POLICY IF EXISTS tenant_isolation_policy ON site_settings",
            "CREATE POLICY tenant_isolation_policy ON site_settings USING (tenant_id = current_setting('app.current_tenant_id')::uuid)",

            // Ensure RLS for materials
            "ALTER TABLE materials ENABLE ROW LEVEL SECURITY",
            "DROP POLICY IF EXISTS tenant_isolation_policy ON materials",
            "CREATE POLICY tenant_isolation_policy ON materials USING (tenant_id = current_setting('app.current_tenant_id')::uuid)",

            // Ensure RLS for users
            "ALTER TABLE users ENABLE ROW LEVEL SECURITY",
            "DROP POLICY IF EXISTS tenant_isolation_policy ON users",
            "CREATE POLICY tenant_isolation_policy ON users USING (tenant_id = current_setting('app.current_tenant_id')::uuid)",

            // Ensure RLS for orders
            "ALTER TABLE orders ENABLE ROW LEVEL SECURITY",
            "DROP POLICY IF EXISTS tenant_isolation_policy ON orders",
            "CREATE POLICY tenant_isolation_policy ON orders USING (tenant_id = current_setting('app.current_tenant_id')::uuid)",

            // Ensure RLS for stock_balances
            "ALTER TABLE stock_balances ENABLE ROW LEVEL SECURITY",
            "DROP POLICY IF EXISTS tenant_isolation_policy ON stock_balances",
            "CREATE POLICY tenant_isolation_policy ON stock_balances USING (tenant_id = current_setting('app.current_tenant_id')::uuid)"
        ];

        for (const sql of queries) {
            console.log(`Executando: ${sql}`);
            await client.query(sql);
        }

        console.log('\n--- RLS Corrigido com Sucesso! ---');

    } catch (err) {
        console.error('Erro ao corrigir RLS:', err);
    } finally {
        await client.end();
    }
}

run();
