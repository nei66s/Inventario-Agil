import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { postReceipt } from '@/lib/receipt-helpers'

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return String(err)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    const resolvedParams = await params
    const receiptId = Number(String(resolvedParams.id).replace(/\D+/g, ''))
    if (!receiptId) return NextResponse.json({ error: 'id invalido' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const action = String(body.action ?? '').toLowerCase()
    if (action !== 'post') {
      return NextResponse.json({ error: 'action invalida' }, { status: 400 })
    }
    const autoAllocate = Boolean(body.autoAllocate)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await postReceipt(client, receiptId, {
        postedBy: auth.userId,
        autoAllocate,
      })
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {})
      const msg = errorMessage(err)
      if (msg === 'Recebimento nao encontrado') {
        return NextResponse.json({ error: msg }, { status: 404 })
      }
      if (msg === 'Recebimento ja postado') {
        return NextResponse.json({ error: msg }, { status: 400 })
      }
      throw err
    } finally {
      client.release()
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
