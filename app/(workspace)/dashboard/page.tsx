'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingCard } from '@/components/workspace/ListingCard';
import { MobileListingTicket } from '@/components/mobile/MobileListingTicket';
import { UserAvatar } from '@/components/UserAvatar';
import { IconSearch, IconArrowRight, IconStar } from '@/components/workspace/Icons';

function WelcomeQuerySync({ onNewWelcome }: { onNewWelcome: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') === 'new') {
      onNewWelcome();
    }
  }, [searchParams, onNewWelcome]);

  return null;
}

export default function DashboardPage() {
  const [welcomeFromQuery, setWelcomeFromQuery] = useState(false);
  const [mountTimeMs] = useState(() => Date.now());

  const {
    profileFullName,
    userInitials,
    avatarUrl,
    userCreatedAt,
    availableCredits,
    reservedCredits,
    completedExchanges,
    spaces,
    listings,
    profileCompletionPct,
    activeRoom,
  } = useWorkspace();

  const firstName = profileFullName ? profileFullName.split(' ')[0] : 'Student';
  const isRecentAccount = Boolean(
    userCreatedAt &&
      completedExchanges === 0 &&
      mountTimeMs - new Date(userCreatedAt).getTime() <= 3 * 60 * 1000
  );
  const isNewUser = welcomeFromQuery || isRecentAccount;

  const hasActiveRoom = Boolean(
    activeRoom && activeRoom.stage !== 'Completed' && activeRoom.stage !== 'Cancelled'
  );

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
    <div className="et-animate-in">
      <Suspense fallback={null}>
        <WelcomeQuerySync onNewWelcome={() => setWelcomeFromQuery(true)} />
      </Suspense>
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px STRICT EDITORIAL)
          ==================================================================== */}
      <div className="lg:hidden space-y-4 select-none">
        {/* Flat Imperial Blue Ledger Block */}
        <div className="et-m-grid-blue border-[1.5px] border-[#021F94] text-[#F5F2F3] p-4 relative rounded-[2px]">
          <span className="et-m-tick-tl et-m-tick-on-blue-tl" />
          <span className="et-m-tick-br" />

          {/* Top Rule Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F2F3]/20 font-mono text-[9.5px]">
            <span className="font-bold tracking-widest text-[#B9C8FF] uppercase">
              01 · STUDENT LEDGER
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#D93829] text-[#F5F2F3] font-black uppercase tracking-wider text-[9px] tabular">
              3-DAY STREAK
            </span>
          </div>

          {/* Main Balance Row */}
          <div className="py-4 flex items-end justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] text-[#B9C8FF] uppercase tracking-wider">
                {isNewUser ? 'WELCOME,' : 'WELCOME BACK,'} {firstName.toUpperCase()}
              </div>
              <div className="mt-1 font-mono font-black text-[42px] leading-none tracking-tight tabular text-[#F5F2F3]">
                {Number(availableCredits || 0).toFixed(2)}
              </div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B9C8FF] mt-1">
                AVAILABLE ECHO CREDITS
              </div>
            </div>

            {/* Recessed Escrow Hold Button */}
            <Link
              href="/wallet"
              className="bg-[#061354] border border-[#F5F2F3]/25 px-2.5 py-2 rounded-[2px] text-right active:opacity-80 transition-opacity shrink-0"
              title="Open Wallet Escrow Ledger"
            >
              <div className="font-mono text-[8.5px] text-[#B9C8FF] uppercase">ESCROW HOLD</div>
              <div className="font-mono font-black text-xs text-[#D93829] tabular mt-0.5 inline-flex items-center justify-end gap-1">
                <span>{Number(reservedCredits || 0).toFixed(2)}</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Bottom 2-Column Sharp CTA Split */}
          <div className="pt-3 border-t border-[#F5F2F3]/20 grid grid-cols-2 gap-2 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Link
              href="/explore"
              className="group py-2.5 bg-[#F5F2F3] text-[#021F94] rounded-[2px] inline-flex items-center justify-center gap-1.5 active:opacity-85 transition-opacity"
            >
              <span>FIND A SKILL</span>
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/agreement"
              className="py-2.5 border border-[#F5F2F3]/40 text-[#F5F2F3] rounded-[2px] text-center active:opacity-85 transition-opacity"
            >
              OPEN ROOM
            </Link>
          </div>
        </div>

        {/* Exposed 2x2 Swiss Hairline KPI Matrix */}
        <div className="bg-white border border-[#021F94]/35 grid grid-cols-2 divide-x divide-y divide-[#021F94]/20 rounded-[2px]">
          {/* 01 · EXCHANGES */}
          <div className="p-3">
            <div className="font-mono text-[9px] font-bold uppercase text-[#565C73] tracking-wider">
              01 · EXCHANGES
            </div>
            <div className="font-mono font-black text-2xl text-[#0B1026] tabular mt-1">
              {completedExchanges || 0}
            </div>
            <div className="font-mono text-[9.5px] text-[#565C73] mt-0.5">COMPLETED SESSIONS</div>
          </div>

          {/* 02 · RATING */}
          <div className="p-3">
            <div className="font-mono text-[9px] font-bold uppercase text-[#565C73] tracking-wider">
              02 · RATING
            </div>
            <div className="font-mono font-black text-2xl text-[#021F94] tabular mt-1 inline-flex items-center gap-1.5">
              <span>5.0</span>
              <IconStar filled className="w-4 h-4" />
            </div>
            <div className="font-mono text-[9.5px] text-[#565C73] mt-0.5">PEER CONFIDENCE</div>
          </div>

          {/* 03 · SPACES */}
          <div className="p-3">
            <div className="font-mono text-[9px] font-bold uppercase text-[#565C73] tracking-wider">
              03 · SPACES
            </div>
            <div className="font-mono font-black text-2xl text-[#0B1026] tabular mt-1">
              {spaces.length || 1}
            </div>
            <div className="font-mono text-[9.5px] text-[#565C73] mt-0.5">CAMPUS GROUPS</div>
          </div>

          {/* 04 · PROFILE */}
          <Link
            href="/profile"
            className="p-3 active:bg-[#F5F2F3] transition-colors block"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase text-[#565C73] tracking-wider">
              <span>04 · PROFILE</span>
              <IconArrowRight className="w-3.5 h-3.5 text-[#D93829]" />
            </div>
            <div className="font-mono font-black text-2xl text-[#D93829] tabular mt-1">
              {profileCompletionPct || 85}%
            </div>
            <div className="font-mono text-[9.5px] text-[#565C73] mt-0.5">READINESS SCORE</div>
          </Link>
        </div>

        {/* Active Room Quick-Resume Bar (Conditional) */}
        {hasActiveRoom && activeRoom && (
          <div className="bg-[#061354] border border-[#021F94] p-3 rounded-[2px] text-[#F5F2F3] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-none bg-[#D93829] shrink-0" />
              <div className="min-w-0">
                <div className="font-mono text-[9px] text-[#B9C8FF] uppercase truncate">
                  ACTIVE ROOM · {activeRoom.stage}
                </div>
                <div className="font-sans font-bold text-xs truncate">
                  {activeRoom.title} ({activeRoom.peerName})
                </div>
              </div>
            </div>
            <Link
              href="/agreement"
              className="group px-3 py-1.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px] shrink-0 inline-flex items-center gap-1 active:opacity-80"
            >
              <span>RESUME</span>
              <IconArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* Recommended Skills Feed */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#021F94]/20 font-mono text-[10px]">
            <span className="font-bold text-[#0B1026] uppercase tracking-wider">
              NEXT STEP / RECOMMENDED SKILLS
            </span>
            <Link
              href="/explore"
              className="group inline-flex items-center gap-1 text-[#021F94] font-bold uppercase hover:underline"
            >
              <span>ALL</span>
              <IconArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {listings.slice(0, 4).map((item) => (
              <MobileListingTicket key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block space-y-8">
        {/* Swiss Editorial Welcome Banner + Streak Telemetry */}
        <div className="relative rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <span className="et-tick-tl" />
          <span className="et-tick-tr" />
          <span className="et-tick-bl" />
          <span className="et-tick-br" />

          <div className="flex items-start sm:items-center gap-4">
            <UserAvatar
              src={avatarUrl}
              initials={userInitials}
              alt={profileFullName || 'Student'}
              className="w-12 h-12 text-base"
            />
            <div>
              <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
                STUDENT DASHBOARD
              </div>
              <h1 className="mt-1 font-et-sans font-black tracking-[-0.04em] text-2xl sm:text-4xl leading-[1.05]">
                {isNewUser ? 'Welcome to Echo Time' : 'Welcome back'}, {profileFullName}.
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
            className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--ink)] hover:border-[var(--lime)] font-et-mono text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
          >
            <IconArrowRight className="w-3.5 h-3.5 text-[var(--cobalt)] transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Open agreement</span>
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
              className="group inline-flex items-center gap-1.5 font-et-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--lime)] hover:underline"
            >
              <span>Explore all</span>
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.slice(0, 6).map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
