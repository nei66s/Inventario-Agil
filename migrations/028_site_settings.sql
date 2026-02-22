CREATE TABLE site_settings (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  platform_label TEXT NOT NULL DEFAULT 'Plataforma SaaS',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id, company_name, platform_label)
VALUES ('primary', 'Black Tower X', 'Plataforma SaaS')
ON CONFLICT (id) DO NOTHING;
