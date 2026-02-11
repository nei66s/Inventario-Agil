import { Order, Material, User } from './types';

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    name: 'Admin User',
    email: 'admin@supplychainflow.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@supplychainflow.com',
    role: 'Admin',
  },
  {
    id: 'usr_002',
    name: 'Manager User',
    email: 'manager@supplychainflow.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=manager@supplychainflow.com',
    role: 'Manager',
  },
];

export const mockOrders: Order[] = [
  {
    id: '2024-07-00001',
    customerName: 'Global Tech Inc.',
    priority: 'Urgent',
    status: 'Confirmed',
    orderDate: '2024-07-28',
  },
  {
    id: '2024-07-00002',
    customerName: 'Innovate Solutions',
    priority: 'High',
    status: 'In Production',
    orderDate: '2024-07-27',
  },
  {
    id: '2024-07-00003',
    customerName: 'Synergy Corp',
    priority: 'Medium',
    status: 'Picking',
    orderDate: '2024-07-26',
  },
  {
    id: '2024-07-00004',
    customerName: 'Quantum Industries',
    priority: 'Low',
    status: 'Shipped',
    orderDate: '2024-07-25',
  },
  {
    id: '2024-07-00005',
    customerName: 'Apex Enterprises',
    priority: 'Medium',
    status: 'Draft',
    orderDate: '2024-07-29',
  },
   {
    id: '2024-07-00006',
    customerName: 'Starlight Ventures',
    priority: 'High',
    status: 'Confirmed',
    orderDate: '2024-07-29',
  },
  {
    id: '2024-07-00007',
    customerName: 'Blue-sky Innovations',
    priority: 'Low',
    status: 'Shipped',
    orderDate: '2024-07-22',
  },
];

export const mockMaterials: Material[] = [
    { id: 'MAT-001', name: 'Micro-controller', uom: 'EA', onHand: 500, reserved: 150, available: 350 },
    { id: 'MAT-002', name: 'LED Screen 7"', uom: 'EA', onHand: 300, reserved: 50, available: 250 },
    { id: 'MAT-003', name: 'Plastic Casing - Model A', uom: 'EA', onHand: 1200, reserved: 400, available: 800 },
    { id: 'MAT-004', name: 'Lithium-Ion Battery', uom: 'EA', onHand: 800, reserved: 200, available: 600 },
    { id: 'MAT-005', name: 'Copper Wire', uom: 'M', onHand: 10000, reserved: 2500, available: 7500 },
];
