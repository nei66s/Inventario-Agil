"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSiteBranding } from '@/hooks/use-site-branding';

export function Logo({ className, hideText = false }: { className?: string; hideText?: boolean }) {
  const { branding, loading, hasHydrated } = useSiteBranding();

  return (
    <div className={cn(
      'flex items-center gap-3 text-primary transition-all duration-500 ease-in-out', 
      className, 
      (!hasHydrated) && 'opacity-0 scale-95',
      (hasHydrated && loading) && 'opacity-70'
    )}>
      <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border/70 bg-card/10 flex-shrink-0">
        <Image
          src={branding.logoSrc}
          alt={`${branding.companyName} logo`}
          fill
          sizes="36px"
          className="object-contain"
          unoptimized
        />
      </div>
      {!hideText && (
        <div className="leading-tight min-w-[120px]">
          <span className="block text-base font-bold font-headline truncate max-w-[180px]">{branding.companyName}</span>
          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground truncate">
            {branding.platformLabel}
          </span>
        </div>
      )}
    </div>
  );
}
