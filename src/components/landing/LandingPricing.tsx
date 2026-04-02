import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const items = [
  'Pedidos, estoque e producao no mesmo sistema',
  'Painel para tenant e painel da plataforma',
  'Login por tenant com dominio corporativo',
  'Base pronta para crescer sem duplicar projeto',
];

export function LandingPricing() {
  return (
    <section id="pricing" className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
              Investimento
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Um plano simples para colocar a operacao em ordem.
            </h2>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
              Sem bloco exagerado de venda. A proposta aqui e mostrar o essencial: centralizar processo, ganhar
              previsibilidade e reduzir erro operacional.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Plano operacional
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Inventario Agil</h3>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">A partir de</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">R$ 300/mes</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sem taxa de implantacao e com estrutura pronta para escalar.
              </p>
              <Button asChild className="h-11 rounded-xl bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-700">
                <Link href="/register">
                  Comecar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
