"use client";

import * as React from 'react';

export type PingStatus = 'loading' | 'connected' | 'disconnected';

type PingState = {
  status: PingStatus;
  latency: number | null;
  lastCheck: number;
};

const DEFAULT_STATE: PingState = {
  status: 'loading',
  latency: null,
  lastCheck: 0,
};

let state: PingState = DEFAULT_STATE;
let listeners = new Set<(next: PingState) => void>();
let intervalId: number | null = null;
let inFlight: Promise<void> | null = null;

const POLL_MS = 120000;

function notify() {
  for (const listener of listeners) {
    listener(state);
  }
}

async function runPing(force = false) {
  if (inFlight) return inFlight;
  const now = Date.now();
  if (!force && state.lastCheck > 0 && now - state.lastCheck < POLL_MS) {
    notify();
    return;
  }

  inFlight = (async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/ping', { cache: 'no-store' });
      const end = Date.now();
      const measure = Math.max(1, Math.round(end - start));
      state = {
        status: res.ok ? 'connected' : 'disconnected',
        latency: res.ok ? measure : null,
        lastCheck: Date.now(),
      };
    } catch {
      state = {
        status: 'disconnected',
        latency: null,
        lastCheck: Date.now(),
      };
    } finally {
      inFlight = null;
      notify();
    }
  })();

  return inFlight;
}

function ensureInterval() {
  if (intervalId !== null || typeof window === 'undefined') return;
  runPing();
  intervalId = window.setInterval(() => runPing(true), POLL_MS);
}

function clearIntervalIfIdle() {
  if (listeners.size > 0 || intervalId === null) return;
  window.clearInterval(intervalId);
  intervalId = null;
}

export function subscribePing(listener: (next: PingState) => void) {
  listeners.add(listener);
  listener(state);
  ensureInterval();

  return () => {
    listeners.delete(listener);
    clearIntervalIfIdle();
  };
}

export function usePingStatus(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const [snapshot, setSnapshot] = React.useState<PingState>(state);

  React.useEffect(() => {
    if (!enabled) return;
    return subscribePing((next) => setSnapshot(next));
  }, [enabled]);

  return snapshot;
}
