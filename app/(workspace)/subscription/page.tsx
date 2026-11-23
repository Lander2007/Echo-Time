'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconShield, IconWallet } from '@/components/workspace/Icons';

export default function SubscriptionPage() {
  const { betaPlans, handleToggleWaitlist } = useWorkspace();

  return (
    <div className="et-animate-in max-w-[1160px] mx-auto space-y-8">
      <div className="pb-7 border-b border-[var(--border-strong)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
            &mdash; SUBSCRIPTION &middot; BETA
          </div>
          <h1 className="mt-2 font-et-sans font-black tracking-[-0.045em] leading-[0.95] text-4xl sm:text-6xl">
            Choose how you want to grow.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--muted)] max-w-xl leading-relaxed">
            Every plan lets you exchange skills. Paid plans are collecting Beta Interest; billing is not enabled and no credits are granted.
          </p>
        </div>

        <div className="lg:col-span-4 et-card rounded-sm p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[var(--cobalt)] text-[#F1EFE8] flex items-center justify-center shrink-0">
            <IconShield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Built for student momentum</div>
            <div className="text-xs text-[var(--muted)]">
              Interest stays saved to your account.
            </div>
          </div>
        </div>
      </div>

      {/* Start Here: Student Free Plan */}
      <div className="relative rounded-sm border-2 border-[#C9E54B] bg-[var(--bg-elevated)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-[#C9E54B] text-[#1A1B17] flex items-center justify-center shrink-0">
              <IconWallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lime)]">
                START HERE
              </div>
              <h2 className="mt-0.5 font-et-sans font-black text-2xl sm:text-3xl tracking-[-0.03em]">
                Student
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Request and offer services, join community projects, and begin with the essentials.
              </p>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="font-et-sans font-black text-3xl">Free</div>
            <span className="mt-1.5 inline-block px-3 py-1 rounded-sm bg-[#C9E54B] text-[#1A1B17] font-et-mono text-[10px] font-bold uppercase tracking-[0.12em]">
              Current plan
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-et-mono text-xs">
          {['5 starter credits', 'Request and offer services', 'Join community projects'].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-[var(--ink)]">
              <span className="text-[var(--lime)] font-bold">✓</span>
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paid-Plan Beta Interest (5 Directions) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="font-et-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
              FIVE DIRECTIONS, ONE CLEAR PROMISE
            </div>
            <h2 className="mt-1 font-et-sans font-black text-2xl sm:text-3xl tracking-[-0.03em]">
              Paid-plan Beta interest
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] max-w-xs sm:text-right">
            Save the options you want to hear about. Nothing is charged, activated, or added to your balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {betaPlans.map((plan) => (
            <div
              key={plan.id}
              className="et-card rounded-sm p-6 flex flex-col justify-between gap-6 border-t-2"
              style={{ borderTopColor: plan.accent }}
            >
              <div>
                <div className="flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.14em]">
                  <span className="text-[var(--muted)]">BETA INTEREST</span>
                  {plan.onWaitlist && (
                    <span className="text-[var(--lime)] font-bold">✓ On Waitlist</span>
                  )}
                </div>
                <h3 className="mt-2 font-et-sans font-black text-2xl tracking-[-0.03em]">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                  {plan.tagline}
                </p>
                <ul className="mt-4 space-y-2 font-et-mono text-[11px] text-[var(--ink)]">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span style={{ color: plan.accent }}>+</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleToggleWaitlist(plan.id)}
                className={`w-full py-2.5 rounded-sm font-et-mono text-[11px] font-bold uppercase tracking-[0.11em] border transition-colors ${
                  plan.onWaitlist
                    ? 'bg-[#C9E54B] text-[#1A1B17] border-[#C9E54B]'
                    : 'border-[var(--border-strong)] text-[var(--ink)] hover:border-[var(--lime)]'
                }`}
              >
                {plan.onWaitlist ? '✓ Saved on waitlist' : 'Save Beta interest'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
