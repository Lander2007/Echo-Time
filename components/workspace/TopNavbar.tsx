'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { useWorkspaceTransition } from '@/components/WorkspaceTransitionProvider';
import { IconBell, IconSunMoon, IconArrowRight } from './Icons';
import { BrandLogo } from '@/components/BrandLogo';
import { UserAvatar } from '@/components/UserAvatar';

export function TopNavbar() {
  const pathname = usePathname();
  const { navigateWithLoader } = useWorkspaceTransition();
  const {
    themeMode,
    toggleTheme,
    notifications,
    unreadNotifs,
    notifOpen,
    setNotifOpen,
    browserNotifPermission,
    requestBrowserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
    handleLogout,
    profileFullName,
    userInitials,
    avatarUrl,
  } = useWorkspace();

  const isHomeActive =
    pathname === '/dashboard' ||
    pathname === '/explore' ||
    pathname === '/saved' ||
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
          <BrandLogo surface={themeMode === 'dark' ? 'blue' : 'light'} size="sm" />
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
              const nextOpen = !notifOpen;
              setNotifOpen(nextOpen);
              if (nextOpen) {
                refreshNotifications(false);
              }
            }}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-sm border border-[var(--border)] hover:border-[var(--lime)] bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--ink)] transition-colors"
          >
            <IconBell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[9.5px] font-bold flex items-center justify-center tabular">
                {unreadNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="et-animate-in absolute right-0 top-12 w-96 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] font-et-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="font-semibold text-[var(--ink)] inline-flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadNotifs > 0 && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] text-[9px] font-bold tabular">
                      {unreadNotifs} NEW
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2.5">
                  {unreadNotifs > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[var(--lime)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Browser Web Notification Permission Strip */}
              <div className="p-2.5 rounded-sm border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-et-mono text-[9px] uppercase text-[var(--cobalt)] font-semibold">
                    WEB BROWSER ALERTS
                  </div>
                  <div className="text-[11px] text-[var(--muted)] truncate">
                    {browserNotifPermission === 'granted'
                      ? 'Active — popups fire on skill requests'
                      : browserNotifPermission === 'denied'
                      ? 'Blocked in browser site permissions'
                      : 'Enable popup alerts for new skill requests'}
                  </div>
                </div>
                {browserNotifPermission === 'default' && (
                  <button
                    type="button"
                    onClick={requestBrowserNotifications}
                    className="shrink-0 px-2.5 py-1 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[9.5px] font-bold uppercase tracking-[0.08em] hover:brightness-95"
                  >
                    Enable
                  </button>
                )}
                {browserNotifPermission === 'granted' && (
                  <span className="shrink-0 px-2 py-0.5 rounded-sm border border-[var(--lime)]/40 text-[var(--lime)] font-et-mono text-[9px] font-bold uppercase">
                    ON
                  </span>
                )}
              </div>

              {/* Notification Stream */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                        navigateWithLoader(n.href || '/agreement');
                      }}
                      className={`w-full text-left p-3 rounded-sm border transition-colors ${
                        n.read
                          ? 'border-[var(--border)] bg-[var(--bg)] opacity-75 hover:opacity-100'
                          : 'border-[var(--lime)]/60 bg-[var(--bg)] hover:border-[var(--lime)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-et-mono text-[9px] uppercase font-semibold">
                        <span className="inline-flex items-center gap-1.5 text-[var(--cobalt)]">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-sm bg-[var(--lime)]" />}
                          <span>{n.type.replace(/_/g, ' ')}</span>
                        </span>
                        <span className="text-[var(--muted)] tabular">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mt-1 font-et-sans font-bold text-xs text-[var(--ink)]">
                        {n.title}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--muted)] leading-relaxed">
                        {n.body}
                      </p>
                      <div className="group mt-2 inline-flex items-center gap-1.5 font-et-mono text-[10px] uppercase font-semibold text-[var(--lime)]">
                        <span>Open room</span>
                        <IconArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 rounded-sm border border-[var(--border)] bg-[var(--bg)] text-center space-y-1">
                    <div className="font-et-mono text-[10px] uppercase font-semibold text-[var(--ink)]">
                      All caught up
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      You will receive a web notification here whenever a peer requests one of your skills.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Link
            href="/profile"
            title={profileFullName ? `${profileFullName} — Profile` : 'Open Profile'}
            className="hidden lg:inline-flex items-center justify-center rounded-[2px] hover:opacity-85 transition-opacity"
          >
            <UserAvatar
              src={avatarUrl}
              initials={userInitials || 'ET'}
              alt={profileFullName || 'Student Profile'}
              className="w-9 h-9 text-[11px]"
            />
          </Link>

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
