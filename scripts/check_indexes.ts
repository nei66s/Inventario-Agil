import 'dotenv/config';
import { query } from '../src/lib/db'

async function run() {
  const res = await query(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('orders', 'order_items', 'materials', 'stock_balances', 'stock_reservations', 'production_reservations', 'inventory_adjustments')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
run().catch(console.error);
