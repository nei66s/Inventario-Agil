import { unstable_cache } from 'next/cache'
import { query } from '../db'
import { logRepoPerf } from './perf'
import {
  InventoryReceipt,
  Material,
  Notification,
  Order,
  OrderItem,
  OrderStatus,
  ProductionTask,
  ProductionTaskStatus,
  StockBalance,
  StockReservation,
  User,
} from '../pilot/types'

const statusMap: Record<string, OrderStatus> = {
  draft: 'RASCUNHO',
  rascunho: 'RASCUNHO',
  aberto: 'ABERTO',
  'em_picking': 'EM_PICKING',
  'em picking': 'EM_PICKING',
  'em-picking': 'EM_PICKING',
  'saída finalizada': 'SAIDA_CONCLUIDA',
  'saida_concluida': 'SAIDA_CONCLUIDA',
  'saida-concluida': 'SAIDA_CONCLUIDA',
  finalizado: 'FINALIZADO',
  cancelado: 'CANCELADO',
}

function normalizeStatus(status?: string | null): OrderStatus {
  if (!status) return 'ABERTO'
  const normalized = String(status).trim().toLowerCase()
  return statusMap[normalized] ?? (normalized.toUpperCase() as OrderStatus)
}

function computeReadiness(items: OrderItem[]) {
  const totalRequested = items.reduce((acc, item) => acc + (item.qtyRequested ?? 0), 0)
  const totalReserved = items.reduce((acc, item) => acc + (item.qtyReservedFromStock ?? 0), 0)
  if (totalReserved <= 0) return 'NOT_READY'
  if (totalReserved >= totalRequested) return 'READY_FULL'
  return 'READY_PARTIAL'
}

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

type OrderRow = {
  order_id: number
  order_number: string | null
  status: string | null
  total: string | number | null
  created_at: Date | string
  trashed_at: Date | string | null
  item_id: number | null
  material_id: number | null
  quantity: string | number | null
  unit_price: string | number | null
  material_name: string | null
  material_unit: string | null
}

type ProductionTaskRow = {
  id: number
  order_id: number
  material_id: number
  qty_to_produce: string | number
  status: ProductionTaskStatus
  created_at: string
  updated_at: string
  order_number: string | null
  material_name: string | null
}

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

type UserRow = {
  id: string
  name: string
  email: string
  role: User['role']
  avatar_url: string | null
}

export type DashboardData = {
  orders: Order[]
  productionTasks: ProductionTask[]
  materials: Material[]
  stockBalances: StockBalance[]
  stockReservations: StockReservation[]
  users: User[]
  inventoryReceipts: InventoryReceipt[]
  notifications: Notification[]
}

async function loadOrders(): Promise<{ items: Order[]; queryMs: number }> {
  const res = await query<OrderRow>(
    `SELECT
       o.id AS order_id,
       o.order_number,
       o.status,
       o.total,
       o.created_at,
       o.trashed_at,
       oi.id AS item_id,
       oi.material_id,
       oi.quantity,
       oi.unit_price,
       m.name AS material_name,
       m.unit AS material_unit
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN materials m ON m.id = oi.material_id
     ORDER BY o.created_at ASC`
  )

  const map = new Map<number, Order>()
  const dayCounters = new Map<string, number>()
  for (const row of res.rows) {
    const oid = Number(row.order_id)
    let orderNumberStored: string | null = null
    if (row.order_number) orderNumberStored = String(row.order_number)
    if (!map.has(oid)) {
      const created = row.created_at ? new Date(row.created_at) : new Date()
      const day = created.toISOString().slice(0, 10)
      const dayKey = day.replace(/-/g, '')
      if (orderNumberStored && /^\d{8}\d+$/.test(orderNumberStored)) {
        const storedDay = orderNumberStored.slice(0, 8)
        const storedSeq = Number(orderNumberStored.slice(8)) || 0
        const prevStored = dayCounters.get(storedDay) ?? 0
        if (storedSeq > prevStored) dayCounters.set(storedDay, storedSeq)
      }
      const prev = dayCounters.get(dayKey) ?? 0
      const seq = prev + 1
      dayCounters.set(dayKey, seq)
      const orderNumber = orderNumberStored ?? `${dayKey}${String(seq).padStart(2, '0')}`
      const normalizedStatus = normalizeStatus(row.status)

      map.set(oid, {
        id: `O-${oid}`,
        orderNumber,
        clientId: '',
        clientName: '',
        status: normalizedStatus,
        readiness: 'NOT_READY',
        orderDate: created.toISOString(),
        dueDate: created.toISOString(),
        createdBy: '',
        volumeCount: 1,
        items: [],
        auditTrail: [],
        labelPrintCount: 0,
        total: Number(row.total ?? 0),
        trashedAt: row.trashed_at ? (new Date(row.trashed_at).toISOString?.() ?? String(row.trashed_at)) : null,
      })
    }
    if (row.item_id) {
      const order = map.get(oid)!
      const qtyRequested = Number(row.quantity ?? 0)
      const qtyToProduce = 0
      const qtyReservedFromStock = Math.max(0, qtyRequested - qtyToProduce)
      order.items.push({
        id: `itm-${row.item_id}`,
        materialId: row.material_id ? `M-${row.material_id}` : `M-${row.item_id}`,
        materialName: row.material_name || '',
        uom: row.material_unit || 'EA',
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
  orders.forEach((order) => {
    order.volumeCount = Math.max(1, order.items.length)
    order.readiness = computeReadiness(order.items)
  })

  return { items: orders, queryMs: res.queryTimeMs }
}

async function loadProductionTasks(): Promise<{ items: ProductionTask[]; queryMs: number }> {
  const res = await query<ProductionTaskRow>(
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

  const items = res.rows.map((row) => ({
    id: `PT-${row.id}`,
    orderId: `O-${row.order_id}`,
    materialId: `M-${row.material_id}`,
    orderNumber: row.order_number || `O-${row.order_id}`,
    materialName: row.material_name || `M-${row.material_id}`,
    qtyToProduce: Number(row.qty_to_produce ?? 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return { items, queryMs: res.queryTimeMs }
}

async function loadMaterialsWithStock(): Promise<{ materials: Material[]; stockBalances: StockBalance[]; queryMs: number }> {
  const res = await query<MaterialStockRow>(
    `SELECT
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
         SELECT SUM(
           GREATEST(0::NUMERIC, req.requested_qty - COALESCE(pt.qty_to_produce, 0::NUMERIC))
         )
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
  )

  const materials = res.rows.map((row) => {
    const colorOptionsRaw = parseJson<unknown>(row.color_options, [])
    const metadataRaw = parseJson<Record<string, unknown>>(row.metadata, {})
    const metadata = Object.fromEntries(
      Object.entries(metadataRaw).map(([key, value]) => [key, String(value ?? '')])
    ) as Record<string, string>

    return {
      id: `M-${row.id}`,
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

  const stockBalances = res.rows.map((row) => ({
    materialId: `M-${row.id}`,
    onHand: Number(row.on_hand ?? 0),
    reservedTotal: Number(row.reserved_total ?? 0),
  }))

  return { materials, stockBalances, queryMs: res.queryTimeMs }
}

async function loadUsers(): Promise<{ items: User[]; queryMs: number }> {
  const res = await query<UserRow>(`
    SELECT id, name, email, role, avatar_url
    FROM users
    ORDER BY name ASC
  `)

  const users = res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
  }))

  return { items: users, queryMs: res.queryTimeMs }
}

async function createDashboardSnapshotInternal(): Promise<DashboardData> {
  const totalStart = process.hrtime.bigint()
  const [ordersResult, tasksResult, materialsResult, usersResult] = await Promise.all([
    loadOrders(),
    loadProductionTasks(),
    loadMaterialsWithStock(),
    loadUsers(),
  ])

  const serializationStart = process.hrtime.bigint()
  const dashboardData: DashboardData = {
    orders: ordersResult.items,
    productionTasks: tasksResult.items,
    materials: materialsResult.materials,
    stockBalances: materialsResult.stockBalances,
    stockReservations: [], // not persisted yet
    users: usersResult.items,
    inventoryReceipts: [],
    notifications: [],
  }
  const serializationMs = Number(process.hrtime.bigint() - serializationStart) / 1_000_000

  const totalMs = Number(process.hrtime.bigint() - totalStart) / 1_000_000
  logRepoPerf('repo:dashboardSnapshot', {
    queryMs: ordersResult.queryMs + tasksResult.queryMs + materialsResult.queryMs + usersResult.queryMs,
    serializationMs,
    totalMs,
    rows: dashboardData.orders.length + dashboardData.productionTasks.length,
  })

  return dashboardData
}

// Keep dashboard data fresh-ish (≈15s) while deferring repeated renders to the cached snapshot.
export const getDashboardSnapshot = unstable_cache(
  async () => createDashboardSnapshotInternal(),
  [],
  { revalidate: 15 }
)

export async function refreshDashboardSnapshot() {
  await getDashboardSnapshot.revalidate()
}
