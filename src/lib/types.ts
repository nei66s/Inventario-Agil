export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Manager' | 'Seller' | 'Input Operator' | 'Production Operator' | 'Picker';
};

export type Order = {
  id: string;
  customerName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Draft' | 'Confirmed' | 'In Production' | 'Picking' | 'Shipped' | 'Cancelled';
  orderDate: string;
};

export type Material = {
  id: string;
  name: string;
  uom: string;
  onHand: number;
  reserved: number;
  available: number;
};
