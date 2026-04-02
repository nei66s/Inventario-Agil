import test from 'node:test'
import assert from 'node:assert/strict'
import { Order } from '@/lib/domain/types'
import { applyOrderDraft, pruneResolvedOrderDraft, type OrderDraft } from '@/lib/frontend/orders-client-state'

function buildOrder(overrides?: Partial<Order>): Order {
  return {
    id: 'O-1',
    orderNumber: '2026040201',
    clientId: '',
    clientName: 'Cliente Original',
    status: 'ABERTO',
    readiness: 'NOT_READY',
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
        qtyReservedFromStock: 0,
        qtyToProduce: 10,
        qtySeparated: 0,
        conditions: [{ key: 'Cor', value: 'Azul' }],
      },
    ],
    auditTrail: [],
    labelPrintCount: 0,
    ...overrides,
  }
}

test('draft local impede que snapshot antigo sobrescreva o ultimo valor digitado', () => {
  const staleServerOrder = buildOrder()
  const draft: OrderDraft = {
    clientName: 'Cliente Digitado',
    items: {
      'itm-1': {
        color: 'Verde',
        qtyRequested: 12,
      },
    },
  }

  const merged = applyOrderDraft(staleServerOrder, draft)

  assert.equal(merged.clientName, 'Cliente Digitado')
  assert.equal(merged.items[0].color, 'Verde')
  assert.equal(merged.items[0].qtyRequested, 12)
})

test('quando o servidor devolve o mesmo valor do draft, o rascunho e limpo', () => {
  const serverOrder = buildOrder({
    clientName: 'Cliente Digitado',
    items: [
      {
        ...buildOrder().items[0],
        color: 'Verde',
        qtyRequested: 12,
      },
    ],
  })

  const draft: OrderDraft = {
    clientName: 'Cliente Digitado',
    items: {
      'itm-1': {
        color: 'Verde',
        qtyRequested: 12,
      },
    },
  }

  const pruned = pruneResolvedOrderDraft(serverOrder, draft)
  assert.equal(pruned, undefined)
})

test('resposta antiga seguida de resposta nova mantem o ultimo valor do usuario vencendo', () => {
  const staleResponse = buildOrder()
  const draft: OrderDraft = {
    items: {
      'itm-1': {
        conditions: [{ key: 'Cor', value: 'Vermelho' }],
      },
    },
  }

  const mergedWithStaleResponse = applyOrderDraft(staleResponse, draft)
  assert.deepEqual(mergedWithStaleResponse.items[0].conditions, [{ key: 'Cor', value: 'Vermelho' }])

  const freshResponse = buildOrder({
    items: [
      {
        ...buildOrder().items[0],
        conditions: [{ key: 'Cor', value: 'Vermelho' }],
      },
    ],
  })

  const pruned = pruneResolvedOrderDraft(freshResponse, draft)
  assert.equal(pruned, undefined)
})
