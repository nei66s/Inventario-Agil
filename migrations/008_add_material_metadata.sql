-- Add metadata column to materials for Excel-backed catalog
BEGIN;

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMIT;
