'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingCard } from '@/components/workspace/ListingCard';
import { MobileListingTicket } from '@/components/mobile/MobileListingTicket';
import { MobileArchitecturalDrawer } from '@/components/mobile/MobileArchitecturalDrawer';
import { IconSearch } from '@/components/workspace/Icons';
import { ListingFormat } from '@/types/workspace';
import { EXPLORE_CATEGORIES } from '@/lib/seed-workspace';

const MOBILE_CATEGORIES = [
  'All',
  'Programming',
  'Design',
  'Data Analysis',
  'Marketing',
  'Languages',
  'Business',
  'Media',
];

export default function ExplorePage() {
  const { listings, setPostModalOpen } = useWorkspace();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Offers' | 'Requests'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<'All formats' | ListingFormat>('All formats');
  const [sortFilter, setSortFilter] = useState<'Recommended' | 'Lowest credits' | 'Highest rated'>('Recommended');
  const [scopeFilter, setScopeFilter] = useState<'All listings' | 'Saved only' | 'My listings'>('All listings');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Mobile Filter Drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Count active non-default filters for mobile badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'All') count++;
    if (formatFilter !== 'All formats') count++;
    if (scopeFilter !== 'All listings') count++;
    if (sortFilter !== 'Recommended') count++;
    return count;
  }, [typeFilter, formatFilter, scopeFilter, sortFilter]);

  const resetAllFilters = () => {
    setTypeFilter('All');
    setFormatFilter('All formats');
    setScopeFilter('All listings');
    setSortFilter('Recommended');
    setCategoryFilter('All');
    setSearchQuery('');
  };

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = listings.filter((item) => {
      if (typeFilter === 'Offers' && item.type !== 'Offering') return false;
      if (typeFilter === 'Requests' && item.type !== 'Looking for') return false;
      if (formatFilter !== 'All formats' && item.format !== formatFilter) return false;
      if (scopeFilter === 'Saved only' && !item.saved) return false;
      if (scopeFilter === 'My listings' && !item.isMine) return false;
      if (categoryFilter !== 'All' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (q) {
        const hay = `${item.title} ${item.description} ${item.category} ${item.authorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortFilter === 'Lowest credits') {
      return [...result].sort((a, b) => a.creditsPerHr - b.creditsPerHr);
    }
    if (sortFilter === 'Highest rated') {
      return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return result;
  }, [listings, typeFilter, formatFilter, scopeFilter, categoryFilter, searchQuery, sortFilter]);

  return (
    <div className="et-animate-in">
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px STRICT EDITORIAL)
          ==================================================================== */}
      <div className="lg:hidden space-y-3 select-none">
        {/* Sticky Search & Filter Console */}
        <div className="sticky top-[52px] z-20 bg-[#F5F2F3] border-b-[1.5px] border-[#021F94] -mx-3.5 px-3.5 py-2 space-y-2">
          {/* Row 1: Search & Filter Drawer Trigger */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-[#565C73] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, topics, students..."
                className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#021F94]/35 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#565C73] hover:text-[#0B1026]"
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className={`h-[38px] px-3 rounded-[2px] font-mono text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 active:opacity-80 transition-colors ${
                activeFilterCount > 0
                  ? 'bg-[#021F94] text-[#F5F2F3]'
                  : 'border border-[#021F94]/40 bg-white text-[#0B1026]'
              }`}
            >
              <span>FILTER</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-none bg-[#D93829] text-white flex items-center justify-center text-[9px] tabular">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: Horizontal Category Strip */}
          <div className="flex items-center gap-1 overflow-x-auto et-no-scrollbar py-0.5">
            {MOBILE_CATEGORIES.map((cat) => {
              const active = categoryFilter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-[2px] font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-[#021F94] text-[#F5F2F3]'
                      : 'border border-[#021F94]/25 bg-white text-[#565C73] hover:text-[#0B1026]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between font-mono text-[10px] text-[#565C73] uppercase tracking-wider px-0.5">
          <span>
            {filteredListings.length} {filteredListings.length === 1 ? 'LISTING AVAILABLE' : 'LISTINGS AVAILABLE'}
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[#D93829] font-bold hover:underline"
            >
              CLEAR FILTERS ×
            </button>
          )}
        </div>

        {/* Listings Stream */}
        <div className="space-y-3">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <MobileListingTicket key={item.id} item={item} />
            ))
          ) : (
            <div className="et-m-box p-6 text-center space-y-3">
              <div className="font-mono text-xs font-bold uppercase text-[#565C73]">
                NO MATCHING EXCHANGES FOUND
              </div>
              <p className="text-xs text-[#565C73] max-w-xs mx-auto">
                Try widening your query or reset filters to see all available offerings on campus.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px]"
              >
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </div>

        {/* Filter Architectural Drawer */}
        <MobileArchitecturalDrawer
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="02 · MARKETPLACE FILTERS"
          badge={activeFilterCount > 0 ? `${activeFilterCount} ACTIVE` : undefined}
        >
          <div className="space-y-4">
            {/* 1. Listing Type */}
            <div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#565C73] mb-2 tracking-wider">
                01 · LISTING TYPE
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10.5px] font-bold">
                {(['All', 'Offers', 'Requests'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`py-2 rounded-[2px] uppercase transition-colors ${
                      typeFilter === t
                        ? 'bg-[#021F94] text-[#F5F2F3]'
                        : 'border border-[#021F94]/30 bg-white text-[#565C73]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Session Format */}
            <div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#565C73] mb-2 tracking-wider">
                02 · SESSION FORMAT
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10.5px] font-bold">
                {(['All formats', 'Online', 'In-person', 'Hybrid'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormatFilter(f)}
                    className={`py-2 rounded-[2px] uppercase transition-colors ${
                      formatFilter === f
                        ? 'bg-[#021F94] text-[#F5F2F3]'
                        : 'border border-[#021F94]/30 bg-white text-[#565C73]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Scope */}
            <div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#565C73] mb-2 tracking-wider">
                03 · SCOPE & BOOKMARKS
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold">
                {(['All listings', 'Saved only', 'My listings'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScopeFilter(s)}
                    className={`py-2 rounded-[2px] uppercase transition-colors ${
                      scopeFilter === s
                        ? 'bg-[#021F94] text-[#F5F2F3]'
                        : 'border border-[#021F94]/30 bg-white text-[#565C73]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Sort By */}
            <div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#565C73] mb-2 tracking-wider">
                04 · SORT BY
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold">
                {(['Recommended', 'Lowest credits', 'Highest rated'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSortFilter(st)}
                    className={`py-2 rounded-[2px] uppercase transition-colors ${
                      sortFilter === st
                        ? 'bg-[#021F94] text-[#F5F2F3]'
                        : 'border border-[#021F94]/30 bg-white text-[#565C73]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Action Controls */}
            <div className="pt-3 border-t border-[#021F94]/20 grid grid-cols-2 gap-2 font-mono text-[11px] font-bold uppercase">
              <button
                type="button"
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="py-2.5 border border-[#D93829] text-[#D93829] rounded-[2px] text-center active:opacity-80"
              >
                RESET FILTERS
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="py-2.5 bg-[#021F94] text-[#F5F2F3] rounded-[2px] text-center active:opacity-80"
              >
                APPLY ({filteredListings.length})
              </button>
            </div>
          </div>
        </MobileArchitecturalDrawer>
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
              CAMPUS EXCHANGE DIRECTORY
            </div>
            <h1 className="mt-1 font-et-sans font-black tracking-[-0.045em] text-3xl sm:text-5xl">
              Explore marketplace
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Prices are shown before you request. Your own listings can be edited, paused or archived.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPostModalOpen(true)}
            className="shrink-0 px-5 py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
          >
            + Post a Skill / Request
          </button>
        </div>

        {/* Swiss Control Console ("Find the right exchange") */}
        <div className="et-card rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 font-et-mono text-[10.5px] uppercase tracking-[0.14em]">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--ink)]">
              <span className="w-2 h-2 rounded-sm bg-[var(--lime)]" />
              Find the right exchange
            </span>
            <span className="text-[var(--muted)] tabular">
              {filteredListings.length} ACTIVE LISTINGS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* All / Offers / Requests Segmented Toggle */}
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

            {/* Keyword Search Input */}
            <div className="lg:col-span-8 relative">
              <IconSearch className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, skill, keywords or author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
              />
            </div>
          </div>

          {/* Sub-Filters Strip: Format, Sort, Scope, Categories */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                aria-label="Filter by format"
                className="px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[11px] text-[var(--ink)] focus:outline-none"
              >
                <option value="All formats">All formats</option>
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>

              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value as any)}
                aria-label="Sort listings"
                className="px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[11px] text-[var(--ink)] focus:outline-none"
              >
                <option value="Recommended">Sort: Recommended</option>
                <option value="Lowest credits">Sort: Lowest credits</option>
                <option value="Highest rated">Sort: Highest rated</option>
              </select>

              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as any)}
                aria-label="Filter scope"
                className="px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[11px] text-[var(--ink)] focus:outline-none"
              >
                <option value="All listings">Scope: All listings</option>
                <option value="Saved only">Scope: Saved only</option>
                <option value="My listings">Scope: My listings</option>
              </select>
            </div>

            {/* Reset Filters Shortcut */}
            {(typeFilter !== 'All' ||
              formatFilter !== 'All formats' ||
              sortFilter !== 'Recommended' ||
              scopeFilter !== 'All listings' ||
              categoryFilter !== 'All' ||
              searchQuery) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="font-et-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--lime)] hover:underline"
              >
                Reset filters &times;
              </button>
            )}
          </div>

          {/* Quick-Filter Horizontal Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
            <span className="font-et-mono text-[10px] uppercase text-[var(--muted)] shrink-0 mr-1">
              Category:
            </span>
            {EXPLORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-sm font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 transition-colors ${
                  categoryFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[var(--ink)] text-[var(--bg)]'
                    : 'border border-[var(--border)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="et-card rounded-sm p-12 text-center space-y-3">
            <div className="font-et-mono text-xs uppercase text-[var(--muted)]">
              No matching listings found
            </div>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
              Try adjusting your search terms or clearing filters to see all available student exchanges.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-4 py-2 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.1em]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
