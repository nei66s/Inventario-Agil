-- 050_mrp_suggestions_multi_tenant_pk.sql

DO $$
BEGIN
    ALTER TABLE mrp_suggestions DROP CONSTRAINT IF EXISTS mrp_suggestions_material_id_key;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mrp_suggestions_tenant_material_key') THEN
        ALTER TABLE mrp_suggestions ADD CONSTRAINT mrp_suggestions_tenant_material_key UNIQUE (tenant_id, material_id);
    END IF;
END $$;
