"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSiteBranding } from '@/hooks/use-site-branding';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('seller@supplyflow.local');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);
  const { branding } = useSiteBranding();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast({
          title: 'Falha ao entrar',
          description: result.message ?? 'Credenciais invalidas',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sessao iniciada',
        description: `Perfil ativo: ${result.user.name} (${result.user.role}).`,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('login error', error);
      toast({
        title: 'Erro inesperado',
        description: 'Nao foi possivel entrar no momento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground shadow-lg shadow-slate-400/30 backdrop-blur">
        <div className="relative h-10 w-10">
          <Image
            src="/black-tower-x-transp.png"
            alt="Black Tower X"
            fill
            sizes="40px"
            className="object-contain"
            priority
          />
        </div>
        <span className="font-headline text-[11px] tracking-[0.45em]">Black Tower X</span>
      </div>

      <div className="flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-border/80 bg-card/80 p-6 shadow-2xl shadow-slate-200 backdrop-blur-lg sm:p-10">
        <div className="flex flex-col items-center gap-2 text-center text-sm uppercase tracking-[0.4em] text-muted-foreground">
          <div className="relative h-12 w-44">
            <Image
              src={branding.logoSrc}
              alt={`${branding.companyName} logo`}
              fill
              className="object-contain"
              sizes="160px"
              priority
              unoptimized
            />
          </div>
          <span className="font-semibold text-base text-card-foreground">{branding.companyName}</span>
          <span className="text-[10px] text-muted-foreground/80">{branding.platformLabel}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.55fr_360px]">
          <section className="space-y-6 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-inner shadow-slate-200">
            <h1 className="font-headline text-4xl text-card-foreground">Inventário Ágil</h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Plataforma pronta para simular demanda, produção e separação com KPIs acionáveis antes de integrar com
              ERPs ou sistemas legados. Personalizamos o fluxo para cada operação, mas mantemos o controle preto da
              Black Tower X.
            </p>
            <ul className="grid gap-3 text-sm leading-relaxed text-card-foreground/80 sm:grid-cols-2">
              <li className="rounded-xl border border-border/50 bg-white/70 px-4 py-3 shadow-sm">
                Reservas com TTL e sincronização em cache local.
              </li>
              <li className="rounded-xl border border-border/50 bg-white/70 px-4 py-3 shadow-sm">
                MRP com confirmações e justificativas manuais.
              </li>
              <li className="rounded-xl border border-border/50 bg-white/70 px-4 py-3 shadow-sm">
                Separadores com etiquetas e QR codes prontos.
              </li>
              <li className="rounded-xl border border-border/50 bg-white/70 px-4 py-3 shadow-sm">
                Dashboards integrados e em tempo real.
              </li>
            </ul>
          </section>

          <Card className="mx-auto max-w-sm shadow-xl">
            <CardHeader className="text-center">
              <Logo className="mx-auto mb-4" />
              <CardTitle className="font-headline text-3xl">Acesso Corporativo</CardTitle>
              <CardDescription>Acesse perfis de operador e gestão para testar o fluxo completo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="grid gap-5">
                <div className="grid gap-3">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
