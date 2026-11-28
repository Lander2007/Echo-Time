'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { HourglassMark } from '@/components/HourglassMark';
import { UserAvatar } from '@/components/UserAvatar';
import { IconBell, IconArrowRight } from '@/components/workspace/Icons';
import { MobileArchitecturalDrawer } from './MobileArchitecturalDrawer';

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    availableCredits,
    notifications,
    unreadNotifs,
    notifOpen,
    setNotifOpen,
    browserNotifPermission,
    requestBrowserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
    userInitials,
    avatarUrl,
    profileFullName,
  } = useWorkspace();

  const isProfileActive = pathname === '/profile';

  return (
    <>
      <header className="sticky top-0 z-30 h-[52px] w-full bg-[#F5F2F3] border-b-[1.5px] border-[#021F94] px-3.5 flex items-center justify-between gap-2 lg:hidden select-none">
        {/* Left: Brand Identity */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 active:opacity-80 transition-opacity"
          aria-label="ECHO TIME Dashboard"
        >
          <HourglassMark className="w-[18px] h-[23px] text-[#021F94]" />
          <div className="flex items-baseline gap-1 select-none">
            <span className="font-sans font-black text-sm tracking-tight text-[#0B1026]">
              ECHO
            </span>
            <span className="font-mono text-xs font-bold text-[#021F94]">
              TIME
            </span>
          </div>
        </Link>

        {/* Right: 3 Sharp Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Credit Ticket Button */}
          <Link
            href="/wallet"
            className="h-8 px-2.5 rounded-[2px] bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold tabular flex items-center gap-1.5 active:opacity-80 transition-opacity"
            title="Open Wallet Ledger"
          >
            <span className="w-1.5 h-1.5 rounded-none bg-[#D93829] shrink-0" />
            <span>{Number(availableCredits || 0).toFixed(2)} ECHO</span>
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => {
              const nextOpen = !notifOpen;
              setNotifOpen(nextOpen);
              if (nextOpen) {
                refreshNotifications(false);
              }
            }}
            aria-label="Open notifications"
            className="relative w-8 h-8 rounded-[2px] border border-[#021F94]/35 bg-white text-[#0B1026] flex items-center justify-center active:opacity-80 transition-opacity"
          >
            <IconBell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-[2px] bg-[#D93829] text-white font-mono text-[9px] font-bold flex items-center justify-center tabular">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Profile Tile */}
          <Link
            href="/profile"
            aria-label="Open profile"
            className={`rounded-[2px] active:opacity-80 transition-opacity ${
              isProfileActive ? 'ring-2 ring-[#D93829]' : ''
            }`}
          >
            <UserAvatar
              src={avatarUrl}
              initials={userInitials || 'ET'}
              alt={profileFullName || 'Student Profile'}
              className="w-8 h-8 text-[10.5px]"
            />
          </Link>
        </div>
      </header>

      {/* Notifications Drawer */}
      <MobileArchitecturalDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="00 · WEB NOTIFICATIONS"
        badge={unreadNotifs > 0 ? `${unreadNotifs} NEW` : undefined}
      >
        <div className="space-y-3">
          {/* Browser Push Permission & Mark All Bar */}
          <div className="p-3 bg-white border border-[#021F94]/25 rounded-[2px] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] font-bold uppercase text-[#021F94] tracking-wider">
                BROWSER WEB ALERTS
              </div>
              <div className="text-[11px] text-[#565C73] mt-0.5">
                {browserNotifPermission === 'granted'
                  ? 'Active — popups fire automatically on skill requests.'
                  : browserNotifPermission === 'denied'
                  ? 'Blocked in browser site settings.'
                  : 'Get instant alerts when peers request your skill.'}
              </div>
            </div>
            {browserNotifPermission === 'default' && (
              <button
                type="button"
                onClick={requestBrowserNotifications}
                className="px-2.5 py-1.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[9.5px] font-bold uppercase tracking-wider rounded-[2px] shrink-0"
              >
                ENABLE
              </button>
            )}
            {browserNotifPermission === 'granted' && (
              <span className="px-2 py-1 bg-[#F5F2F3] border border-[#021F94]/30 text-[#021F94] font-mono text-[9px] font-bold uppercase rounded-[2px] shrink-0">
                ON
              </span>
            )}
          </div>

          {unreadNotifs > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="font-mono text-[10px] font-bold uppercase text-[#021F94] hover:underline"
              >
                MARK ALL READ ({unreadNotifs})
              </button>
            </div>
          )}

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markNotificationRead(n.id);
                  setNotifOpen(false);
                  router.push(n.href || '/agreement');
                }}
                className={`w-full text-left p-3.5 rounded-[2px] border transition-colors space-y-1.5 ${
                  n.read
                    ? 'bg-white border-[#021F94]/20 opacity-80'
                    : 'bg-white border-[#021F94] ring-1 ring-[#021F94]/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase font-bold">
                  <span className="inline-flex items-center gap-1.5 text-[#021F94]">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-none bg-[#D93829]" />}
                    <span>{n.type.replace(/_/g, ' ')}</span>
                  </span>
                  <span className="text-[#565C73] tabular">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-sans font-bold text-xs text-[#0B1026]">
                  {n.title}
                </div>
                <p className="text-xs text-[#565C73] leading-relaxed">
                  {n.body}
                </p>
                <div className="pt-1 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-[#021F94]">
                  <span>OPEN AGREEMENT ROOM</span>
                  <IconArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))
          ) : (
            <div className="p-5 bg-white border border-[#021F94]/25 rounded-[2px] text-center space-y-1.5">
              <div className="font-mono text-[10px] font-bold uppercase text-[#021F94]">
                NO NOTIFICATIONS YET
              </div>
              <p className="text-xs text-[#565C73] leading-relaxed">
                When a student requests one of your skills, it appears right here and pops up on screen.
              </p>
            </div>
          )}
        </div>
      </MobileArchitecturalDrawer>
    </>
  );
}
