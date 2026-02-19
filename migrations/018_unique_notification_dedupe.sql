BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedupe_key_unique
  ON notifications(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

COMMIT;
