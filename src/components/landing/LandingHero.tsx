'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const highlights = [
  'Reserva de estoque em tempo real',
  'MRP e producao no mesmo fluxo',
  'Operacao simples para equipe',
];

const metrics = [
  { label: 'Pedidos', value: 'Fluxo unico' },
  { label: 'Estoque', value: 'Tempo real' },
  { label: 'Equipe', value: 'Menos erro' },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-white pt-28 pb-16 dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.14),_transparent_55%)]" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Operacao mais previsivel
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Estoque, producao e picking em uma tela mais simples.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              O Inventario Agil conecta pedido, reserva, producao e separacao sem planilha paralela nem
              retrabalho manual.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-xl bg-slate-900 px-6 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              <Link href="/register">
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-slate-300 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Visao da operacao</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Tudo no mesmo fluxo</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Online
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800/80"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Menos tela, mais clareza</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    A landing agora comunica o produto sem excesso de efeito visual e continua legivel no modo
                    escuro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
