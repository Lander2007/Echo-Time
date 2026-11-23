'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconWallet, IconLock } from '@/components/workspace/Icons';

export default function WalletPage() {
  const {
    availableCredits,
    reservedCredits,
    earnedLifetime,
    spentLifetime,
    transactions,
  } = useWorkspace();

  return (
    <div className="et-animate-in space-y-7">
      <div className="pb-5 border-b border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
            STUDENT TIME LEDGER
          </div>
          <h1 className="mt-1 font-et-sans font-black tracking-[-0.045em] text-3xl sm:text-5xl">
            Your credit rhythm
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-xl">
            See what is ready to use, what is held for an exchange, and how your time has moved.
          </p>
        </div>
        <div className="font-et-mono text-[10.5px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--lime)]">
          ZERO-SUM LEDGER · SYNCED
        </div>
      </div>

      {/* 2 Hero Ledger Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Available Now — Acid Lime Swiss Poster Card */}
        <div className="relative rounded-sm p-6 sm:p-8 bg-[#C9E54B] text-[#1A1B17] border border-[#1A1B17] overflow-hidden">
          <div className="flex items-center justify-between font-et-mono text-xs font-bold uppercase tracking-[0.14em]">
            <span>Available now</span>
            <IconWallet className="w-5 h-5" />
          </div>
          <div className="mt-6 font-et-sans font-black text-6xl tracking-[-0.05em] tabular leading-none">
            {availableCredits}
          </div>
          <div className="mt-2 font-et-mono text-xs uppercase tracking-[0.12em] font-semibold opacity-80">
            time credits
          </div>
          {/* Geometric Swiss Corner Rings */}
          <div
            className="pointer-events-none absolute -right-10 -bottom-10 w-44 h-44 rounded-full border-[18px] border-[#1A1B17]/10"
            aria-hidden="true"
          />
        </div>

        {/* Reserved — Charcoal & Cobalt Escrow Hold Card */}
        <div className="relative rounded-sm p-6 sm:p-8 bg-[var(--bg-elevated)] border border-[var(--border-strong)] overflow-hidden">
          <div className="flex items-center justify-between font-et-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--cobalt)]">
            <span>Reserved</span>
            <IconLock className="w-5 h-5" />
          </div>
          <div className="mt-6 font-et-sans font-black text-6xl tracking-[-0.05em] tabular leading-none text-[var(--ink)]">
            {reservedCredits}
          </div>
          <div className="mt-2 font-et-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            time credits
          </div>
          <div
            className="pointer-events-none absolute -right-10 -bottom-10 w-44 h-44 rounded-full border-[18px] border-[var(--cobalt)]/10"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Earned & Spent Lifetime Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="et-card rounded-sm p-5 flex items-center justify-between">
          <div>
            <div className="font-et-sans font-bold text-base">Earned</div>
            <div className="font-et-mono text-[10.5px] text-[var(--muted)]">
              lifetime total
            </div>
          </div>
          <div className="font-et-mono font-bold text-3xl tabular text-[var(--lime)]">
            {earnedLifetime}
          </div>
        </div>
        <div className="et-card rounded-sm p-5 flex items-center justify-between">
          <div>
            <div className="font-et-sans font-bold text-base">Spent</div>
            <div className="font-et-mono text-[10.5px] text-[var(--muted)]">
              lifetime total
            </div>
          </div>
          <div className="font-et-mono font-bold text-3xl tabular text-[var(--cobalt)]">
            {spentLifetime}
          </div>
        </div>
      </div>

      {/* Traceable Transactions Ledger */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-et-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
              TRACEABLE BY DESIGN
            </div>
            <h2 className="mt-0.5 font-et-sans font-black text-2xl tracking-[-0.03em]">
              Transactions
            </h2>
          </div>
          <span className="font-et-mono text-[10.5px] text-[var(--muted)]">
            Available and reserved movements stay separate.
          </span>
        </div>

        <div className="et-card rounded-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border-strong)] font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                <th className="py-3.5 px-5">Transaction</th>
                <th className="py-3.5 px-5">Balance movement</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[var(--bg-subtle)]/50 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-sm bg-[var(--cobalt)] text-[#F1EFE8] font-et-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {tx.initials}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-[var(--ink)]">
                          {tx.title}
                        </div>
                        <div className="font-et-mono text-[10.5px] text-[var(--muted)]">
                          {tx.counterparty}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-et-mono text-[11px] tabular">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-sm font-semibold"
                        style={
                          tx.availableDelta > 0
                            ? { backgroundColor: '#C9E54B', color: '#1A1B17' }
                            : {
                                backgroundColor: 'var(--bg-subtle)',
                                color: 'var(--ink)',
                              }
                        }
                      >
                        Available {tx.availableDelta > 0 ? `+${tx.availableDelta}` : tx.availableDelta}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-sm border border-[var(--border)] text-[var(--muted)]">
                        Reserved {tx.reservedDelta > 0 ? `+${tx.reservedDelta}` : tx.reservedDelta}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[10.5px] text-[var(--ink)]">
                      {tx.typeLabel}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-et-mono text-[11px] text-[var(--muted)] tabular">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-1 font-et-mono text-[11px] text-[var(--muted)]">
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 rounded-sm border border-[var(--border)] opacity-50"
          >
            ← Previous
          </button>
          <span className="tabular">
            Showing 1&ndash;{transactions.length} of {transactions.length} &middot; page 1 of 1 &middot; 40 per page
          </span>
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 rounded-sm border border-[var(--border)] opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
