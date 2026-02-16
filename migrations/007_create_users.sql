BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'Admin',
    'Manager',
    'Seller',
    'Input Operator',
    'Production Operator',
    'Picker'
  )),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('usr-admin', 'Amanda Admin', 'admin@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Admin')
, ('usr-manager', 'Marcos Gestao', 'manager@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Manager')
, ('usr-seller', 'Sofia Vendas', 'seller@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Seller')
, ('usr-input', 'Iago Entrada', 'input@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Input Operator')
, ('usr-production', 'Paulo Producao', 'production@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Production Operator')
, ('usr-picker', 'Priscila Picking', 'picker@supplyflow.local', '$2b$10$4agq6NO30nC0n5T5uQMeyuBhrMLALMKQBgAhdMiaD.th9WbPATM.K', 'Picker');

COMMIT;
