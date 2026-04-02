'use client';

import { useEffect, useState, useCallback } from 'react';

type SiteBrandingResponse = {
  companyName?: string;
  platformLabel?: string;
  logoUrl?: string | null;
  logoDataUrl?: string | null;
};

export type SiteBranding = {
  companyName: string;
  platformLabel: string;
  logoSrc: string;
};

const FALLBACK_BRANDING: SiteBranding = {
  companyName: 'Black Tower X',
  platformLabel: 'InventÃ¡rio Ãgil',
  logoSrc: '/black-tower-x-transp.png',
};

const CACHE_KEY = 'site-branding';
const COOKIE_KEY = 'site-branding';

let cachedBranding: SiteBranding | null = null;
let brandingResolvedOnce = false;
let brandingInFlight: Promise<SiteBranding> | null = null;

function readCachedBrandingFromStorage(): SiteBranding | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteBranding) : null;
  } catch {
    return null;
  }
}

function persistBranding(branding: SiteBranding) {
  cachedBranding = branding;
  brandingResolvedOnce = true;
  localStorage.setItem(CACHE_KEY, JSON.stringify(branding));
  window.dispatchEvent(new Event('site-branding-updated'));

  try {
    const cookieValue = btoa(JSON.stringify(branding));
    document.cookie = `${COOKIE_KEY}=${cookieValue};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  } catch {}
}

async function fetchBrandingFromApi(): Promise<SiteBranding> {
  if (brandingInFlight) {
    return brandingInFlight;
  }

  brandingInFlight = (async () => {
    const response = await fetch('/api/site', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Falha ao carregar identidade');
    }
    const payload = (await response.json()) as SiteBrandingResponse;

    const logoDataUrl = typeof payload.logoDataUrl === 'string' ? payload.logoDataUrl.trim() : null;
    const logoUrl = typeof payload.logoUrl === 'string' ? payload.logoUrl.trim() : null;
    const logoSrc = logoDataUrl || logoUrl || FALLBACK_BRANDING.logoSrc;

    const nextBranding = {
      companyName: payload.companyName?.trim() || FALLBACK_BRANDING.companyName,
      platformLabel: payload.platformLabel?.trim() || FALLBACK_BRANDING.platformLabel,
      logoSrc,
    };

    persistBranding(nextBranding);
    return nextBranding;
  })();

  try {
    return await brandingInFlight;
  } finally {
    brandingInFlight = null;
  }
}

export function useSiteBranding() {
  const [branding, setBranding] = useState<SiteBranding>(cachedBranding ?? FALLBACK_BRANDING);
  const [loading, setLoading] = useState(!brandingResolvedOnce);
  const [hasHydrated, setHasHydrated] = useState(false);

  const refreshBranding = useCallback(async () => {
    try {
      const nextBranding = await fetchBrandingFromApi();
      setBranding(nextBranding);
    } catch (error) {
      console.error('Branding fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const storageBranding = readCachedBrandingFromStorage();
    if (storageBranding) {
      cachedBranding = storageBranding;
      brandingResolvedOnce = true;
      setBranding(storageBranding);
      setLoading(false);
    }

    setHasHydrated(true);

    if (!brandingResolvedOnce) {
      refreshBranding();
    }

    const updateFromCache = () => {
      const currentCache = readCachedBrandingFromStorage();
      if (active && currentCache) {
        cachedBranding = currentCache;
        setBranding(currentCache);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const nextBranding = JSON.parse(e.newValue) as SiteBranding;
          cachedBranding = nextBranding;
          if (active) {
            setBranding(nextBranding);
          }
        } catch {}
      }
    };

    window.addEventListener('site-branding-updated', updateFromCache);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('site-branding-updated', updateFromCache);
    };
  }, [refreshBranding]);

  return {
    branding,
    loading: loading && !hasHydrated,
    hasHydrated,
    refreshBranding,
  };
}
