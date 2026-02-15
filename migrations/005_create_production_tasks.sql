-- Persist production tasks in PostgreSQL
BEGIN;

CREATE TABLE IF NOT EXISTS production_tasks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  qty_to_produce NUMERIC(12,4) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT production_tasks_status_check CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE')),
  CONSTRAINT production_tasks_unique_order_material UNIQUE (order_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_production_tasks_status ON production_tasks(status);
CREATE INDEX IF NOT EXISTS idx_production_tasks_order_id ON production_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_material_id ON production_tasks(material_id);

-- Backfill tasks from existing order items when not present yet.
INSERT INTO production_tasks (order_id, material_id, qty_to_produce, status)
SELECT oi.order_id, oi.material_id, SUM(oi.quantity)::NUMERIC(12,4), 'PENDING'
FROM order_items oi
LEFT JOIN production_tasks pt
  ON pt.order_id = oi.order_id
 AND pt.material_id = oi.material_id
WHERE pt.id IS NULL
GROUP BY oi.order_id, oi.material_id
HAVING SUM(oi.quantity) > 0;

COMMIT;
