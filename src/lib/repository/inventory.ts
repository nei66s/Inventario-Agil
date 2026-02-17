import { getMaterialsSnapshot, refreshMaterialsSnapshot } from './materials'
import { Material, StockBalance, StockReservation } from '../pilot/types'

export type InventorySnapshot = {
  materials: Material[]
  stockBalances: StockBalance[]
  stockReservations: StockReservation[]
}

export async function getInventorySnapshot(): Promise<InventorySnapshot> {
  const { materials, stockBalances } = await getMaterialsSnapshot()
  return {
    materials,
    stockBalances,
    stockReservations: [],
  }
}

export async function refreshInventorySnapshot(): Promise<void> {
  await refreshMaterialsSnapshot()
}
