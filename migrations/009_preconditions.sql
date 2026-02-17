-- Store global pre-condition categories and values
BEGIN;

CREATE TABLE IF NOT EXISTS precondition_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precondition_values (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES precondition_categories(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, value)
);

INSERT INTO precondition_categories (name) VALUES
  ('Fibra'),
  ('FibraCor'),
  ('Corda'),
  ('CordaCor'),
  ('Trico'),
  ('TricoCor'),
  ('Fio'),
  ('Fiocor')
ON CONFLICT (name) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'Fibra'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Cordao 3,2 mm'),
    ('Cordao 5 mm'),
    ('Meia Cana 6 mm'),
    ('Fita 10 mm'),
    ('Dupla 12 mm'),
    ('Fita 15 mm Fina'),
    ('Fita 15 mm Grossa'),
    ('Fita 20 mm')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'FibraCor'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Amarelo'),
    ('Azul BIC'),
    ('Azul Tiffany'),
    ('Azul Royal'),
    ('Azul CVC'),
    ('Azul Acinzentado'),
    ('Azul Marinho'),
    ('Branco'),
    ('Preto'),
    ('Terracota'),
    ('Vinho Bordo'),
    ('Verde Militar'),
    ('Turquesa')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'Corda'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Cordao 3,2 mm'),
    ('Cordao 5 mm'),
    ('Dupla 12 mm'),
    ('Fita 10 mm'),
    ('Fita 15 mm Fina'),
    ('Fita 15 mm Grossa'),
    ('Fita 20 mm')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'CordaCor'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Amarelo'),
    ('Azul Tiffany'),
    ('Azul CVC'),
    ('Azul Marinho'),
    ('Azul Turquesa'),
    ('Branco'),
    ('Cinza'),
    ('Ferrugem'),
    ('Preto'),
    ('Verde Militar')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'Trico'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Meia Cana 6 mm'),
    ('Fita 10 mm'),
    ('Fita 15 mm Fina'),
    ('Fita 15 mm Grossa'),
    ('Fita 20 mm'),
    ('Dupla 12 mm')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'TricoCor'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Azul Tiffany'),
    ('Azul CVC'),
    ('Champagne'),
    ('Chumbo'),
    ('Preto'),
    ('Verde Militar'),
    ('Vinho Bordo'),
    ('Terracota'),
    ('Marrom')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'Fio'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Fio'),
    ('Fita 10 mm'),
    ('Fita 20 mm')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

WITH cat AS (
  SELECT id FROM precondition_categories WHERE name = 'Fiocor'
)
INSERT INTO precondition_values (category_id, value)
SELECT cat.id, v.value
FROM cat, (VALUES
    ('Natural'),
    ('Rami'),
    ('Champagne'),
    ('Azul Tiffany'),
    ('Verde Militar'),
    ('Terracota')
  ) AS v(value)
ON CONFLICT (category_id, value) DO NOTHING;

COMMIT;
