import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />

        <section className="border-t border-slate-200/70 bg-slate-50 py-16 dark:border-slate-800/70 dark:bg-slate-900/40">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:px-10">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Quer colocar essa operacao para rodar com mais controle?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Uma home mais limpa, clara no modo claro e consistente no escuro, sem excesso de efeito visual.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-700"
                  asChild
                >
                  <Link href="/register">
                    Testar gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
      <WhatsAppButton />
    </div>
  );
}
