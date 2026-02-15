"use client";

import { useState } from 'react';
import { usePilotStore } from '@/lib/pilot/store';
import { Button } from '@/components/ui/button';

export default function SyncFab() {
  const sync = usePilotStore((state) => state.syncWithBackend);
  const [busy, setBusy] = useState(false);

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 60 }}>
      <Button size="sm" onClick={async () => {
        try {
          setBusy(true);
          await sync();
        } catch (e) {
          console.error(e);
        } finally {
          setBusy(false);
        }
      }}>
        {busy ? 'Sincronizando...' : 'Sincronizar'}
      </Button>
    </div>
  );
}
