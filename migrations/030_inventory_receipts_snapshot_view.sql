-- Create a materialized snapshot for inventory receipts + items so dashboard can hit one pre-aggregated source
-- run this file with psql (Postgres forbids CREATE INDEX CONCURRENTLY inside an open transaction)

DROP MATERIALIZED VIEW IF EXISTS mv_inventory_receipts_snapshot;
CREATE MATERIALIZED VIEW mv_inventory_receipts_snapshot AS
SELECT
  r.id,
  r.type,
  r.status,
  r.source_ref,
  r.created_at,
  r.posted_at,
  r.posted_by,
  r.auto_allocated,
  COALESCE(
    (json_agg(
      json_build_object(
        'material_id', i.material_id,
        'material_name', m.name,
        'qty', i.qty,
        'uom', i.uom
      )
    ) FILTER (WHERE i.id IS NOT NULL))::jsonb,
    '[]'::jsonb
  ) AS items,
  COUNT(i.id) AS item_count,
  COALESCE(SUM(i.qty)::NUMERIC(12,4), 0) AS total_qty
FROM inventory_receipts r
LEFT JOIN inventory_receipt_items i ON i.receipt_id = r.id
LEFT JOIN materials m ON m.id = i.material_id
GROUP BY r.id, r.type, r.status, r.source_ref, r.created_at, r.posted_at, r.posted_by, r.auto_allocated;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_receipts_snapshot_id ON mv_inventory_receipts_snapshot (id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_receipts_created_at ON inventory_receipts (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_receipt_items_receipt_id ON inventory_receipt_items (receipt_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
