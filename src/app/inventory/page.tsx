import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockMaterials } from '@/lib/data';

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>
          Monitor and manage your material stock levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
               <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-mono">{material.id}</TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.uom}</TableCell>
                <TableCell className="text-right">{material.onHand}</TableCell>
                <TableCell className="text-right">{material.reserved}</TableCell>
                <TableCell className="text-right font-bold">{material.available}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={material.available > 100 ? 'secondary' : 'destructive'}>
                    {material.available > 100 ? 'In Stock' : 'Low Stock'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
