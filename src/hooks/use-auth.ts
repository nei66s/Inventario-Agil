'use client';

import { useCallback, useEffect, useState } from 'react';

import { AuthUser } from '@/lib/auth';

let cachedAuthUser: AuthUser | null | undefined;
let authResolvedOnce = false;
let authInFlight: Promise<AuthUser | null> | null = null;

async function fetchAuthUser(): Promise<AuthUser | null> {
  if (authInFlight) {
    return authInFlight;
  }

  authInFlight = (async () => {
    const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return payload.user ?? null;
  })();

  try {
    const nextUser = await authInFlight;
    cachedAuthUser = nextUser;
    authResolvedOnce = true;
    return nextUser;
  } finally {
    authInFlight = null;
  }
}

export function useAuthUser(initialUser: AuthUser | null = null) {
  if (initialUser) {
    cachedAuthUser = initialUser;
    authResolvedOnce = true;
  }

  const [user, setUser] = useState<AuthUser | null>(initialUser ?? cachedAuthUser ?? null);
  const [loading, setLoading] = useState(!initialUser && !authResolvedOnce);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextUser = await fetchAuthUser();
      if (!nextUser) {
        setUser(null);
        setError('Falha ao carregar usuario');
      } else {
        setUser(nextUser);
        setError(null);
      }
    } catch (err) {
      console.error('auth refresh failed', err);
      setUser(null);
      setError('Falha ao carregar usuario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser && !authResolvedOnce) {
      refresh();
    }
  }, [refresh, initialUser]);

  return { user, loading, error, refresh };
}
