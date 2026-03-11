const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();

        const tables = ['tenants', 'users', 'site_settings', 'orders', 'materials', 'stock_balances'];

        console.log('--- Status do RLS nas Tabelas ---');
        for (const table of tables) {
            const res = await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE relname = $1`, [table]);
            if (res.rowCount > 0) {
                console.log(`${table}: ${res.rows[0].relrowsecurity ? 'ATIVO' : 'DESATIVADO'}`);
            } else {
                console.log(`${table}: Não encontrada`);
            }
        }

        console.log('\n--- Políticas de Segurança ---');
        const polRes = await client.query(`SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public'`);
        polRes.rows.forEach(p => {
            console.log(`Tabela: ${p.tablename} | Política: ${p.policyname} | Comando: ${p.cmd}`);
            console.log(`  Qual: ${p.qual}`);
        });

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await client.end();
    }
}

run();
