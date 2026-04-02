import { BarChart4, Bot, PackageCheck, Warehouse } from 'lucide-react';

const features = [
  {
    icon: Warehouse,
    title: 'Estoque confiavel',
    description: 'Saldo, reserva e disponibilidade ficam alinhados no mesmo lugar.',
  },
  {
    icon: Bot,
    title: 'MRP mais simples',
    description: 'Sugestoes para reposicao e producao sem depender de controle paralelo.',
  },
  {
    icon: PackageCheck,
    title: 'Picking mais seguro',
    description: 'Separacao guiada para reduzir erro operacional e retrabalho.',
  },
  {
    icon: BarChart4,
    title: 'Visao de operacao',
    description: 'Indicadores para acompanhar gargalo, demanda e produtividade.',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-b border-slate-200/70 bg-slate-50/80 py-16 dark:border-slate-800/70 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
            O que importa
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Os modulos principais em uma apresentacao mais objetiva.
          </h2>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            Menos promessa genérica e mais clareza sobre o que o sistema realmente resolve na rotina.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
