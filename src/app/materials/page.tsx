"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Boxes, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MaterialFormValues = {
  name: string;
  sku?: string;
  standardUom: string;
  minStock: number;
  reorderPoint: number;
  setupTimeMinutes: number;
  productionTimePerUnitMinutes: number;
  colorOptions: string;
};

export default function MaterialsPage() {
  const [db, setDb] = useState<any>({ materials: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/materials')
        const data = await res.json()
        if (mounted) setDb({ materials: data })
      } catch (err) {
        console.error('Failed to load materials', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);

  const defaultValues: MaterialFormValues = {
    name: '',
    sku: '',
    standardUom: 'EA',
    minStock: 0,
    reorderPoint: 0,
    setupTimeMinutes: 0,
    productionTimePerUnitMinutes: 0,
    colorOptions: '',
  };

  const { toast } = useToast();

  const form = useForm<MaterialFormValues>({ defaultValues });

  const openNew = () => {
    form.reset(defaultValues);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const m = db.materials.find((x: any) => x.id === id);
    if (!m) return;
    form.reset({
      sku: m.sku || '',
      name: m.name,
      standardUom: m.standardUom,
      minStock: m.minStock,
      reorderPoint: m.reorderPoint,
      setupTimeMinutes: m.setupTimeMinutes,
      productionTimePerUnitMinutes: m.productionTimePerUnitMinutes,
      colorOptions: (m.colorOptions || []).join(', '),
    });
    setEditing(m.id);
    setOpen(true);
  };

  const onSubmit = (values: MaterialFormValues) => {
    const payload = {
      name: values.name,
      standardUom: values.standardUom,
      minStock: Number(values.minStock),
      reorderPoint: Number(values.reorderPoint),
      setupTimeMinutes: Number(values.setupTimeMinutes),
      productionTimePerUnitMinutes: Number(values.productionTimePerUnitMinutes),
      colorOptions: values.colorOptions ? values.colorOptions.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    (async () => {
      try {
        if (editing) {
          // editing id like M-1
          const res = await fetch(`/api/materials/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, sku: form.getValues('sku') }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            const msg = err?.errors ? Object.values(err.errors).join('; ') : err?.error || 'Falha ao atualizar'
            toast({ title: 'Erro', description: String(msg), variant: 'destructive' })
            return
          }
          toast({ title: 'Material atualizado', description: 'As alterações foram salvas', variant: 'success' })
        } else {
          const res = await fetch('/api/materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, sku: form.getValues('sku') }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            const msg = err?.errors ? Object.values(err.errors).join('; ') : err?.error || 'Falha ao criar'
            toast({ title: 'Erro', description: String(msg), variant: 'destructive' })
            return
          }
          toast({ title: 'Material criado', description: 'Novo material salvo no banco', variant: 'success' })
        }
        // refresh list
        setLoading(true)
        const r2 = await fetch('/api/materials')
        const data = await r2.json()
        setDb({ materials: data })
      } catch (err) {
        console.error('Save failed', err)
        toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' })
      } finally {
        // Only close dialog if loading finished and no errors (list refreshed)
        setOpen(false)
        setLoading(false)
      }
    })()
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Remover este material?')) return
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err?.error || 'Falha ao remover'
        toast({ title: 'Erro', description: String(msg), variant: 'destructive' })
        return
      }
      toast({ title: 'Material removido', description: 'Material excluído com sucesso', variant: 'success' })
      setLoading(true)
      const r2 = await fetch('/api/materials')
      const data = await r2.json()
      setDb({ materials: data })
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao remover material', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="font-headline">Materiais</CardTitle>
            <CardDescription>Gerencie materiais cadastrados no sistema.</CardDescription>
          </div>
          <div>
            <Button onClick={openNew}>Novo material</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Estoque minimo</TableHead>
                <TableHead className="text-right">Ponto de pedido</TableHead>
                <TableHead className="text-right">Preparacao (min)</TableHead>
                <TableHead className="text-right">Producao por unidade (min)</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="border-none py-8">
                    <EmptyState title="Carregando materiais..." description="Aguarde enquanto os dados chegam do servidor." className="min-h-[120px]" />
                  </TableCell>
                </TableRow>
              ) : db.materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="border-none py-8">
                    <EmptyState icon={Boxes} title="Nenhum material cadastrado" description="Cadastre um novo material para iniciar o planejamento." className="min-h-[120px]" />
                  </TableCell>
                </TableRow>
              ) : (
                db.materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.id}</p>
                    </TableCell>
                    <TableCell>{m.standardUom}</TableCell>
                    <TableCell className="text-right">{m.minStock}</TableCell>
                    <TableCell className="text-right">{m.reorderPoint}</TableCell>
                    <TableCell className="text-right">{m.setupTimeMinutes}</TableCell>
                    <TableCell className="text-right">{m.productionTimePerUnitMinutes}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEdit(m.id)} aria-label={`Editar ${m.name}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMaterial(m.id)} aria-label={`Remover ${m.name}`}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar material' : 'Novo material'}</DialogTitle>
            <DialogDescription>Preencha os dados do material.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...form.register('name', { required: true })} />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>SKU (opcional)</FormLabel>
                <FormControl>
                  <Input {...form.register('sku')} />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <Input {...form.register('standardUom', { required: true })} />
                </FormControl>
                <FormMessage />
              </FormItem>

              <div className="grid grid-cols-2 gap-2">
                <FormItem>
                  <FormLabel>Estoque minimo</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('minStock')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel>Ponto de pedido</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('reorderPoint')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FormItem>
                  <FormLabel>Preparacao (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('setupTimeMinutes')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel>Producao por unidade (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('productionTimePerUnitMinutes')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>Opcoes de cor (separadas por virgula)</FormLabel>
                <FormControl>
                  <Input {...form.register('colorOptions')} />
                </FormControl>
                <FormMessage />
              </FormItem>

              <DialogFooter className="flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </>
  );
}
