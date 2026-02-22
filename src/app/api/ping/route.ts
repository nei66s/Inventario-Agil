import { NextResponse } from 'next/server';
import { getJsonCache, setJsonCache } from '@/lib/cache';

const TEST_KEY = 'cache-ping-test';

export async function GET() {
  const payload = {
    message: 'ping-test',
    timestamp: Date.now(),
  };
  try {
    await setJsonCache(TEST_KEY, payload);
    const cached = await getJsonCache<typeof payload>(TEST_KEY);
    console.log('[cache][redis] ping read value', cached);
    return NextResponse.json({
      pong: true,
      timestamp: Date.now(),
      cacheValue: cached,
    });
  } catch (error) {
    console.error('[cache][redis] ping failed', error);
    return NextResponse.json(
      {
        pong: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
