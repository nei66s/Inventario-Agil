ALTER TABLE site_settings
  ADD COLUMN logo_data BYTEA,
  ADD COLUMN logo_content_type TEXT;

UPDATE site_settings
SET logo_data = NULL, logo_content_type = NULL
WHERE logo_data IS NULL;
