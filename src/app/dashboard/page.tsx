'use client';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  AlertTriangle,
  Factory,
} from 'lucide-react';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'Janeiro', orders: 186 },
  { month: 'Fevereiro', orders: 305 },
  { month: 'Março', orders: 237 },
  { month: 'Abril', orders: 273 },
  { month: 'Maio', orders: 209 },
  { month: 'Junho', orders: 214 },
];

const chartConfig = {
  orders: {
    label: 'Pedidos',
    color: 'hsl(var(--primary))',
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">45,231</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUp className="h-4 w-4" />
              <span>+20.1% do último mês</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produção Pendente</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">+2,350</div>
             <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUp className="h-4 w-4" />
              <span>+180.1% do último mês</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens para Separação</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">+1,234</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUp className="h-4 w-4" />
              <span>+19% do último mês</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-500">5</div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Visão Geral de Pedidos</CardTitle>
            <CardDescription>
              Um resumo dos seus pedidos mensais recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  style={{ fontSize: '12px' }}
                />
                <YAxis style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Pedidos Recentes</CardTitle>
            <CardDescription>
              Uma lista dos pedidos de clientes mais recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-3">
                    <div className="font-medium">Liam Johnson</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      liam@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    <Badge variant="positive">Enviado</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">2023-06-23</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3">
                    <div className="font-medium">Olivia Smith</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      olivia@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    <Badge variant="default">Em Separação</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">2023-06-24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3">
                    <div className="font-medium">Noah Williams</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      noah@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    <Badge variant="positive">Enviado</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">2023-06-25</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3">
                    <div className="font-medium">Emma Brown</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      emma@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    <Badge variant="destructive">Cancelado</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">2023-06-26</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
