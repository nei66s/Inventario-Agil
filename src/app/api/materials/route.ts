import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const res = await pool.query('SELECT id, sku, name, description, unit FROM materials ORDER BY id')
    const rows = res.rows || []
    const materials = rows.map((r: any) => ({
      id: `M-${r.id}`,
      sku: r.sku,
      name: r.name,
      description: r.description,
      standardUom: r.unit || 'EA',
      minStock: 0,
      reorderPoint: 0,
      setupTimeMinutes: 0,
      productionTimePerUnitMinutes: 0,
      colorOptions: [],
    }))

    return NextResponse.json(materials)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
