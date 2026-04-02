'use client';

import * as React from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { theme, toggleTheme, mounted } = useTheme();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-4 py-3 transition-all duration-200 sm:px-6',
        isScrolled
          ? 'border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/90'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="shrink-0 transition-transform hover:scale-[1.02]">
          <Logo isPlatform={true} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Funcionalidades
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Precos
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="h-10 w-10 rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          )}

          <Button variant="ghost" asChild className="hidden h-10 rounded-xl px-4 text-sm font-semibold sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            <Link href="/register">Comecar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
