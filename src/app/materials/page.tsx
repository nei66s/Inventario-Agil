"use client";

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
import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Boxes, ChevronDown, ChevronUp, Edit, Trash, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

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

const defaultConditionCategories = ['Fibra', 'FibraCor', 'Corda', 'CordaCor', 'Trico', 'TricoCor', 'Fio', 'Fiocor'];

export default function MaterialsPage() {
  const [db, setDb] = useState<any>({ materials: [] });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [conditionCategories, setConditionCategories] = useState<string[]>(defaultConditionCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [conditionOptions, setConditionOptions] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(defaultConditionCategories.map((key) => [key, []]))
  );
  const [newConditionInput, setNewConditionInput] = useState<Record<string, string>>(
    Object.fromEntries(defaultConditionCategories.map((key) => [key, '']))
  );
  const [hiddenConditions, setHiddenConditions] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(defaultConditionCategories.map((key) => [key, new Set<string>()]))
  );
  const [manualConditionAdditions, setManualConditionAdditions] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(defaultConditionCategories.map((key) => [key, []]))
  );
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const toast = useToast();
  const form = useForm<MaterialFormValues>({ defaultValues });
  const mountedRef = useRef(true);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (!mountedRef.current) return;
      setDb({ materials: data });
    } catch (err) {
      console.error('Failed to load materials', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const openNew = () => {
    form.reset(defaultValues);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const material = db.materials.find((x: any) => x.id === id);
    if (!material) return;
    form.reset({
      sku: material.sku || '',
      name: material.name,
      standardUom: material.standardUom,
      minStock: material.minStock,
      reorderPoint: material.reorderPoint,
      setupTimeMinutes: material.setupTimeMinutes,
      productionTimePerUnitMinutes: material.productionTimePerUnitMinutes,
      colorOptions: (material.colorOptions || []).join(', '),
    });
    setEditing(material.id);
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
      colorOptions: values.colorOptions
        ? values.colorOptions.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    (async () => {
      try {
        if (editing) {
          const res = await fetch(`/api/materials/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, sku: form.getValues('sku') }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err?.errors ? Object.values(err.errors).join('; ') : err?.error || 'Falha ao atualizar';
            toast({ title: 'Erro', description: String(msg), variant: 'destructive' });
            return;
          }
          toast({ title: 'Material atualizado', description: 'As alterações foram salvas', variant: 'success' });
        } else {
          const res = await fetch('/api/materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, sku: form.getValues('sku') }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err?.errors ? Object.values(err.errors).join('; ') : err?.error || 'Falha ao criar';
            toast({ title: 'Erro', description: String(msg), variant: 'destructive' });
            return;
          }
          toast({ title: 'Material criado', description: 'Novo material salvo no banco', variant: 'success' });
        }
        await fetchMaterials();
      } catch (err) {
        console.error('Save failed', err);
        toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
      } finally {
        setOpen(false);
      }
    })();
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Remover este material?')) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error || 'Falha ao remover';
        toast({ title: 'Erro', description: String(msg), variant: 'destructive' });
        return;
      }
      toast({ title: 'Material removido', description: 'Material excluído com sucesso', variant: 'success' });
      await fetchMaterials();
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao remover material', variant: 'destructive' });
    }
  };
  useEffect(() => {
    const aggregated: Record<string, Set<string>> = {};
    conditionCategories.forEach((key) => {
      aggregated[key] = new Set();
    });

    db.materials.forEach((material: any) => {
      const metadata = material.metadata ?? {};
      conditionCategories.forEach((key) => {
        const raw = metadata[key] ?? metadata[key.toLowerCase()];
        if (Array.isArray(raw)) {
          raw.forEach((value) => {
            if (value) aggregated[key].add(value);
          });
        } else if (typeof raw === 'string' && raw) {
          aggregated[key].add(raw);
        }
      });
    });

    const merged = Object.fromEntries(
      conditionCategories.map((key) => {
        const visible = Array.from(aggregated[key] ?? new Set()).filter(
          (value) => !hiddenConditions[key]?.has(value)
        );
        const additions = (manualConditionAdditions[key] ?? []).filter(
          (value) => !visible.includes(value)
        );
        return [key, [...visible, ...additions]];
      })
    );

    setConditionOptions(merged);
  }, [db.materials, hiddenConditions, manualConditionAdditions, conditionCategories]);

  const handleRemoveCondition = (key: string, value: string) => {
    setHiddenConditions((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      next[key].add(value);
      return next;
    });
    setManualConditionAdditions((prev) => ({
      ...prev,
      [key]: prev[key]?.filter((item) => item !== value) ?? [],
    }));
  };

  const handleAddCondition = (key: string) => {
    const value = newConditionInput[key]?.trim();
    if (!value) return;

    setManualConditionAdditions((prev) => {
      if (prev[key]?.includes(value)) return prev;
      return {
        ...prev,
        [key]: [...(prev[key] ?? []), value],
      };
    });

    setHiddenConditions((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      next[key].delete(value);
      return next;
    });

    setNewConditionInput((prev) => ({ ...prev, [key]: '' }));
  };

  const registerCategory = (name: string) => {
    setHiddenConditions((prev) => ({ ...prev, [name]: new Set<string>() }));
    setManualConditionAdditions((prev) => ({ ...prev, [name]: [] }));
    setNewConditionInput((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCreateCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = newCategoryName.trim();
    if (!normalized) {
      setCategoryError('Nome obrigatório');
      return;
    }
    if (conditionCategories.some((category) => category.toLowerCase() === normalized.toLowerCase())) {
      setCategoryError('Categoria já existe');
      return;
    }
    setConditionCategories((prev) => [...prev, normalized]);
    registerCategory(normalized);
    setExpandedCategory(normalized);
    setCategoryDialogOpen(false);
    setNewCategoryName('');
    setCategoryError('');
  };

  const toggleCategoryDetail = (key: string) => {
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const detailItems = expandedCategory ? conditionOptions[expandedCategory] ?? [] : [];

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
                <TableHead>Operador</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Estoque mínimo</TableHead>
                <TableHead className="text-right">Ponto de pedido</TableHead>
                <TableHead className="text-right">Preparação (min)</TableHead>
                <TableHead className="text-right">Produção por unidade (min)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="border-none py-8">
                    <EmptyState title="Carregando materiais..." description="Aguarde enquanto os dados chegam do servidor." className="min-h-[120px]" />
                  </TableCell>
                </TableRow>
              ) : db.materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="border-none py-8">
                    <EmptyState icon={Boxes} title="Nenhum material cadastrado" description="Cadastre um novo material para iniciar o planejamento." className="min-h-[120px]" />
                  </TableCell>
                </TableRow>
              ) : (
                db.materials.map((m: any) => {
                  const metadata = m.metadata ?? {};
                  const getMeta = (key: string) => metadata[key] || metadata[key.toLowerCase()] || '';
                  const codigo = getMeta('Código') || getMeta('Codigo');
                  const tipo = getMeta('Tipos') || getMeta('Produto');
                  const dataValue = getMeta('Data') || getMeta('data');

                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.sku}</p>
                      </TableCell>
                      <TableCell>{getMeta('Operador')}</TableCell>
                      <TableCell>{codigo}</TableCell>
                      <TableCell>{tipo}</TableCell>
                      <TableCell>{dataValue ? formatDate(dataValue) : ''}</TableCell>
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
                  );
                })
              )}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="font-headline">Pré-condições</CardTitle>
                <CardDescription>Categorias globais com os valores possíveis.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setCategoryDialogOpen(true)}>
                Criar condição
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {conditionCategories.map((key) => {
                  const values = conditionOptions[key] ?? [];
                  const isExpanded = expandedCategory === key;
                  return (
                    <div key={key} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="font-semibold">{key}</span>
                        <span>
                          {values.length} item{values.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toggleCategoryDetail(key)}
                        aria-label={`${isExpanded ? 'Fechar' : 'Abrir'} detalhes de ${key}`}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  );
                })}
              </div>
              {expandedCategory && (
                <div className="mt-4 rounded-2xl border border-border bg-background p-4 shadow-inner">
                  <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{expandedCategory}</p>
                      <p className="text-sm text-muted-foreground">Edite os itens dessa pré-condição.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newConditionInput[expandedCategory]}
                        onChange={(event) =>
                          setNewConditionInput((prev) => ({ ...prev, [expandedCategory]: event.target.value }))
                        }
                        placeholder="Adicionar item"
                        className="h-8 text-xs"
                      />
                      <Button size="sm" onClick={() => handleAddCondition(expandedCategory)}>
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {detailItems.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground">Nenhum item cadastrado</p>
                    ) : (
                      detailItems.map((value) => (
                        <div
                          key={`${expandedCategory}-${value}`}
                          className="flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-2 py-1 text-[12px] text-muted-foreground"
                        >
                          <span>{value}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCondition(expandedCategory, value)}
                            aria-label={`Remover ${value}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                  <FormLabel>Estoque mínimo</FormLabel>
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
                  <FormLabel>Preparação (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('setupTimeMinutes')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel>Produção por unidade (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('productionTimePerUnitMinutes')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>Opções de cor (separadas por vírgula)</FormLabel>
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
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar pré-condição</DialogTitle>
              <DialogDescription>Defina uma nova categoria global de valores.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Nome da categoria</label>
                <Input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
                {categoryError && <p className="text-xs text-destructive">{categoryError}</p>}
              </div>
              <DialogFooter className="flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Criar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
  );
}
