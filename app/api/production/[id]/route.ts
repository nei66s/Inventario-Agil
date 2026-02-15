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

function parseTaskId(id: string): number {
  return Number(String(id).replace(/\D+/g, ''))
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return String(err)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const taskId = parseTaskId(id)
    const payload = await request.json()
    const action = String(payload.action ?? '').toLowerCase()

    if (!taskId) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
    if (action !== 'start' && action !== 'complete') {
      return NextResponse.json({ error: 'action deve ser start ou complete' }, { status: 400 })
    }

    let sql = ''
    if (action === 'start') {
      sql = `
        UPDATE production_tasks
        SET
          status = CASE WHEN status = 'DONE' THEN status ELSE 'IN_PROGRESS' END,
          started_at = CASE WHEN started_at IS NULL AND status != 'DONE' THEN now() ELSE started_at END,
          updated_at = now()
        WHERE id = $1
        RETURNING id, order_id, material_id, qty_to_produce, status, created_at, updated_at,
          (SELECT order_number FROM orders WHERE id = production_tasks.order_id) AS order_number,
          (SELECT name FROM materials WHERE id = production_tasks.material_id) AS material_name
      `
    } else {
      sql = `
        UPDATE production_tasks
        SET
          status = 'DONE',
          completed_at = now(),
          updated_at = now()
        WHERE id = $1
        RETURNING id, order_id, material_id, qty_to_produce, status, created_at, updated_at,
          (SELECT order_number FROM orders WHERE id = production_tasks.order_id) AS order_number,
          (SELECT name FROM materials WHERE id = production_tasks.material_id) AS material_name
      `
    }

    const res = await pool.query<DbRow>(sql, [taskId])
    if (res.rowCount === 0) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    return NextResponse.json(toApiTask(res.rows[0]))
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
