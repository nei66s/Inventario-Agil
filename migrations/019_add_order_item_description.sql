-- Add per-item description column used by labels
BEGIN;
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS item_description TEXT;
COMMIT;
