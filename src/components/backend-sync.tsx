"use client";

import { useEffect } from 'react';
import { usePilotStore } from '@/lib/pilot/store';
import { PILOT_STORAGE_KEY } from '@/lib/pilot/contracts';

export default function BackendSync() {
  const sync = usePilotStore((state) => state.syncWithBackend);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (async () => {
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) {
          await sync();
          return;
        }
        const data = await res.json();

        // Merge into localStorage so the LocalPilotRepository.load() sees server data
        const key = PILOT_STORAGE_KEY;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        existing.materials = data.materials || [];
        existing.stockBalances = data.stockBalances || [];
        existing.stockReservations = data.stockReservations || [];
        localStorage.setItem(key, JSON.stringify(existing));

        // Update in-memory store as well
        await sync();
      } catch (err) {
        console.error('BackendSync failed', err);
        await sync();
      }
    })();
  }, [sync]);

  return null;
}
