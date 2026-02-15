import { NextResponse } from 'next/server'
import pool from '@/lib/db'

type ApiOrder = {
  id: string
  orderNumber: string
  clientId: string
  clientName: string
  status: string
  readiness: 'NOT_READY' | 'READY_PARTIAL' | 'READY_FULL'
  orderDate: string
  dueDate: string
  createdBy: string
  volumeCount: number
  items: Array<{
    id: string
    materialId: string
    materialName: string
    uom: string
    color: string
    qtyRequested: number
    qtyReservedFromStock: number
    qtyToProduce: number
    qtySeparated: number
    conditions: unknown[]
  }>
  auditTrail: unknown[]
  labelPrintCount: number
  total: number
  trashedAt: string | null
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return String(err)
}

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT
         o.id as order_id,
         o.order_number,
         o.status,
         o.total,
         o.created_at,
         o.trashed_at,
         oi.id as item_id,
         oi.material_id,
         oi.quantity,
         oi.unit_price,
         m.name as material_name,
         m.unit as material_unit,
         COALESCE(pt.qty_to_produce, 0) as qty_to_produce
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN materials m ON m.id = oi.material_id
       LEFT JOIN (
         SELECT order_id, material_id, SUM(qty_to_produce)::NUMERIC(12,4) AS qty_to_produce
         FROM production_tasks
         WHERE status <> 'DONE'
         GROUP BY order_id, material_id
       ) pt ON pt.order_id = o.id AND pt.material_id = oi.material_id
       ORDER BY o.created_at ASC`
    )
    const rows = res.rows || []

    const map = new Map<number, ApiOrder>()
    // counters per day to generate sequential numbers: YYYYMMDD + seq
    // We also inspect stored order_number values to avoid collisions.
    const dayCounters = new Map<string, number>()
    for (const r of rows) {
      const oid = Number(r.order_id)
      // prefer stored order_number when present
      let orderNumberStored: string | null = null
      if (r.order_number) orderNumberStored = String(r.order_number)
      if (!map.has(oid)) {
        const created = r.created_at ? new Date(r.created_at) : new Date()
        const day = created.toISOString().slice(0,10) // YYYY-MM-DD
        const dayKey = day.replace(/-/g, '') // YYYYMMDD
        // if there's a stored order number, parse its sequence and ensure counters reflect it
        if (orderNumberStored && /^\d{8}\d+$/.test(orderNumberStored)) {
          const storedDay = orderNumberStored.slice(0,8)
          const storedSeq = Number(orderNumberStored.slice(8)) || 0
          const prevStored = dayCounters.get(storedDay) ?? 0
          if (storedSeq > prevStored) dayCounters.set(storedDay, storedSeq)
        }
        const prev = dayCounters.get(dayKey) ?? 0
        const seq = prev + 1
        dayCounters.set(dayKey, seq)
        const orderNumber = orderNumberStored ?? `${dayKey}${String(seq).padStart(2,'0')}`

        map.set(oid, { id: `O-${oid}`, orderNumber, clientId: '', clientName: '', status: r.status, readiness: 'NOT_READY', orderDate: created.toISOString(), dueDate: created.toISOString(), createdBy: '', volumeCount: 1, items: [], auditTrail: [], labelPrintCount: 0, total: Number(r.total ?? 0), trashedAt: r.trashed_at ? (r.trashed_at.toISOString ? r.trashed_at.toISOString() : r.trashed_at) : null })
      }
      if (r.item_id) {
        const order = map.get(oid)
        const qtyRequested = Number(r.quantity ?? 0)
        const qtyToProduce = Math.max(0, Number(r.qty_to_produce ?? 0))
        const qtyReservedFromStock = Math.max(0, qtyRequested - qtyToProduce)
        order.items.push({
          id: `itm-${r.item_id}`,
          materialId: `M-${r.material_id}`,
          materialName: r.material_name || `M-${r.material_id}`,
          uom: r.material_unit || 'EA',
          color: '',
          qtyRequested,
          qtyReservedFromStock,
          qtyToProduce,
          qtySeparated: 0,
          conditions: [],
        })
      }
    }

    const orders = Array.from(map.values())
    return NextResponse.json(orders)
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
