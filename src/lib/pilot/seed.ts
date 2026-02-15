import { InventoryReceipt, PilotDb, RESERVATION_TTL_MS, Role } from './types';

const now = new Date('2026-02-11T10:00:00.000Z');

function iso(offsetMinutes: number): string {
  return new Date(now.getTime() + offsetMinutes * 60000).toISOString();
}

function orderNumber(index: number): string {
  // Use seed date (from `now`) and a small sequence based on index
  const date = now.toISOString().slice(0,10).replace(/-/g, '') // YYYYMMDD
  return `${date}${String(index + 1).padStart(2, '0')}`
}


const users: PilotDb['users'] = [
  {
    id: 'usr-admin',
    name: 'Amanda Admin',
    email: 'admin@supplyflow.local',
    role: 'Admin',
  },
  {
    id: 'usr-manager',
    name: 'Marcos Gestao',
    email: 'manager@supplyflow.local',
    role: 'Manager',
  },
  {
    id: 'usr-seller',
    name: 'Sofia Vendas',
    email: 'seller@supplyflow.local',
    role: 'Seller',
  },
  {
    id: 'usr-input',
    name: 'Iago Entrada',
    email: 'input@supplyflow.local',
    role: 'Input Operator',
  },
  {
    id: 'usr-production',
    name: 'Paulo Producao',
    email: 'production@supplyflow.local',
    role: 'Production Operator',
  },
  {
    id: 'usr-picker',
    name: 'Priscila Picking',
    email: 'picker@supplyflow.local',
    role: 'Picker',
  },
];

const clients: PilotDb['clients'] = [];

const uoms: PilotDb['uoms'] = [];

const materials: PilotDb['materials'] = [];

const stockBalances: PilotDb['stockBalances'] = [];

const sellerIds = users.filter((u) => u.role === 'Seller').map((u) => u.id);
const pickerIds = users.filter((u) => u.role === 'Picker').map((u) => u.id);

function makeOrder(index: number): PilotDb['orders'][number] {
  const client = clients[index % clients.length];
  const m1 = materials[index % materials.length];
  const m2 = materials[(index + 2) % materials.length];

  const qty1 = 20 + (index % 5) * 10;
  const qty2 = 15 + (index % 4) * 8;

  const reserved1 = Math.floor(qty1 * 0.6);
  const reserved2 = Math.floor(qty2 * 0.5);

  // diversify statuses for dashboard visualization
  const status = index % 6 === 0 ? 'FINALIZADO' : index % 4 === 0 ? 'EM_PICKING' : 'ABERTO';
  const readiness = status === 'FINALIZADO' ? 'READY_FULL' : status === 'EM_PICKING' ? 'READY_PARTIAL' : reserved1 + reserved2 > 0 ? 'READY_PARTIAL' : 'NOT_READY';

  // simulate separated quantities for some orders
  const separatedForFinalized = (requested: number) => requested;
  const separatedForPicking = (requested: number, reserved: number) => Math.min(requested, Math.floor(reserved * 0.6));

  const itm1Separated = status === 'FINALIZADO' ? separatedForFinalized(qty1) : status === 'EM_PICKING' ? separatedForPicking(qty1, reserved1) : 0;
  const itm2Separated = status === 'FINALIZADO' ? separatedForFinalized(qty2) : status === 'EM_PICKING' ? separatedForPicking(qty2, reserved2) : 0;

  return {
    id: `ord-${String(index).padStart(3, '0')}`,
    orderNumber: orderNumber(index),
    clientId: client.id,
    clientName: client.name,
    status,
    readiness,
    orderDate: iso(-index * 180),
    dueDate: iso(600 + index * 60),
    createdBy: sellerIds[index % sellerIds.length],
    pickerId: status === 'EM_PICKING' ? pickerIds[index % pickerIds.length] : undefined,
    volumeCount: 1 + (index % 3),
    labelPrintCount: 0,
    items: [
      {
        id: `itm-${index}-1`,
        materialId: m1.id,
        materialName: m1.name,
        uom: m1.standardUom,
        color: m1.colorOptions[0],
        qtyRequested: qty1,
        qtyReservedFromStock: reserved1,
        qtyToProduce: qty1 - reserved1,
        qtySeparated: itm1Separated,
        itemCondition: 'Sem avarias',
        conditions: [
          { key: 'Observacao', value: 'Sem avarias' }
        ],
      },
      {
        id: `itm-${index}-2`,
        materialId: m2.id,
        materialName: m2.name,
        uom: m2.standardUom,
        color: m2.colorOptions[0],
        qtyRequested: qty2,
        qtyReservedFromStock: reserved2,
        qtyToProduce: qty2 - reserved2,
        qtySeparated: itm2Separated,
        conditions: [],
      },
    ],
    auditTrail: [
      {
        id: `aud-${index}-0`,
        action: 'ORDER_CREATED',
        actor: 'Sofia Vendas',
        timestamp: iso(-index * 180),
        details: 'Pedido criado no piloto',
      },
    ],
  };
}

const orders: PilotDb['orders'] = [];

const stockReservations: PilotDb['stockReservations'] = [];

const productionTasks: PilotDb['productionTasks'] = [];

const inventoryReceipts: PilotDb['inventoryReceipts'] = [];

const notifications: PilotDb['notifications'] = [];

export function buildSeedData(): PilotDb {
  return {
    users,
    clients: [],
    uoms: [],
    uomConversions: [],
    materials: [],
    stockBalances: [],
    stockReservations: [],
    orders: [],
    productionTasks: [],
    inventoryReceipts: [],
    notifications: [],
    mrpSuggestions: [],
    metricsDaily: [],
  };
}

export const defaultCurrentUserRole: Role = 'Seller';
