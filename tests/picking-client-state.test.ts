import test from 'node:test'
import assert from 'node:assert/strict'
import { Order } from '@/lib/domain/types'
import { applyPickingDrafts, pruneResolvedPickingDrafts } from '@/lib/frontend/picking-client-state'

function buildOrder(overrides?: Partial<Order>): Order {
  return {
    id: 'O-1',
    orderNumber: '2026040201',
    clientId: '',
    clientName: 'Cliente',
    status: 'EM_PICKING',
    readiness: 'READY_FULL',
    orderDate: '2026-04-02T12:00:00.000Z',
    dueDate: '2026-04-02T12:00:00.000Z',
    createdBy: 'usr-1',
    volumeCount: 1,
    items: [
      {
        id: 'itm-1',
        materialId: 'M-1',
        materialName: 'Material 1',
        uom: 'EA',
        color: 'Azul',
        qtyRequested: 10,
        qtyReservedFromStock: 10,
        qtyToProduce: 0,
        qtySeparated: 2,
        separatedWeight: 3,
        conditions: [],
      },
    ],
    auditTrail: [],
    labelPrintCount: 0,
    ...overrides,
  }
}

test('draft de picking impede snapshot antigo de sobrescrever quantidade digitada', () => {
  const orders = [buildOrder()]
  const drafts = {
    'O-1': {
      'itm-1': {
        qtySeparated: 7,
      },
    },
  }

  const merged = applyPickingDrafts(orders, drafts)
  assert.equal(merged[0].items[0].qtySeparated, 7)
})

test('draft de picking some apenas quando servidor confirma o mesmo valor', () => {
  const orders = [
    buildOrder({
      items: [
        {
          ...buildOrder().items[0],
          qtySeparated: 7,
          separatedWeight: 5,
        },
      ],
    }),
  ]

  const drafts = {
    'O-1': {
      'itm-1': {
        qtySeparated: 7,
        separatedWeight: 5,
      },
    },
  }

  const pruned = pruneResolvedPickingDrafts(orders, drafts)
  assert.deepEqual(pruned, {})
})
