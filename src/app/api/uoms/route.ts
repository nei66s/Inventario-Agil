import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const url = new URL(request.url)
    const codeFilter = String(url.searchParams.get('code') ?? '').trim().toUpperCase()
    if (codeFilter) {
      const materialsRes = await query<{ name: string; sku: string | null }>(
        'SELECT name, sku FROM materials WHERE tenant_id = $1 AND unit = $2 ORDER BY name ASC',
        [auth.tenantId, codeFilter]
      )
      return NextResponse.json({
        code: codeFilter,
        materials: materialsRes.rows.map((row) => ({
          name: row.name,
          sku: row.sku ?? undefined,
        })),
      })
    }
    const res = await query<{
      code: string
      description: string | null
      materials_count: string | number
      order_items_count: string | number
      conversions_count: string | number
    }>(
      `SELECT
         u.code,
         u.description,
         (SELECT COUNT(*) FROM materials m WHERE m.tenant_id = u.tenant_id AND m.unit = u.code) AS materials_count,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.tenant_id = u.tenant_id AND oi.requested_uom = u.code) AS order_items_count,
         (SELECT COUNT(*) FROM uom_conversions c WHERE c.tenant_id = u.tenant_id AND (c.from_uom = u.code OR c.to_uom = u.code)) AS conversions_count
       FROM uoms u
       WHERE u.tenant_id = $1
       ORDER BY COALESCE(u.description, ''), u.code ASC`,
      [auth.tenantId]
    )
    return NextResponse.json(
      res.rows.map((row) => ({
        code: String(row.code),
        description: row.description ?? undefined,
        usageCount:
          Number(row.materials_count ?? 0) +
          Number(row.order_items_count ?? 0) +
          Number(row.conversions_count ?? 0),
        materialsCount: Number(row.materials_count ?? 0),
      }))
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const payload = await request.json().catch(() => ({}))
    const rawCode = String(payload.code ?? '').trim().toUpperCase()
    const description = typeof payload.description === 'string' ? payload.description.trim() : null

    if (!rawCode) {
      return NextResponse.json({ error: 'Codigo obrigatorio' }, { status: 400 })
    }
    if (!/^[A-Z0-9_-]+$/.test(rawCode)) {
      return NextResponse.json({ error: 'Codigo invalido' }, { status: 400 })
    }

    const exists = await query('SELECT 1 FROM uoms WHERE tenant_id = $1 AND code = $2', [auth.tenantId, rawCode])
    if (exists.rowCount && exists.rowCount > 0) {
      return NextResponse.json({ error: 'Unidade ja cadastrada' }, { status: 400 })
    }

    await query('INSERT INTO uoms (code, description, tenant_id) VALUES ($1, $2, $3)', [
      rawCode,
      description,
      auth.tenantId,
    ])

    return NextResponse.json({ code: rawCode, description: description ?? undefined }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const payload = await request.json().catch(() => ({}))
    const rawCode = String(payload.code ?? '').trim().toUpperCase()
    const description = typeof payload.description === 'string' ? payload.description.trim() : null
    if (!rawCode) {
      return NextResponse.json({ error: 'Codigo obrigatorio' }, { status: 400 })
    }

    const exists = await query('SELECT 1 FROM uoms WHERE tenant_id = $1 AND code = $2', [auth.tenantId, rawCode])
    if (!exists.rowCount) {
      return NextResponse.json({ error: 'Unidade nao encontrada' }, { status: 404 })
    }

    await query('UPDATE uoms SET description = $3 WHERE tenant_id = $1 AND code = $2', [
      auth.tenantId,
      rawCode,
      description,
    ])

    return NextResponse.json({ code: rawCode, description: description ?? undefined })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const url = new URL(request.url)
    const rawCode = String(url.searchParams.get('code') ?? '').trim().toUpperCase()
    if (!rawCode) {
      return NextResponse.json({ error: 'Codigo obrigatorio' }, { status: 400 })
    }

    const countRes = await query<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM uoms WHERE tenant_id = $1',
      [auth.tenantId]
    )
    const count = Number(countRes.rows[0]?.count ?? 0)
    if (count <= 1) {
      return NextResponse.json({ error: 'Nao e permitido remover a ultima unidade' }, { status: 400 })
    }

    const materialsRes = await query<{ name: string; sku: string | null }>(
      'SELECT name, sku FROM materials WHERE tenant_id = $1 AND unit = $2 ORDER BY name ASC',
      [auth.tenantId, rawCode]
    )
    const usageRes = await query(
      `SELECT 1 FROM order_items WHERE tenant_id = $1 AND requested_uom = $2 LIMIT 1
       UNION ALL
       SELECT 1 FROM uom_conversions WHERE tenant_id = $1 AND (from_uom = $2 OR to_uom = $2) LIMIT 1`,
      [auth.tenantId, rawCode]
    )
    if ((usageRes.rowCount && usageRes.rowCount > 0) || materialsRes.rowCount > 0) {
      return NextResponse.json(
        {
          error: 'Unidade em uso',
          materials: materialsRes.rows.map((row) => ({
            name: row.name,
            sku: row.sku ?? undefined,
          })),
        },
        { status: 400 }
      )
    }

    await query('DELETE FROM uoms WHERE tenant_id = $1 AND code = $2', [auth.tenantId, rawCode])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
