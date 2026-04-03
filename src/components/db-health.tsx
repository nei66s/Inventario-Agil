"use client";

import { Database } from 'lucide-react';
import { usePingStatus } from './health/ping-store';

type Status = 'loading' | 'connected' | 'disconnected';

const statusConfig: Record<Status, { label: string; iconColor: string }> = {
  connected: {
    label: 'Conectado',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  loading: {
    label: 'Verificando...',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  disconnected: {
    label: 'Desconectado',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
};

export default function DbHealth() {
  const { status, latency } = usePingStatus();

  const cfg = statusConfig[status];

  return (
    <span
      role="status"
      aria-label={`Banco de dados: ${cfg.label}`}
      title={latency ? `Banco de dados: ${cfg.label} (${latency}ms)` : `Banco de dados: ${cfg.label}`}
      className="inline-flex h-8 min-w-[32px] px-1.5 gap-1 items-center justify-center rounded-full transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-help"
    >
      <Database className={`${cfg.iconColor} ${status === 'loading' ? 'animate-spin' : ''} h-4 w-4 shrink-0`} strokeWidth={2.5} />
      {latency !== null && status === 'connected' && (
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
          {latency}ms
        </span>
      )}
      <span className="sr-only">{cfg.label}</span>
    </span>
  );
}
