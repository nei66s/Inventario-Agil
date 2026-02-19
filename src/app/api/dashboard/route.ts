import { NextResponse } from 'next/server';

import {
  getDashboardSnapshot,
  refreshDashboardSnapshot,
} from '@/lib/repository/dashboard';

export async function GET() {
  await refreshDashboardSnapshot();
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot);
}
