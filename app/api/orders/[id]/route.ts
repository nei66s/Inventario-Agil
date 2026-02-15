import { NextResponse } from 'next/server'
import pool from '@/lib/db'

type RouteParams = { id: string }

function parseOrderId(idRaw: string): number {
  return Number(String(idRaw).replace(/^O-/, ''))
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return String(err)
}

export async function PATCH(request: Request, { params }: { params: Promise<RouteParams> }) {
  try {
    const resolvedParams = await params
    const id = parseOrderId(resolvedParams.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json().catch(() => ({} as { trashed?: boolean }))
    const trashed = Boolean(body.trashed)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      if (trashed) {
        await client.query('UPDATE orders SET trashed_at = NOW(), status = $2 WHERE id = $1', [id, 'CANCELADO'])
        await client.query('DELETE FROM production_tasks WHERE order_id = $1', [id])
      } else {
        await client.query('UPDATE orders SET trashed_at = NULL WHERE id = $1', [id])
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {})
      throw err
    } finally {
      client.release()
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<RouteParams> }) {
  try {
    const resolvedParams = await params
    const id = parseOrderId(resolvedParams.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    // Permanently delete order and its items. production_tasks cascade on order delete.
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id])
    await pool.query('DELETE FROM orders WHERE id = $1', [id])

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
