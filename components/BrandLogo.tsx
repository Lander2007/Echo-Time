import React from 'react';

export type BrandSurface = 'light' | 'blue' | 'dark';
export type BrandVariant = 'lockup' | 'mark' | 'stacked';
export type BrandSize = 'sm' | 'md' | 'lg';

export interface BrandLogoProps {
  /** Surface behind the logo so colors invert cleanly across World A & World B */
  surface?: BrandSurface;
  /** 'lockup' = horizontal navbar/footer, 'mark' = icon-only badge/seal, 'stacked' = poster/auth */
  variant?: BrandVariant;
  /** Preset scale */
  size?: BrandSize;
  /** Toggle surgical Swiss Vermilion (#D93829) atomic nexus dot (default: true) */
  showAccentDot?: boolean;
  /** Optional subtitle shown under lockup on large/stacked hero placements */
  showTagline?: boolean;
  className?: string;
}

const SURFACE_TOKENS: Record<
  BrandSurface,
  {
    primary: string;
    cutout: string;
    wordmarkEcho: string;
    wordmarkTime: string;
    accent: string;
  }
> = {
  light: {
    primary: '#021F94',
    cutout: '#F5F2F3',
    wordmarkEcho: '#0B1026',
    wordmarkTime: '#021F94',
    accent: '#D93829',
  },
  blue: {
    primary: '#F5F2F3',
    cutout: '#021F94',
    wordmarkEcho: '#F5F2F3',
    wordmarkTime: '#B9C8FF',
    accent: '#D93829',
  },
  dark: {
    primary: '#F5F2F3',
    cutout: '#0B1026',
    wordmarkEcho: '#F5F2F3',
    wordmarkTime: '#6B84FF',
    accent: '#D93829',
  },
};

const SIZE_MAP: Record<
  BrandSize,
  { icon: number; echoClass: string; timeClass: string; gapClass: string }
> = {
  sm: {
    icon: 26,
    echoClass: 'text-base',
    timeClass: 'text-xs',
    gapClass: 'gap-2.5',
  },
  md: {
    icon: 34,
    echoClass: 'text-xl',
    timeClass: 'text-sm',
    gapClass: 'gap-3',
  },
  lg: {
    icon: 64,
    echoClass: 'text-4xl sm:text-5xl',
    timeClass: 'text-xl sm:text-2xl',
    gapClass: 'gap-4 sm:gap-5',
  },
};

export function ParityHourglassMark({
  surface = 'light',
  size = 32,
  showAccentDot = true,
  className = '',
}: {
  surface?: BrandSurface;
  size?: number;
  showAccentDot?: boolean;
  className?: string;
}) {
  const t = SURFACE_TOKENS[surface];
  const nexusColor = showAccentDot ? t.accent : t.primary;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g className="et-logo-hourglass">
        {/* Top & Bottom Precision Bars */}
        <rect x="10" y="6" width="44" height="5.5" rx="1" fill={t.primary} />
        <rect x="10" y="52.5" width="44" height="5.5" rx="1" fill={t.primary} />
        {/* Upper & Lower 1:1 Parity Wedges */}
        <polygon points="13,15 51,15 32,30.5" fill={t.primary} />
        <polygon points="32,33.5 51,49 13,49" fill={t.primary} />
        {/* Negative-Space Echo Cut Inside Lower Wedge */}
        <polygon points="32,39.5 41.5,46.5 22.5,46.5" fill={t.cutout} />
        {/* Atomic Escrow Nexus Core */}
        <circle cx="32" cy="32" r="3" fill={nexusColor} />
      </g>
    </svg>
  );
}

export function BrandLogo({
  surface = 'light',
  variant = 'lockup',
  size = 'sm',
  showAccentDot = true,
  showTagline = false,
  className = '',
}: BrandLogoProps) {
  const t = SURFACE_TOKENS[surface];
  const s = SIZE_MAP[size];

  if (variant === 'mark') {
    return (
      <span
        className={`et-logo-root inline-flex items-center justify-center shrink-0 ${className}`}
        aria-label="Echo Time"
      >
        <ParityHourglassMark
          surface={surface}
          size={s.icon}
          showAccentDot={showAccentDot}
        />
      </span>
    );
  }

  const isStacked = variant === 'stacked';

  return (
    <span
      className={`et-logo-root inline-flex ${
        isStacked ? 'flex-col items-center text-center' : 'items-center'
      } ${s.gapClass} select-none ${className}`}
    >
      <ParityHourglassMark
        surface={surface}
        size={s.icon}
        showAccentDot={showAccentDot}
        className="shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className="inline-flex items-baseline gap-1.5">
          <span
            className={`font-black uppercase tracking-[-0.048em] leading-none ${s.echoClass}`}
            style={{ color: t.wordmarkEcho }}
          >
            ECHO
          </span>
          <span
            className={`font-mono font-semibold uppercase tracking-[0.1em] leading-none ${s.timeClass}`}
            style={{ color: t.wordmarkTime }}
          >
            TIME
          </span>
        </span>
        {showTagline && (
          <span
            className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: t.wordmarkTime, opacity: 0.85 }}
          >
            UNIVERSITY TIME BANK · 1:1 PARITY
          </span>
        )}
      </span>
    </span>
  );
}
