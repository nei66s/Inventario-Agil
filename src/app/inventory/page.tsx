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
  const getStatusVariant = (available: number) => {
    if (available <= 0) return 'destructive';
    if (available <= 100) return 'warning';
    return 'positive';
  };

  const getStatusText = (available: number) => {
    if (available <= 0) return 'Sem Estoque';
    if (available <= 100) return 'Estoque Baixo';
    return 'Em Estoque';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Estoque</CardTitle>
        <CardDescription>
          Monitore e gerencie os níveis de estoque de seus materiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Material</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Unid. Medida</TableHead>
              <TableHead className="text-right">Em Mãos</TableHead>
              <TableHead className="text-right">Reservado</TableHead>
              <TableHead className="text-right">Disponível</TableHead>
               <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-mono py-3">{material.id}</TableCell>
                <TableCell className="font-medium py-3">{material.name}</TableCell>
                <TableCell className="py-3">{material.uom}</TableCell>
                <TableCell className="text-right py-3">{material.onHand}</TableCell>
                <TableCell className="text-right py-3">{material.reserved}</TableCell>
                <TableCell className="text-right font-bold py-3">{material.available}</TableCell>
                <TableCell className="text-center py-3">
                  <Badge variant={getStatusVariant(material.available)}>
                    {getStatusText(material.available)}
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
