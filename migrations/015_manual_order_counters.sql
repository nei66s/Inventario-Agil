-- Track the last manual order number for each day
BEGIN;

CREATE TABLE IF NOT EXISTS order_number_counters (
  day DATE PRIMARY KEY,
  last_seq INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

WITH manual_sequences AS (
  SELECT
    created_at::date AS day,
    MAX((substring(order_number FROM 9))::int) AS max_seq
  FROM orders
  WHERE order_number ~ '^\d{8}\d+$'
    AND (source IS NULL OR source != 'mrp')
  GROUP BY created_at::date
)
INSERT INTO order_number_counters (day, last_seq, updated_at)
SELECT day, COALESCE(max_seq, 0), now()
FROM manual_sequences
ON CONFLICT (day) DO UPDATE
  SET last_seq = GREATEST(order_number_counters.last_seq, EXCLUDED.last_seq),
      updated_at = now();

COMMIT;
