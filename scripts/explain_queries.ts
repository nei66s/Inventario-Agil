import 'dotenv/config';
import { query } from '../src/lib/db'

async function run() {
  const materialsRes = await query(`
    EXPLAIN ANALYZE
    SELECT
      m.id,
      m.sku,
      m.name,
      m.description,
      m.unit,
      m.min_stock,
      m.reorder_point,
      m.setup_time_minutes,
      m.production_time_per_unit_minutes,
      m.color_options,
      m.metadata,
      COALESCE(sr_agg.total, 0) AS reserved_total,
      COALESCE(pr_agg.total, 0) AS production_reserved,
      COALESCE(sb.on_hand, 0) AS on_hand
    FROM materials m
    LEFT JOIN stock_balances sb ON sb.material_id = m.id
    LEFT JOIN (
      SELECT material_id, SUM(qty)::NUMERIC(12,4) as total
      FROM stock_reservations
      WHERE expires_at > now()
      GROUP BY material_id
    ) sr_agg ON sr_agg.material_id = m.id
    LEFT JOIN (
      SELECT material_id, SUM(qty)::NUMERIC(12,4) as total
      FROM production_reservations
      GROUP BY material_id
    ) pr_agg ON pr_agg.material_id = m.id
  `);
  
  const orderItemsRes = await query(`
    EXPLAIN ANALYZE
    SELECT
      oi.material_id,
      oi.conditions,
      COALESCE(SUM(oi.quantity)::NUMERIC(12,4), 0) AS quantity_requested,
      COALESCE(SUM(oi.qty_reserved_from_stock)::NUMERIC(12,4), 0) AS reserved_from_stock,
      COALESCE(SUM(oi.qty_to_produce)::NUMERIC(12,4), 0) AS qty_to_produce
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE COALESCE(oi.conditions, '[]'::jsonb) <> '[]'::jsonb
      AND NOT (lower(o.status) IN ('finalizado', 'saida_concluida', 'cancelado'))
    GROUP BY oi.material_id, oi.conditions
    ORDER BY oi.material_id
  `);

  console.log("=== MATERIALS QUERY ===");
  console.log(materialsRes.rows.map(r => r['QUERY PLAN']).join('\n'));
  console.log("\n=== ORDER ITEMS QUERY ===");
  console.log(orderItemsRes.rows.map(r => r['QUERY PLAN']).join('\n'));
  process.exit(0);
}
run().catch(console.error);
