import DashboardClient from './client-dashboard';
import { getDashboardSnapshot } from '@/lib/repository/dashboard';
import { getPeopleIndicators } from '@/lib/repository/people-indicators';

export const dynamic = 'force-dynamic';

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const normalizePeoplePeriod = (value?: string | string[]) => {
  const period = Array.isArray(value) ? value[0] : value;
  return period === '7d' || period === '30d' || period === 'all' ? period : '30d';
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const peoplePeriod = normalizePeoplePeriod(resolvedSearchParams?.peoplePeriod);

  // Carrega ambos em paralelo para economizar ~2-4 segundos de RTT
  const [peopleData, dashboardData] = await Promise.all([
    getPeopleIndicators(peoplePeriod).catch(e => {
      console.error('[dashboard] Failed to load people indicators', e);
      return null;
    }),
    getDashboardSnapshot()
  ]).catch(err => {
    console.error('[dashboard] Critical failure', err);
    throw err; // Next.js error boundary will handle this
  });

  return <DashboardClient data={dashboardData} peopleData={peopleData} />;
}
