'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { usePilotStore } from '@/lib/pilot/store';
import { formatDate } from '@/lib/utils';

type ReportRow = {
  key: string;
  pacote: string;
  operador: string;
  codigo: string;
  produto: string;
  descricao: string;
  cor: string;
  pedido: string;
  peso: string;
  data: string;
};

export default function ReportPage() {
  const orders = usePilotStore((state) => state.db.orders);
  const materials = usePilotStore((state) => state.db.materials);

  const rows = React.useMemo<ReportRow[]>(() => {
    const filtered = orders.filter((order) => ['SAIDA_CONCLUIDA', 'FINALIZADO'].includes(order.status));
    const mapped: ReportRow[] = [];

    filtered.forEach((order) => {
      const operator = order.auditTrail.find((entry) => entry.action === 'PICKING_COMPLETED')?.actor ?? order.auditTrail[0]?.actor ?? '---';
      const dateLabel = order.dueDate || order.orderDate;

      order.items.forEach((item) => {
        const material = materials.find((mat) => mat.id === item.materialId);
        const metadata = material?.metadata ?? {};
        const codigo = metadata['Código'] || material?.sku || '-';
        const descricao = material?.description || metadata['Tipos'] || metadata['Produto'] || '-';
        const cor = item.color || metadata['FibraCor'] || metadata['CordaCor'] || metadata['TricoCor'] || metadata['Fiocor'] || '-';
        const pesoValue = Math.max(item.qtySeparated, item.qtyRequested);
        const peso = `${pesoValue} ${item.uom}`;

        mapped.push({
          key: `${order.id}-${item.id}`,
          pacote: order.orderNumber,
          operador: operator,
          codigo,
          produto: item.materialName,
          descricao,
          cor,
          pedido: order.clientName || order.orderNumber,
          peso,
          data: formatDate(dateLabel),
        });
      });
    });

    return mapped;
  }, [orders, materials]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-headline">Relatório</CardTitle>
          <CardDescription>Registro das saídas concluídas, inspirado na planilha antiga.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pacote</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Peso/metros</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="border-none">
                  <EmptyState title="Relatório vazio" description="Complete alguns picks para gerar as linhas do relatório." className="min-h-[180px]" />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.pacote}</TableCell>
                  <TableCell>{row.operador}</TableCell>
                  <TableCell>{row.codigo}</TableCell>
                  <TableCell>{row.produto}</TableCell>
                  <TableCell>{row.descricao}</TableCell>
                  <TableCell>{row.cor}</TableCell>
                  <TableCell>{row.pedido}</TableCell>
                  <TableCell>{row.peso}</TableCell>
                  <TableCell>{row.data}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
