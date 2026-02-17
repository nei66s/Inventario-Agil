import { unstable_cache } from 'next/cache'
import { query } from '../db'
import { logRepoPerf } from './perf'
import { Material, StockBalance } from '../pilot/types'

type MaterialStockRow = {
  id: number
  sku: string | null
  name: string
  description: string | null
  unit: string | null
  min_stock: string | number | null
  reorder_point: string | number | null
  setup_time_minutes: string | number | null
  production_time_per_unit_minutes: string | number | null
  color_options: unknown
  metadata: unknown
  reserved_total: string | number | null
  on_hand: string | number | null
}

const materialSnapshotQuery = `SELECT
  m.id,
  m.sku,
  m.name,
  m.description,
  m.unit,
  m.min_stock,
  m.reorder_point,
  m.setup_time_minutes,
  m.production_time_per_unit_minutes,
  m.color_options,
  m.metadata,
  COALESCE((
    SELECT SUM(GREATEST(0::NUMERIC, req.requested_qty - COALESCE(pt.qty_to_produce, 0::NUMERIC)))
    FROM (
      SELECT oi2.order_id, oi2.material_id, SUM(oi2.quantity)::NUMERIC(12,4) AS requested_qty
      FROM order_items oi2
      JOIN orders o2 ON o2.id = oi2.order_id
      WHERE oi2.material_id = m.id
        AND (o2.status IS NULL OR lower(o2.status) NOT IN ('draft', 'cancelado', 'finalizado'))
      GROUP BY oi2.order_id, oi2.material_id
    ) req
    LEFT JOIN production_tasks pt
      ON pt.order_id = req.order_id
     AND pt.material_id = req.material_id
  ), 0) AS reserved_total,
  COALESCE(sb.on_hand, 0) AS on_hand
FROM materials m
LEFT JOIN stock_balances sb ON sb.material_id = m.id
GROUP BY m.id, sb.on_hand`

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return value as T
}

async function buildMaterialSnapshot(): Promise<{ materials: Material[]; stockBalances: StockBalance[]; queryMs: number }> {
  const res = await query<MaterialStockRow>(materialSnapshotQuery)
  const colorMap = res.rows.map((row) => {
    const colorOptionsRaw = parseJson<unknown>(row.color_options, [])
    const metadataRaw = parseJson<Record<string, unknown>>(row.metadata, {})
    const metadata = Object.fromEntries(
      Object.entries(metadataRaw).map(([key, value]) => [key, String(value ?? '')])
    ) as Record<string, string>

    return {
      id: row.id,
      sku: row.sku || undefined,
      name: row.name,
      description: row.description ?? '',
      standardUom: row.unit ?? 'EA',
      minStock: Number(row.min_stock ?? 0),
      reorderPoint: Number(row.reorder_point ?? 0),
      setupTimeMinutes: Number(row.setup_time_minutes ?? 0),
      productionTimePerUnitMinutes: Number(row.production_time_per_unit_minutes ?? 0),
      colorOptions: Array.isArray(colorOptionsRaw)
        ? colorOptionsRaw.map((item) => String(item ?? '')).filter(Boolean)
        : [],
      metadata,
    }
  })

  const materials = colorMap.map((row) => ({
    id: `M-${row.id}`,
    sku: row.sku,
    name: row.name,
    description: row.description,
    standardUom: row.standardUom,
    minStock: row.minStock,
    reorderPoint: row.reorderPoint,
    setupTimeMinutes: row.setupTimeMinutes,
    productionTimePerUnitMinutes: row.productionTimePerUnitMinutes,
    colorOptions: row.colorOptions,
    metadata: row.metadata,
  }))

  const stockBalances = res.rows.map((row) => ({
    materialId: `M-${row.id}`,
    onHand: Number(row.on_hand ?? 0),
    reservedTotal: Number(row.reserved_total ?? 0),
  }))

  return { materials, stockBalances, queryMs: res.queryTimeMs }
}

export async function fetchMaterialsWithStock() {
  const totalStart = process.hrtime.bigint()
  const { materials, stockBalances, queryMs } = await buildMaterialSnapshot()
  const serializationMs = Number(process.hrtime.bigint() - totalStart) / 1_000_000 - queryMs
  const totalMs = Number(process.hrtime.bigint() - totalStart) / 1_000_000
  logRepoPerf('materials:inventorySnapshot', {
    queryMs,
    serializationMs: Math.max(serializationMs, 0),
    totalMs,
    rows: materials.length,
  })
  return { materials, stockBalances }
}

export const getMaterialsSnapshot = unstable_cache(async () => {
  const snapshot = await buildMaterialSnapshot()
  return { materials: snapshot.materials, stockBalances: snapshot.stockBalances }
}, [], { revalidate: 30 })

export async function refreshMaterialsSnapshot() {
  await getMaterialsSnapshot.revalidate()
}
