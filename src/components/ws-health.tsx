"use client";

import * as React from 'react';
import { Zap, ZapOff, Loader2 } from 'lucide-react';
import { useRealtimeStore } from '@/store/use-realtime-store';

export default function WsHealth() {
  const { isConnected, isConnecting } = useRealtimeStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-2xl border border-yellow-200/80 bg-yellow-50/80 px-2 py-1 text-slate-700 shadow-sm transition">
        <Loader2 className="text-yellow-500 animate-spin h-5 w-5" />
      </span>
    );
  }

  const status = isConnected ? 'connected' : isConnecting ? 'loading' : 'disconnected';

  const config = {
    connected: {
      label: 'Tempo Real: Conectado',
      border: 'border-emerald-200/80',
      bg: 'bg-emerald-50/70',
      iconColor: 'text-emerald-500',
      // icon: Zap,
    },
    loading: {
      label: 'Tempo Real: Conectando...',
      border: 'border-yellow-200/80',
      bg: 'bg-yellow-50/80',
      iconColor: 'text-yellow-500',
      // icon: Loader2,
    },
    disconnected: {
      label: 'Tempo Real: Desconectado',
      border: 'border-rose-200/80',
      bg: 'bg-rose-50/80',
      iconColor: 'text-rose-500',
      // icon: ZapOff,
    }
  };

  const cfg = config[status];
  const Icon = status === 'connected' ? Zap : status === 'loading' ? Loader2 : ZapOff;

  return (
    <span
      role="status"
      aria-label={cfg.label}
      title={cfg.label}
      className={`inline-flex w-fit items-center gap-1 rounded-2xl border ${cfg.border} ${cfg.bg} px-2 py-1 text-slate-700 shadow-sm transition hover:scale-110 cursor-help`}
    >
      <Icon className={`${cfg.iconColor} ${status === 'loading' ? 'animate-spin' : ''} h-5 w-5`} />
      <span className="sr-only">{cfg.label}</span>
    </span>
  );
}
