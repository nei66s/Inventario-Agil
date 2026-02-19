"use client";

import { useEffect, useState } from 'react';
import { Smile, Meh } from 'lucide-react';

const SMILE_DURATION_MS = 1200;

export function DataRefreshIndicator() {
  const [beaming, setBeaming] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;

    const handle = () => {
      setBeaming(true);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setBeaming(false);
        timeoutId = null;
      }, SMILE_DURATION_MS);
    };

    window.addEventListener('app:data-refreshed', handle);
    return () => {
      window.removeEventListener('app:data-refreshed', handle);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const label = beaming ? 'Novos dados carregados' : 'Aguardando atualização';
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div
        aria-label={label}
        role="status"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/20 text-primary"
      >
        {beaming ? <Smile className="h-4 w-4" /> : <Meh className="h-4 w-4" />}
      </div>
    </div>
  );
}
