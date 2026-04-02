import { Order } from '@/lib/domain/types'

export type PickingItemDraft = Partial<Pick<Order['items'][number], 'qtySeparated' | 'separatedWeight'>>

export type PickingDraftMap = Record<string, Record<string, PickingItemDraft>>

export function applyPickingDrafts(orders: Order[], drafts: PickingDraftMap): Order[] {
  return orders.map((order) => {
    const orderDraft = drafts[order.id]
    if (!orderDraft) return order

    return {
      ...order,
      items: order.items.map((item) => {
        const itemDraft = orderDraft[item.id]
        return itemDraft ? { ...item, ...itemDraft } : item
      }),
    }
  })
}

export function pruneResolvedPickingDrafts(orders: Order[], drafts: PickingDraftMap): PickingDraftMap {
  const nextDrafts: PickingDraftMap = {}

  for (const order of orders) {
    const orderDraft = drafts[order.id]
    if (!orderDraft) continue

    const nextOrderDraft: Record<string, PickingItemDraft> = {}
    for (const item of order.items) {
      const itemDraft = orderDraft[item.id]
      if (!itemDraft) continue

      const nextItemDraft: PickingItemDraft = { ...itemDraft }
      if (itemDraft.qtySeparated === item.qtySeparated) delete nextItemDraft.qtySeparated
      if (itemDraft.separatedWeight === item.separatedWeight) delete nextItemDraft.separatedWeight

      if (Object.keys(nextItemDraft).length > 0) {
        nextOrderDraft[item.id] = nextItemDraft
      }
    }

    if (Object.keys(nextOrderDraft).length > 0) {
      nextDrafts[order.id] = nextOrderDraft
    }
  }

  return nextDrafts
}
