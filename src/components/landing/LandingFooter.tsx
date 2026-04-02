import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/logo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Logo size="lg" isPlatform={true} />
          </Link>
          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Plataforma para organizar estoque, producao e separacao sem depender de processo espalhado.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <Link href="/privacy" className="text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Privacidade
          </Link>
          <Link href="/terms" className="text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Termos
          </Link>
          <Link href="/security" className="text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Seguranca
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 border-t border-slate-200 px-6 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Black Tower X. Todos os direitos reservados.</p>
        <Link
          href="mailto:contato@inventarioagil.com"
          className="inline-flex items-center gap-2 transition-colors hover:text-slate-900 dark:hover:text-white"
        >
          <Mail className="h-4 w-4" />
          contato@inventarioagil.com
        </Link>
      </div>
    </footer>
  );
}
