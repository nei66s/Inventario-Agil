require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&sslmode=require' : '?sslmode=require') });

async function run() {
  const res = await pool.query(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('orders', 'order_items', 'materials', 'stock_balances', 'stock_reservations', 'production_reservations')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}

run().catch(console.error);
