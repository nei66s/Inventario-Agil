import DashboardClient from './client-dashboard';
import { getDashboardSnapshot } from '@/lib/repository/dashboard';
import { getPeopleIndicators } from '@/lib/repository/people-indicators';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Carrega ambos em paralelo para economizar ~2-4 segundos de RTT
  const [peopleData, dashboardData] = await Promise.all([
    getPeopleIndicators('30d').catch(e => {
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
