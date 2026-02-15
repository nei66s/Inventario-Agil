-- Add trashed_at column to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS trashed_at timestamptz NULL;
