'use client';

import * as React from 'react';
import { Factory, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { productionTaskStatusLabel } from '@/lib/pilot/i18n';
import { generateLabelPdf } from '@/lib/pilot/labels';
import { usePilotStore } from '@/lib/pilot/store';

type ProductionTask = {
  id: string;
  orderNumber: string;
  materialName: string;
  qtyToProduce: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  updatedAt: string;
  createdAt: string;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return String(err);
}

export default function ProductionPage() {
  const [tasks, setTasks] = React.useState<ProductionTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = React.useState<string | null>(null);
  const [busyLabelTaskId, setBusyLabelTaskId] = React.useState<string | null>(null);
  const orders = usePilotStore((state) => state.db.orders);
  const registerLabelPrint = usePilotStore((state) => state.registerLabelPrint);

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/production', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(errorMessage(err) || 'Falha ao carregar tarefas de producao');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const mutateTask = async (taskId: string, action: 'start' | 'complete') => {
    try {
      setBusyTaskId(taskId);
      const res = await fetch(`/api/production/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      await loadTasks();
    } catch (err: unknown) {
      setError(errorMessage(err) || 'Falha ao atualizar tarefa');
    } finally {
      setBusyTaskId(null);
    }
  };

  const handlePrintProductionLabel = async (task: ProductionTask) => {
    const order = orders.find((item) => item.id === task.orderId);
    if (!order) {
      setError('Pedido não encontrado para imprimir etiqueta.');
      return;
    }

    setBusyLabelTaskId(task.id);
    try {
      await generateLabelPdf(order, undefined, 'PRODUCTION_4x4');
      registerLabelPrint(order.id, 'PRODUCTION_4x4');
    } catch (err: unknown) {
      setError(errorMessage(err) || 'Falha ao imprimir etiqueta de produção');
    } finally {
      setBusyLabelTaskId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-headline flex items-center gap-2"><Factory className="h-5 w-5" /> Producao</CardTitle>
            <CardDescription>
              Tarefas de producao persistidas no banco. Iniciar e concluir atualizam status na tabela.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadTasks()} disabled={loading}>
            Recarregar
          </Button>
        </div>
      </CardHeader>
      {error ? (
        <CardHeader className="pt-0">
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Material</TableHead>
              <TableHead className="text-right">Qtd. para produzir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Carregando tarefas...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="border-none py-8">
                  <EmptyState icon={Factory} title="Sem tarefas de producao" description="Crie pedidos para gerar tarefas ou adicione tarefas na tabela production_tasks." className="min-h-[120px]" />
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.orderNumber}</TableCell>
                  <TableCell>{task.materialName}</TableCell>
                  <TableCell className="text-right">{task.qtyToProduce}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'DONE' ? 'positive' : task.status === 'IN_PROGRESS' ? 'warning' : 'outline'}>
                      {productionTaskStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={task.status !== 'PENDING' || busyTaskId === task.id}
                        onClick={() => mutateTask(task.id, 'start')}
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        disabled={task.status === 'DONE' || busyTaskId === task.id}
                        onClick={() => mutateTask(task.id, 'complete')}
                      >
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyLabelTaskId === task.id}
                        onClick={() => handlePrintProductionLabel(task)}
                        aria-label="Imprimir etiqueta 4x4"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
