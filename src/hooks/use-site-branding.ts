'use client';

import { useEffect, useState } from 'react';

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
  platformLabel: 'Plataforma SaaS',
  logoSrc: '/black-tower-x-transp.png',
};

export function useSiteBranding() {
  const [branding, setBranding] = useState<SiteBranding>(FALLBACK_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/site', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Falha ao carregar identidade');
        }
        return (await response.json()) as SiteBrandingResponse;
      })
      .then((payload) => {
        if (!active) return;
        const logoDataUrl =
          typeof payload.logoDataUrl === 'string' ? payload.logoDataUrl.trim() : null;
        const logoUrl = typeof payload.logoUrl === 'string' ? payload.logoUrl.trim() : null;
        const logoSrc = logoDataUrl || logoUrl || FALLBACK_BRANDING.logoSrc;
        setBranding({
          companyName: payload.companyName?.trim() || FALLBACK_BRANDING.companyName,
          platformLabel: payload.platformLabel?.trim() || FALLBACK_BRANDING.platformLabel,
          logoSrc,
        });
      })
      .catch(() => {
        if (!active) return;
        setBranding(FALLBACK_BRANDING);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { branding, loading };
}
