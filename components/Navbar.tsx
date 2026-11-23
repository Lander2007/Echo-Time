import React from 'react';
import Link from 'next/link';
import { CANONICAL_CONTENT } from '@/data/content';

interface NavbarProps {
  chromeTheme: 'dark' | 'light';
  activeNavId: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavClick: (id: string) => void;
  onGetPassClick: () => void;
  onHomeClick: () => void;
  navContainerRef: React.RefObject<HTMLElement | null>;
  navIndicatorRef: React.RefObject<HTMLDivElement | null>;
  onMoveIndicator: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  chromeTheme,
  activeNavId,
  soundEnabled,
  onToggleSound,
  onNavClick,
  onGetPassClick,
  onHomeClick,
  navContainerRef,
  navIndicatorRef,
  onMoveIndicator,
}) => {
  return (
    <header className={`navbar-shell ${chromeTheme === 'light' ? 'nav-is-light' : ''}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Swiss ECHO TIME Wordmark */}
        <a
          href="#act-hero"
          data-cursor="HOME"
          onClick={(e) => {
            e.preventDefault();
            onHomeClick();
          }}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
        >
          <span className="w-5 h-5 rounded-sm bg-accent text-accent-ink border border-accent inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
            <span className="swiss-cross" />
          </span>
          <span className="font-swiss-sans font-black tracking-[-0.04em] text-sm sm:text-base uppercase leading-none text-ink">
            {CANONICAL_CONTENT.nav.brand.split(' ')[0]}{' '}
            <span className="font-swiss-mono font-medium text-xs tracking-[0.06em] text-accent">
              {CANONICAL_CONTENT.nav.brand.split(' ')[1] || 'TIME'}
            </span>
          </span>
        </a>

        {/* Center: Section Navigation with Physics-Smoothed Sliding Indicator */}
        <nav
          ref={navContainerRef}
          className="hidden lg:inline-flex nav-pill-container"
          aria-label="Primary navigation"
          onMouseLeave={() => onMoveIndicator(activeNavId)}
        >
          <div ref={navIndicatorRef} className="nav-sliding-indicator" aria-hidden="true" />
          {CANONICAL_CONTENT.nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-section={link.id}
              data-cursor="NAV"
              onMouseEnter={() => onMoveIndicator(link.id)}
              onClick={(e) => {
                e.preventDefault();
                onNavClick(link.id);
              }}
              className={`nav-link-item ${activeNavId === link.id ? 'is-active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Audio Toggle + Log In / Sign Up Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            data-cursor="AUDIO"
            aria-pressed={soundEnabled}
            aria-label="Toggle tactile audio"
            title="Toggle subtle UI audio"
            onClick={onToggleSound}
            className="w-9 h-9 rounded border border-theme hover:border-accent inline-flex items-center justify-center text-ink transition-colors"
          >
            {soundEnabled ? (
              <svg
                className="w-4 h-4 text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            )}
          </button>

          <Link
            href="/login"
            data-cursor="LOGIN"
            className="hidden sm:inline-block px-3 py-1.5 rounded text-ink font-swiss-mono text-[10.5px] font-semibold hover:text-accent transition-colors"
          >
            {CANONICAL_CONTENT.nav.buttons.login}
          </Link>

          <Link
            href="/login"
            data-cursor="SIGNUP"
            className="magnetic btn-roll px-4 sm:px-5 py-2 rounded bg-accent text-accent-ink border border-accent font-swiss-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]"
          >
            <span className="btn-roll-inner">
              <span className="btn-roll-text">{CANONICAL_CONTENT.nav.buttons.signup}</span>
              <span className="btn-roll-text-clone" aria-hidden="true">
                {CANONICAL_CONTENT.nav.buttons.signup}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
