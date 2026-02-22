"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SiteSettingsPayload = {
  companyName: string;
  platformLabel: string;
  logoUrl: string | null;
  logoDataUrl: string | null;
};

const DEFAULT_LOGO_URL = '/black-tower-x-transp.png';

const DEFAULT_SETTINGS: SiteSettingsPayload = {
  companyName: 'Black Tower X',
  platformLabel: 'Plataforma SaaS',
  logoUrl: DEFAULT_LOGO_URL,
  logoDataUrl: null,
};

export function Logo({ className }: { className?: string }) {
  const [settings, setSettings] = useState<SiteSettingsPayload | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/api/site', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Falha ao carregar marca');
        }
        return (await response.json()) as SiteSettingsPayload;
      })
      .then((payload) => {
        if (!active) return;
        setSettings({
          companyName: payload.companyName || DEFAULT_SETTINGS.companyName,
          platformLabel: payload.platformLabel || DEFAULT_SETTINGS.platformLabel,
          logoUrl: payload.logoUrl,
          logoDataUrl: payload.logoDataUrl ?? null,
        });
      })
      .catch(() => {
        // fallback to defaults
      });

    return () => {
      active = false;
    };
  }, []);

  const companyName = settings?.companyName ?? DEFAULT_SETTINGS.companyName;
  const platformLabel = settings?.platformLabel ?? DEFAULT_SETTINGS.platformLabel;
  const logoDataUrl = settings?.logoDataUrl ?? DEFAULT_SETTINGS.logoDataUrl;
  const logoUrl: string = settings?.logoUrl ?? DEFAULT_LOGO_URL;
  const logoSrc: string = logoDataUrl ?? logoUrl;

  return (
    <div className={cn('flex items-center gap-3 text-primary', className)}>
      <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border/70 bg-card/10">
        <Image
          src={logoSrc}
          alt={`${companyName} logo`}
          fill
          sizes="36px"
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="leading-tight">
        <span className="block text-base font-bold font-headline">{companyName}</span>
        <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
          {platformLabel}
        </span>
      </div>
    </div>
  );
}
