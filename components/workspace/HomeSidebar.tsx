'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';

export function HomeSidebar() {
  const pathname = usePathname();
  const { availableCredits, reservedCredits, rooms } = useWorkspace();

  const tabs = [
    { href: '/dashboard', num: '01', label: 'Dashboard' },
    { href: '/explore', num: '02', label: 'Explore' },
    { href: '/agreement', num: '03', label: 'Agreement', badge: rooms.length },
    { href: '/wallet', num: '04', label: 'Wallet' },
  ];

  return (
    <aside className="w-full lg:w-[252px] shrink-0 lg:sticky lg:top-[92px] space-y-4">
      {/* Iconic Acid Lime Available Credits Ticket */}
      <div className="relative rounded-sm p-5 bg-[#C9E54B] text-[#1A1B17] border border-[#1A1B17] shadow-lg overflow-hidden">
        <div className="flex items-center justify-between font-et-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
          <span>Available credits</span>
          <span>1:1 HR</span>
        </div>
        <div className="mt-3 font-et-sans font-black text-5xl tracking-[-0.05em] tabular leading-none">
          {availableCredits}
        </div>
        <div className="mt-4 pt-3 border-t border-[#1A1B17]/20 flex items-center justify-between font-et-mono text-[10.5px] font-semibold tabular">
          <span>Reserved · {reservedCredits}</span>
          <Link
            href="/wallet"
            className="text-[#1E3AE0] hover:underline uppercase text-[9.5px]"
          >
            Ledger →
          </Link>
        </div>
      </div>

      {/* Sidebar Sub-Navigation */}
      <nav
        aria-label="Home workspace tabs"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5 p-2 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)]"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`w-full px-3.5 py-2.5 rounded-sm flex items-center justify-between font-et-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-all ${
                active
                  ? 'bg-[var(--ink)] text-[var(--bg)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="text-[9.5px]"
                  style={{ color: active ? '#C9E54B' : 'var(--cobalt)' }}
                >
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </span>
              {'badge' in tab && (
                <span
                  className="px-1.5 py-0.5 rounded-sm text-[9.5px] tabular"
                  style={
                    active
                      ? { backgroundColor: '#C9E54B', color: '#1A1B17' }
                      : { backgroundColor: 'var(--bg-subtle)', color: 'var(--muted)' }
                  }
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Compact System Protocol Strip */}
      <div className="hidden lg:block rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] p-4 font-et-mono text-[10px] space-y-2 text-[var(--muted)]">
        <div className="flex items-center justify-between">
          <span>ESCROW ENGINE</span>
          <span className="text-[var(--lime)] font-semibold">ARMED</span>
        </div>
        <div className="flex items-center justify-between">
          <span>PLATFORM FEE</span>
          <span className="text-[var(--ink)] tabular">0.00%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>STREAK</span>
          <span className="text-[var(--cobalt)] font-semibold tabular">3 DAYS</span>
        </div>
      </div>
    </aside>
  );
}
