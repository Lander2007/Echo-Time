'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconBell, IconSunMoon } from './Icons';

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    themeMode,
    toggleTheme,
    unreadNotifs,
    setUnreadNotifs,
    notifOpen,
    setNotifOpen,
    handleLogout,
  } = useWorkspace();

  const isHomeActive =
    pathname === '/dashboard' ||
    pathname === '/explore' ||
    pathname === '/agreement' ||
    pathname === '/wallet';

  const navItems = [
    { label: 'Home', href: '/dashboard', active: isHomeActive },
    { label: 'Community', href: '/community', active: pathname === '/community' },
    { label: 'Subscription', href: '/subscription', active: pathname === '/subscription' },
    { label: 'Profile', href: '/profile', active: pathname === '/profile' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1460px] mx-auto px-4 sm:px-7 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
        >
          <span className="w-6 h-6 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] border border-[var(--border-strong)] inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
            <span className="et-swiss-cross" />
          </span>
          <span className="font-black uppercase tracking-[-0.04em] text-base leading-none">
            Echo{' '}
            <span className="font-et-mono font-semibold text-xs tracking-[0.08em] text-[var(--lime)]">
              Time
            </span>
          </span>
        </Link>

        {/* Center: Top Navigation Bar */}
        <nav
          aria-label="Main workspace sections"
          className="hidden md:flex items-center gap-1 p-1 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)]"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-sm font-et-mono text-[11px] font-semibold uppercase tracking-[0.11em] transition-all ${
                item.active
                  ? 'bg-[var(--lime)] text-[var(--lime-ink)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Notifications, Log out, Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 relative">
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setUnreadNotifs(0);
            }}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-sm border border-[var(--border)] hover:border-[var(--lime)] bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--ink)] transition-colors"
          >
            <IconBell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[9.5px] font-bold flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="et-animate-in absolute right-0 top-12 w-80 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] font-et-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="font-semibold text-[var(--ink)]">Notifications</span>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 p-3 rounded-sm border border-[var(--border)] bg-[var(--bg)]">
                <div className="font-et-mono text-[9.5px] uppercase text-[var(--cobalt)] font-semibold">
                  AGREEMENT ROOM · UI/UX
                </div>
                <p className="mt-1 text-xs text-[var(--ink)] leading-relaxed">
                  Hussien Agamy opened a private workspace for UI/UX. Agree on terms to lock escrow.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    router.push('/agreement');
                  }}
                  className="mt-2 font-et-mono text-[10px] uppercase font-semibold text-[var(--lime)] hover:underline"
                >
                  Open room →
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[11px] font-bold uppercase tracking-[0.11em] hover:brightness-95 transition-all"
          >
            Log out
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle Swiss Carbon / Archival Paper mode"
            className="w-9 h-9 rounded-sm border border-[var(--border)] hover:border-[var(--lime)] bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--ink)] transition-colors"
          >
            <IconSunMoon isDark={themeMode === 'dark'} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden border-t border-[var(--border)] px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-sm font-et-mono text-[10px] font-semibold uppercase tracking-[0.1em] shrink-0 ${
              item.active
                ? 'bg-[var(--lime)] text-[var(--lime-ink)]'
                : 'border border-[var(--border)] text-[var(--muted)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
