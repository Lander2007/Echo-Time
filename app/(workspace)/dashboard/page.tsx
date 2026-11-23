'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingCard } from '@/components/workspace/ListingCard';
import { IconSearch } from '@/components/workspace/Icons';

export default function DashboardPage() {
  const {
    profileFullName,
    userInitials,
    availableCredits,
    completedExchanges,
    spaces,
    listings,
  } = useWorkspace();

  const kpis = [
    {
      idx: '01',
      value: String(availableCredits),
      label: 'Available credits',
      accent: 'var(--lime)',
    },
    {
      idx: '02',
      value: String(completedExchanges),
      label: 'Completed exchanges',
      accent: 'var(--ink)',
    },
    {
      idx: '03',
      value: '5.0 ★',
      label: 'Average rating',
      accent: 'var(--lime)',
    },
    {
      idx: '04',
      value: String(Math.max(1, spaces.length)),
      label: 'Community connections',
      accent: 'var(--cobalt)',
    },
  ];

  return (
    <div className="et-animate-in space-y-8">
      {/* Swiss Editorial Welcome Banner + Streak Telemetry */}
      <div className="relative rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <span className="et-tick-tl" />
        <span className="et-tick-tr" />
        <span className="et-tick-bl" />
        <span className="et-tick-br" />

        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] border border-[var(--border-strong)] flex items-center justify-center font-et-mono font-bold text-base shrink-0">
            {userInitials}
          </div>
          <div>
            <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
              STUDENT DASHBOARD
            </div>
            <h1 className="mt-1 font-et-sans font-black tracking-[-0.04em] text-2xl sm:text-4xl leading-[1.05]">
              Welcome back, {profileFullName}.
            </h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Ready to exchange your skills today?
            </p>
          </div>
        </div>

        {/* 3-Day Streak Module */}
        <div className="flex items-center gap-3.5 px-4 py-3 rounded-sm border border-[var(--lime)]/40 bg-[var(--bg)] max-w-sm">
          <div className="w-10 h-10 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono font-black text-lg flex items-center justify-center shrink-0 tabular">
            03
          </div>
          <div className="min-w-0">
            <div className="font-et-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--ink)]">
              3-day streak
            </div>
            <div className="text-[11.5px] text-[var(--muted)] truncate">
              Keep exchanging and collaborating to grow
            </div>
          </div>
        </div>
      </div>

      {/* 4 Exposed-Grid KPI Modules */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((stat) => (
          <div
            key={stat.label}
            className="et-card rounded-sm p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <span>METRIC {stat.idx}</span>
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: stat.accent }}
              />
            </div>
            <div>
              <div
                className="font-et-sans font-black text-3xl sm:text-4xl tracking-[-0.04em] tabular"
                style={{ color: stat.accent }}
              >
                {stat.value}
              </div>
              <div className="mt-1 font-et-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--muted)]">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
        >
          <IconSearch className="w-4 h-4" />
          <span>Find a skill</span>
        </Link>
        <Link
          href="/agreement"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--ink)] hover:border-[var(--lime)] font-et-mono text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
        >
          <span>→ Open agreement</span>
        </Link>
      </div>

      {/* Recommended For You */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-strong)]">
          <div>
            <div className="font-et-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
              A THOUGHTFUL NEXT STEP
            </div>
            <h2 className="mt-1 font-et-sans font-black tracking-[-0.035em] text-2xl sm:text-3xl">
              Recommended for you
            </h2>
          </div>
          <Link
            href="/explore"
            className="font-et-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--lime)] hover:underline"
          >
            Explore all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.slice(0, 6).map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
