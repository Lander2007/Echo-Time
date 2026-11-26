'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconShield, IconWallet, IconCheck, IconArrowRight } from '@/components/workspace/Icons';

export default function SubscriptionPage() {
  const { betaPlans, handleToggleWaitlist } = useWorkspace();

  return (
    <div className="et-animate-in">
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px SWISS EDITORIAL SUBSCRIPTION)
          ==================================================================== */}
      <div className="lg:hidden space-y-4 select-none">
        {/* Header Strip */}
        <div className="pb-2.5 border-b border-[#021F94]/20">
          <div className="font-mono text-[9px] font-bold text-[#021F94] uppercase tracking-wider">
            SUBSCRIPTION · BETA / GROW AT YOUR PACE
          </div>
          <h1 className="font-sans font-black text-2xl text-[#0B1026] tracking-tight mt-0.5">
            Student Plans
          </h1>
          <p className="text-xs text-[#565C73] mt-1 leading-relaxed">
            Every plan lets you exchange skills. Paid plans are collecting Beta interest for future campus rollout.
          </p>
        </div>

        {/* Current Active Plan: Flat Imperial Blue Block */}
        <div className="et-m-grid-blue border-[1.5px] border-[#021F94] text-[#F5F2F3] p-4 relative rounded-[2px] space-y-3">
          <span className="et-m-tick-tl et-m-tick-on-blue-tl" />
          <span className="et-m-tick-br" />

          <div className="flex items-center justify-between pb-2 border-b border-[#F5F2F3]/20 font-mono text-[9.5px]">
            <span className="font-bold text-[#B9C8FF] uppercase tracking-wider">
              CURRENT TIER
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#D93829] text-white font-bold uppercase tracking-wider text-[9px]">
              ACTIVE · FREE
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-sans font-black text-2xl text-[#F5F2F3]">
                Student Core
              </div>
              <div className="font-mono text-[10px] text-[#B9C8FF] mt-0.5">
                Foundation of decentralized campus reciprocity
              </div>
            </div>
            <div className="font-mono font-black text-2xl text-[#F5F2F3] tabular">
              0.00
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#F5F2F3]/20 font-mono text-xs text-[#F5F2F3]">
            <div className="flex items-center gap-2">
              <IconCheck className="w-3.5 h-3.5 text-[#B9C8FF]" />
              <span>5 starter ECHO credits upon registration</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="w-3.5 h-3.5 text-[#B9C8FF]" />
              <span>Unlimited 1:1 peer skills exchange & escrow</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="w-3.5 h-3.5 text-[#B9C8FF]" />
              <span>Join campus projects, study groups & events</span>
            </div>
          </div>
        </div>

        {/* Stacked Beta Tier Sheets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#565C73] uppercase tracking-wider">
            <span>UPCOMING TIERS · BETA INTEREST</span>
            <span className="tabular">{betaPlans.length} DIRECTIONS</span>
          </div>

          {betaPlans.map((plan) => (
            <div
              key={plan.id}
              className="et-m-box p-4 space-y-3 relative overflow-hidden"
            >
              <span className="et-m-tick-tl" />

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[9px] uppercase font-bold text-[#021F94] tracking-wider">
                    BETA DIRECTION
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#0B1026] mt-0.5">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#565C73] mt-0.5 leading-snug">
                    {plan.tagline}
                  </p>
                </div>

                {plan.onWaitlist && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[9px] font-bold uppercase rounded-[2px] shrink-0">
                    <IconCheck className="w-2.5 h-2.5" />
                    <span>WAITLISTED</span>
                  </span>
                )}
              </div>

              <ul className="space-y-1 font-mono text-xs text-[#0B1026] pt-1 border-t border-[#021F94]/15">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2">
                    <span className="text-[#021F94] font-bold">+</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleToggleWaitlist(plan.id)}
                className={`group w-full py-2.5 rounded-[2px] font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors active:opacity-85 ${
                  plan.onWaitlist
                    ? 'bg-[#021F94] text-[#F5F2F3]'
                    : 'border border-[#021F94] text-[#021F94] bg-white hover:bg-[#F5F2F3]'
                }`}
              >
                {plan.onWaitlist ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>SAVED ON WAITLIST</span>
                  </>
                ) : (
                  <>
                    <span>SAVE BETA INTEREST</span>
                    <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block max-w-[1160px] mx-auto space-y-8">
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
        <div className="relative rounded-sm border-2 border-[var(--lime)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] flex items-center justify-center shrink-0">
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
              <span className="mt-1.5 inline-block px-3 py-1 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                Current plan
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-et-mono text-xs">
            {['5 starter credits', 'Request and offer services', 'Join community projects'].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-[var(--ink)]">
                <IconCheck className="w-3.5 h-3.5 text-[var(--lime)]" />
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
                      <span className="inline-flex items-center gap-1 text-[var(--lime)] font-bold">
                        <IconCheck className="w-3 h-3" />
                        <span>On Waitlist</span>
                      </span>
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
                  className={`w-full py-2.5 rounded-sm font-et-mono text-[11px] font-bold uppercase tracking-[0.11em] border inline-flex items-center justify-center gap-1.5 transition-colors ${
                    plan.onWaitlist
                      ? 'bg-[var(--lime)] text-[var(--lime-ink)] border-[var(--lime)]'
                      : 'border-[var(--border-strong)] text-[var(--ink)] hover:border-[var(--lime)]'
                  }`}
                >
                  {plan.onWaitlist ? (
                    <>
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>Saved on waitlist</span>
                    </>
                  ) : (
                    <span>Save Beta interest</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
