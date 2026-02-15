import { NextResponse } from 'next/server'
import pool from '@/lib/db'

type DbRow = {
  id: number
  order_id: number
  material_id: number
  qty_to_produce: string | number
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  created_at: string
  updated_at: string
  order_number: string | null
  material_name: string | null
}

function toApiTask(row: DbRow) {
  return {
    id: `PT-${row.id}`,
    orderId: `O-${row.order_id}`,
    materialId: `M-${row.material_id}`,
    orderNumber: row.order_number || `O-${row.order_id}`,
    materialName: row.material_name || `M-${row.material_id}`,
    qtyToProduce: Number(row.qty_to_produce ?? 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return String(err)
}

export async function GET() {
  try {
    const res = await pool.query<DbRow>(
      `SELECT
         pt.id,
         pt.order_id,
         pt.material_id,
         pt.qty_to_produce,
         pt.status,
         pt.created_at,
         pt.updated_at,
         o.order_number,
         m.name AS material_name
       FROM production_tasks pt
       LEFT JOIN orders o ON o.id = pt.order_id
       LEFT JOIN materials m ON m.id = pt.material_id
       WHERE o.trashed_at IS NULL
         AND (o.status IS NULL OR lower(o.status) NOT IN ('cancelado', 'finalizado'))
       ORDER BY pt.created_at ASC, pt.id ASC`
    )

    return NextResponse.json(res.rows.map(toApiTask))
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const orderId = Number(String(payload.orderId ?? '').replace(/\D+/g, ''))
    const materialId = Number(String(payload.materialId ?? '').replace(/\D+/g, ''))
    const qtyToProduce = Number(payload.qtyToProduce ?? 0)

    const errors: Record<string, string> = {}
    if (!orderId) errors.orderId = 'orderId é obrigatório'
    if (!materialId) errors.materialId = 'materialId é obrigatório'
    if (Number.isNaN(qtyToProduce) || qtyToProduce <= 0) errors.qtyToProduce = 'qtyToProduce deve ser maior que zero'
    if (Object.keys(errors).length > 0) return NextResponse.json({ errors }, { status: 400 })

    const res = await pool.query<DbRow>(
      `INSERT INTO production_tasks (order_id, material_id, qty_to_produce, status)
       VALUES ($1, $2, $3, 'PENDING')
       ON CONFLICT (order_id, material_id)
       DO UPDATE SET
         qty_to_produce = EXCLUDED.qty_to_produce,
         status = CASE
           WHEN production_tasks.status = 'DONE' THEN production_tasks.status
           ELSE 'PENDING'
         END,
         updated_at = now()
       RETURNING id, order_id, material_id, qty_to_produce, status, created_at, updated_at,
         (SELECT order_number FROM orders WHERE id = production_tasks.order_id) AS order_number,
         (SELECT name FROM materials WHERE id = production_tasks.material_id) AS material_name`
      ,
      [orderId, materialId, qtyToProduce]
    )

    return NextResponse.json(toApiTask(res.rows[0]), { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
