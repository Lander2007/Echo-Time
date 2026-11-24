'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { HourglassMark } from '@/components/HourglassMark';
import { IconBell } from '@/components/workspace/Icons';
import { MobileArchitecturalDrawer } from './MobileArchitecturalDrawer';

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    availableCredits,
    unreadNotifs,
    setUnreadNotifs,
    notifOpen,
    setNotifOpen,
    userInitials,
    activeRoom,
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
              setNotifOpen((prev) => !prev);
              setUnreadNotifs(0);
            }}
            aria-label="Open notifications"
            className="relative w-8 h-8 rounded-[2px] border border-[#021F94]/35 bg-white text-[#0B1026] flex items-center justify-center active:opacity-80 transition-opacity"
          >
            <IconBell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-none bg-[#D93829]" />
            )}
          </button>

          {/* Profile Tile */}
          <Link
            href="/profile"
            aria-label="Open profile"
            className={`w-8 h-8 rounded-[2px] font-mono text-[10.5px] font-bold flex items-center justify-center active:opacity-80 transition-colors ${
              isProfileActive
                ? 'bg-[#021F94] text-[#F5F2F3] border-2 border-[#D93829]'
                : 'bg-[#0B1026] text-[#F5F2F3] border border-[#0B1026]'
            }`}
          >
            {userInitials || 'ET'}
          </Link>
        </div>
      </header>

      {/* Notifications Drawer */}
      <MobileArchitecturalDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="00 · SYSTEM NOTIFICATIONS"
        badge={unreadNotifs > 0 ? `${unreadNotifs} NEW` : undefined}
      >
        <div className="space-y-3">
          <div className="p-3.5 bg-white border border-[#021F94]/30 rounded-[2px] space-y-2">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#021F94] uppercase font-bold">
              <span>AGREEMENT ROOM · PROTOCOL NOTICE</span>
              <span className="text-[#565C73]">JUST NOW</span>
            </div>
            <p className="text-xs text-[#0B1026] leading-relaxed">
              {activeRoom
                ? `You have an active agreement room: "${activeRoom.title}" with ${activeRoom.peerName} in ${activeRoom.stage} stage.`
                : 'Exchange agreements, hours escrow, and peer confirmations will notify you here.'}
            </p>
            {activeRoom && (
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  router.push('/agreement');
                }}
                className="mt-2 w-full py-2 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] rounded-[2px] text-center active:opacity-80 transition-opacity"
              >
                OPEN AGREEMENT ROOM →
              </button>
            )}
          </div>

          <div className="p-3.5 bg-white border border-[#021F94]/30 rounded-[2px] space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#021F94] uppercase font-bold">
              <span>PROTOCOL ESCROW RHYTHM</span>
              <span className="text-[#565C73]">ONLINE</span>
            </div>
            <p className="text-xs text-[#565C73] leading-relaxed">
              1 ECHO hour = 1 real hour. When an agreement locks, your credit moves into escrow until delivery is verified.
            </p>
          </div>
        </div>
      </MobileArchitecturalDrawer>
    </>
  );
}
