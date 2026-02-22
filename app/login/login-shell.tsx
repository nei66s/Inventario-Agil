'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export type LoginBranding = {
  companyName: string;
  platformLabel: string;
  logoSrc: string;
};

type LoginShellProps = {
  branding: LoginBranding;
};

export function LoginShell({ branding }: LoginShellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [email, setEmail] = useState('seller@supplyflow.local');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);

  const themeIcon = useMemo(() => (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />), [theme]);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme =
      saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('theme', theme);
    try {
      document.cookie = `theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    } catch (error) {
      console.error(error);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

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
    <div className="relative min-h-screen">
      <div className="fixed top-6 right-6 z-20">
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full p-0"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onClick={toggleTheme}
        >
          {themeIcon}
        </Button>
      </div>

      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-white px-4 py-12">
        <div className="w-full max-w-md space-y-8 pt-6">
          <div className="flex flex-col items-center gap-3 text-center text-base uppercase tracking-[0.4em] text-muted-foreground">
            <div className="relative h-24 w-24">
              <Image
                src={branding.logoSrc}
                alt={`${branding.companyName} logo`}
                fill
                sizes="160px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <span className="font-semibold text-base">{branding.companyName}</span>
            <span className="text-[10px] opacity-80">{branding.platformLabel}</span>
          </div>

          <Card className="mx-auto max-w-sm shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex flex-col items-center gap-2 text-center text-sm uppercase tracking-[0.4em] text-muted-foreground">
                <div className="relative h-12 w-44">
                  <Image
                    src={branding.logoSrc}
                    alt={`${branding.companyName} logo`}
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <span className="font-semibold text-base text-muted-foreground">{branding.companyName}</span>
              </div>
              <CardTitle className="font-headline text-3xl">Inventário Ágil</CardTitle>
              <CardDescription>Acesso corporativo para simulacao de fluxos da cadeia de suprimentos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading} size="lg">
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
