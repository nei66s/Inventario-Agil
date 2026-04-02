type QueryableClient = {
  query: (text: string, params?: unknown[]) => Promise<any>
}

function normalizeIds(ids: number[]): number[] {
  return [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))].sort((a, b) => a - b)
}

export async function lockOrderMutation(
  client: QueryableClient,
  tenantId: string,
  orderId: number
): Promise<void> {
  if (!Number.isInteger(orderId) || orderId <= 0) return
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1), $2)', [tenantId, -orderId])
}

export async function lockMaterialMutations(
  client: QueryableClient,
  tenantId: string,
  materialIds: number[]
): Promise<void> {
  const ids = normalizeIds(materialIds)
  if (ids.length === 0) return

  await client.query(
    `SELECT pg_advisory_xact_lock(hashtext($1), material_id)
     FROM unnest($2::int[]) AS lock_ids(material_id)
     ORDER BY material_id`,
    [tenantId, ids]
  )
}

export async function nextManualOrderNumber(
  client: QueryableClient,
  tenantId: string,
  createdAt: Date | string
): Promise<string> {
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt)
  const dateStr = createdDate.toISOString().slice(0, 10)
  const dayKey = dateStr.replace(/-/g, '')

  const counter = await client.query(
    `INSERT INTO order_number_counters (day, last_seq, tenant_id)
     VALUES ($1::date, 1, $2::uuid)
     ON CONFLICT (tenant_id, day) DO UPDATE
       SET last_seq = order_number_counters.last_seq + 1
     RETURNING last_seq`,
    [dateStr, tenantId]
  )

  const seq = Number(counter.rows[0]?.last_seq ?? 0)
  return `${dayKey}${String(seq).padStart(2, '0')}`
}
