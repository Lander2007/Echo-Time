'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingCard } from '@/components/workspace/ListingCard';
import { MobileListingTicket } from '@/components/mobile/MobileListingTicket';
import { IconArrowRight, IconHeart, IconSearch } from '@/components/workspace/Icons';

export default function SavedSkillsPage() {
  const { savedListings, refreshSavedListings } = useWorkspace();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Offers' | 'Requests'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshSavedListings();
  }, [refreshSavedListings]);

  const filteredSaved = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return savedListings.filter((item) => {
      if (typeFilter === 'Offers' && item.type !== 'Offering') return false;
      if (typeFilter === 'Requests' && item.type !== 'Looking for') return false;
      if (q) {
        const hay = `${item.title} ${item.description} ${item.category} ${item.authorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [savedListings, typeFilter, searchQuery]);

  return (
    <div className="et-animate-in">
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px SWISS EDITORIAL SAVED LEDGER)
          ==================================================================== */}
      <div className="lg:hidden space-y-4 select-none">
        {/* Header Block */}
        <div className="pb-3 border-b border-[#021F94]/20 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] font-bold text-[#021F94] uppercase tracking-wider">
              05 · SAVED BOOKMARKS
            </div>
            <h1 className="font-sans font-black text-2xl text-[#0B1026] tracking-tight mt-0.5">
              Saved Skill Listings
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded-[2px] bg-[#021F94] text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-wider tabular shrink-0">
            {savedListings.length} SAVED
          </span>
        </div>

        {savedListings.length > 0 ? (
          <>
            {/* Search & Quick Type Strip */}
            <div className="space-y-2">
              <div className="relative">
                <IconSearch className="w-4 h-4 text-[#565C73] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter saved skills, peers, categories..."
                  className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#021F94]/35 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold">
                {(['All', 'Offers', 'Requests'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`py-1.5 rounded-[2px] uppercase transition-colors ${
                      typeFilter === t
                        ? 'bg-[#021F94] text-[#F5F2F3]'
                        : 'border border-[#021F94]/25 bg-white text-[#565C73]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {filteredSaved.length > 0 ? (
              <div className="space-y-3">
                {filteredSaved.map((item) => (
                  <MobileListingTicket key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="et-m-box p-5 text-center space-y-2.5">
                <div className="font-mono text-xs font-bold uppercase text-[#565C73]">
                  NO SAVED LISTINGS MATCH YOUR FILTER
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#021F94] text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px]"
                >
                  CLEAR FILTER
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="et-m-box relative p-6 text-center space-y-3">
            <span className="et-m-tick-tl" />
            <span className="et-m-tick-br" />
            <div className="w-10 h-10 mx-auto rounded-[2px] border border-[#021F94]/30 bg-[#F5F2F3] flex items-center justify-center text-[#021F94]">
              <IconHeart className="w-5 h-5" />
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B1026]">
              NO SAVED SKILL LISTINGS YET
            </div>
            <p className="text-xs text-[#565C73] leading-relaxed max-w-xs mx-auto">
              Tap SAVE on any skill listing in Explore or Dashboard to bookmark it here for quick agreement setup.
            </p>
            <Link
              href="/explore"
              className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px] active:opacity-85"
            >
              <span>BROWSE MARKETPLACE</span>
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT SWISS EDITORIAL)
          ==================================================================== */}
      <div className="hidden lg:block space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
              BOOKMARKED EXCHANGES
            </div>
            <h1 className="mt-1 font-et-sans font-black tracking-[-0.045em] text-3xl sm:text-5xl">
              Saved skill listings
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Shortlisted skill offers and student requests synced to your Neon PostgreSQL account.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] tabular text-[var(--lime)]">
              {savedListings.length} Saved
            </span>
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
            >
              <span>Explore marketplace</span>
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {savedListings.length > 0 ? (
          <>
            {/* Filter Bar */}
            <div className="et-card rounded-sm p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-4 inline-flex p-1 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)]">
                {(['All', 'Offers', 'Requests'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`flex-1 py-2 rounded-sm font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                      typeFilter === t
                        ? 'bg-[var(--lime)] text-[var(--lime-ink)]'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 relative">
                <IconSearch className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved listings by skill title, discipline or student..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
                />
              </div>
            </div>

            {filteredSaved.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSaved.map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="et-card rounded-sm p-10 text-center space-y-3">
                <div className="font-et-mono text-xs uppercase text-[var(--muted)]">
                  No saved skill listings match your search
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.1em]"
                >
                  Clear filter
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="et-card rounded-sm p-12 text-center space-y-4">
            <div className="w-11 h-11 mx-auto rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] flex items-center justify-center text-[var(--lime)]">
              <IconHeart className="w-5 h-5" />
            </div>
            <div className="font-et-sans font-extrabold text-xl text-[var(--ink)]">
              No saved skill listings yet
            </div>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
              Click the heart button on any skill listing in Explore or your Dashboard to save it here for later.
            </p>
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
            >
              <span>Browse Explore marketplace</span>
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
