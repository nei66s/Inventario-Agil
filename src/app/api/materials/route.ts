import { NextResponse } from 'next/server'
import pool from '@/lib/db'

function normalizeColorOptions(value: unknown, metadata: any) {
  if (Array.isArray(value) && value.length) {
    return value.filter(Boolean)
  }
  if (Array.isArray(metadata?.colorOptions) && metadata.colorOptions.length) {
    return metadata.colorOptions.filter(Boolean)
  }
  return []
}

export async function GET() {
  try {
    const res = await pool.query(
      'SELECT id, sku, name, description, unit, min_stock, reorder_point, setup_time_minutes, production_time_per_unit_minutes, color_options, metadata FROM materials ORDER BY id'
    )
    const rows = res.rows || []
    const materials = rows.map((r: any) => {
      const metadata =
        typeof r.metadata === 'string'
          ? JSON.parse(r.metadata)
          : r.metadata ?? {}
      const colorOptions = normalizeColorOptions(r.color_options, metadata)

      return {
        id: `M-${r.id}`,
        sku: r.sku,
        name: r.name,
        description: r.description,
        standardUom: r.unit || metadata?.Tipos || 'EA',
        minStock: Number(r.min_stock) || 0,
        reorderPoint: Number(r.reorder_point) || 0,
        setupTimeMinutes: Number(r.setup_time_minutes) || 0,
        productionTimePerUnitMinutes: Number(r.production_time_per_unit_minutes) || 0,
        colorOptions,
        metadata,
      }
    })

    return NextResponse.json(materials)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
