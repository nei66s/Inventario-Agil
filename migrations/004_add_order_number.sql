-- Add persistent order_number column and backfill existing orders
BEGIN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text NULL;

WITH numbered AS (
  SELECT id,
         to_char(created_at,'YYYYMMDD') AS d,
         row_number() OVER (PARTITION BY created_at::date ORDER BY created_at) AS rn
  FROM orders
)
UPDATE orders
SET order_number = numbered.d || lpad(numbered.rn::text,2,'0')
FROM numbered
WHERE orders.id = numbered.id
  AND (orders.order_number IS NULL OR orders.order_number = '');

COMMIT;
