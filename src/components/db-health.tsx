"use client";

import * as React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function DbHealth() {
  const [status, setStatus] = React.useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [lastChecked, setLastChecked] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const res = await fetch('/api/inventory', { cache: 'no-store' });
        if (!mounted) return;
        setStatus(res.ok ? 'connected' : 'disconnected');
      } catch (err) {
        if (!mounted) return;
        setStatus('disconnected');
      } finally {
        if (!mounted) return;
        setLastChecked(Date.now());
      }
    };

    check();
    const id = window.setInterval(check, 15000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const isConnected = status === 'connected';
  const isLoading = status === 'loading';

  const bg = isConnected ? 'bg-emerald-50' : isLoading ? 'bg-yellow-50' : 'bg-rose-50';
  const border = isConnected ? 'border-emerald-200' : isLoading ? 'border-yellow-200' : 'border-rose-200';
  const text = isConnected ? 'text-emerald-700' : isLoading ? 'text-yellow-700' : 'text-rose-700';
  const Icon = isConnected ? CheckCircle : isLoading ? Loader2 : XCircle;

  const label = isConnected ? 'DB: Conectado' : isLoading ? 'DB: Verificando...' : 'DB: Desconectado';

  return (
    <div className="ml-3 flex items-center">
      <div
        title={label}
        className={`hidden md:inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium ${bg} ${border} ${text}`}
      >
        <Icon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{label}</span>
        {lastChecked ? (
          <span className="ml-2 text-[11px] text-muted-foreground">{new Date(lastChecked).toLocaleTimeString()}</span>
        ) : null}
      </div>

      {/* small screens: just show icon with accessible label */}
      <div className="md:hidden flex items-center" aria-hidden>
        <Icon className={`h-4 w-4 ${isLoading ? 'animate-spin text-yellow-500' : isConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
      </div>
    </div>
  );
}
