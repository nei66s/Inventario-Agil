'use client';

import * as React from 'react';
import { Factory } from 'lucide-react';
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
import { usePilotStore } from '@/lib/pilot/store';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { productionTaskStatusLabel } from '@/lib/pilot/i18n';

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
  const localTasks = usePilotStore((state) => state.db.productionTasks);
  const startLocalTask = usePilotStore((state) => state.startProductionTask);
  const completeLocalTask = usePilotStore((state) => state.completeProduction);
  const [serverTasks, setServerTasks] = React.useState<ProductionTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = React.useState<string | null>(null);

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/production', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();
      setServerTasks(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(errorMessage(err) || 'Falha ao carregar tarefas de producao');
      setServerTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasks = React.useMemo(() => {
    const all = [...serverTasks];
    for (const task of localTasks) {
      // Keep only local draft tasks; persisted orders must come from API.
      if (/^O-\d+$/.test(String(task.orderId))) continue;
      if (!all.some((item) => item.id === task.id)) {
        all.push({
          id: task.id,
          orderNumber: task.orderNumber,
          materialName: task.materialName,
          qtyToProduce: task.qtyToProduce,
          status: task.status,
          updatedAt: task.updatedAt,
          createdAt: task.createdAt,
        });
      }
    }
    return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [serverTasks, localTasks]);

  const mutateTask = async (taskId: string, action: 'start' | 'complete') => {
    try {
      setBusyTaskId(taskId);
      if (taskId.startsWith('pt-')) {
        if (action === 'start') startLocalTask(taskId);
        if (action === 'complete') completeLocalTask(taskId);
        return;
      }
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
