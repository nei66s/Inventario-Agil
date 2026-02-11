import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockOrders } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Manage customer orders and view their status.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={mockOrders}
          filterColumn="customerName"
          filterPlaceholder="Filter by customer..."
        />
      </CardContent>
    </Card>
  );
}
