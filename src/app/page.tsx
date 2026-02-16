'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePilotStore } from '@/lib/pilot/store';
import { Role } from '@/lib/pilot/types';
import { roleLabel } from '@/lib/pilot/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setCurrentRole = usePilotStore((state) => state.setCurrentRole);

  const [email, setEmail] = useState('demo@supplyflow.local');
  const [password, setPassword] = useState('demo');
  const [role, setRole] = useState<Role>('Seller');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setCurrentRole(role);
    toast({
      title: 'Sessao de demonstracao iniciada',
      description: `Perfil ativo: ${roleLabel(role)}.`,
    });
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <main className="w-full">
        <section className="mx-auto mb-8 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.6fr,1fr] lg:items-center rounded-[32px] border border-border bg-background p-8 shadow-sm">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Control Tower · Inventario Agil</p>
              <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Inventario Agil para Cadeia de Suprimentos
              </h1>
              <p className="text-lg text-muted-foreground/90">
                Gerencie pedidos, producao e picking com visibilidade em tempo real e fluxos de trabalho otimizados.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.push('/dashboard')} className="rounded-full px-6 py-3 text-base font-semibold">
                  Abrir Painel
                </Button>
                <Button
                  onClick={() => router.push('/materials')}
                  variant="outline"
                  className="rounded-full px-6 py-3 text-base font-semibold"
                >
                  Explorar materiais
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <Logo className="w-32 h-32 text-primary" />
            </div>
          </div>
        </section>


        <div className="w-full max-w-md mx-auto">
          <Card className="mx-auto max-w-sm border border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="text-center">
              <Logo className="mx-auto mb-4" />
              <CardTitle className="font-headline text-3xl">Inventario Agil</CardTitle>
              <CardDescription className="text-muted-foreground">
                Acesso corporativo para simulacao de fluxos da cadeia de suprimentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="grid gap-5">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-muted-foreground">
                    E-mail
                  </Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-muted-foreground">
                    Senha
                  </Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-3 border-t border-border/70 pt-4">
                  <Label className="text-muted-foreground">Perfil para simular</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">{roleLabel('Admin')}</SelectItem>
                      <SelectItem value="Manager">{roleLabel('Manager')}</SelectItem>
                      <SelectItem value="Seller">{roleLabel('Seller')}</SelectItem>
                      <SelectItem value="Input Operator">{roleLabel('Input Operator')}</SelectItem>
                      <SelectItem value="Production Operator">{roleLabel('Production Operator')}</SelectItem>
                      <SelectItem value="Picker">{roleLabel('Picker')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
