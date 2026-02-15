-- Add material fields required by the UI
BEGIN;

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS min_stock NUMERIC(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_point NUMERIC(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS setup_time_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_time_per_unit_minutes NUMERIC(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS color_options JSONB DEFAULT '[]'::jsonb;

COMMIT;
