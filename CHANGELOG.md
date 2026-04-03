# Changelog

## 2026-04-03

### Performance (Dev)
- Increased Postgres pool defaults for development to reduce queueing and noisy logs.
- Reduced badges polling frequency.
- Centralized `/api/ping` to a shared client-side store.

### Production: Ad‑Hoc (No Order)
- Added “Producao avulsa” flow on `/production` for operators to create production without an existing order.
- Backend now creates an internal MRP order when `orderId` is missing.

### UOM (Unidades de Medida) – Global & Validated
- Added `GET/POST/PUT/DELETE` endpoints for global UOMs per tenant.
- UOMs validated for materials and production.
- Added UI management for UOMs under Materials (create, edit description, remove with usage checks).
- Added modal listing materials using a UOM, with search and filtered counts.
- Orders now use UOMs from the global catalog; default UOM on add-item comes from the material’s UOM.

### UI/UX
- Material selector in production now searches by name/SKU/ID.
- UOM labels in selects show description when available.

---

### Files Updated
- `src/lib/db.ts`
- `src/components/app-shell.tsx`
- `src/components/health/ping-store.ts`
- `src/components/ping-health.tsx`
- `src/components/db-health.tsx`
- `src/components/ws-health.tsx`
- `src/app/production/page.tsx`
- `src/app/api/production/route.ts`
- `src/app/api/uoms/route.ts`
- `src/app/api/materials/route.ts`
- `src/app/api/materials/[id]/route.ts`
- `src/app/materials/page.tsx`
- `src/app/orders/page.tsx`
- `src/app/api/orders/[id]/route.ts`
