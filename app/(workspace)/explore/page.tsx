'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingCard } from '@/components/workspace/ListingCard';
import { IconSearch } from '@/components/workspace/Icons';
import { ListingFormat } from '@/types/workspace';
import { EXPLORE_CATEGORIES } from '@/lib/seed-workspace';

export default function ExplorePage() {
  const { listings, setPostModalOpen } = useWorkspace();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Offers' | 'Requests'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<'All formats' | ListingFormat>('All formats');
  const [sortFilter, setSortFilter] = useState<'Recommended' | 'Lowest credits' | 'Highest rated'>('Recommended');
  const [scopeFilter, setScopeFilter] = useState<'All listings' | 'Saved only' | 'My listings'>('All listings');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

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
    <div className="et-animate-in space-y-6">
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
          className="shrink-0 px-5 py-3 rounded-sm bg-[#C9E54B] text-[#1A1B17] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
        >
          + Post a Skill / Request
        </button>
      </div>

      {/* Swiss Control Console ("Find the right exchange") */}
      <div className="et-card rounded-sm p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 font-et-mono text-[10.5px] uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--ink)]">
            <span className="w-2 h-2 rounded-sm bg-[#C9E54B]" />
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
                    ? 'bg-[#C9E54B] text-[#1A1B17]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="lg:col-span-8 relative">
            <IconSearch className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, categories or keywords"
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
            />
          </div>
        </div>

        {/* Format / Sort / Scope Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[10.5px]">
            <span className="text-[var(--muted)] uppercase">FORMAT</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as 'All formats' | ListingFormat)}
              className="bg-transparent text-[var(--ink)] font-semibold focus:outline-none"
            >
              <option value="All formats">All formats</option>
              <option value="Online">Online</option>
              <option value="In-person">In-person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[10.5px]">
            <span className="text-[var(--muted)] uppercase">SORT</span>
            <select
              value={sortFilter}
              onChange={(e) =>
                setSortFilter(
                  e.target.value as 'Recommended' | 'Lowest credits' | 'Highest rated'
                )
              }
              className="bg-transparent text-[var(--ink)] font-semibold focus:outline-none"
            >
              <option value="Recommended">Recommended</option>
              <option value="Lowest credits">Lowest credits</option>
              <option value="Highest rated">Highest rated</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-[var(--border)] bg-[var(--bg)] font-et-mono text-[10.5px]">
            <span className="text-[var(--muted)] uppercase">SCOPE</span>
            <select
              value={scopeFilter}
              onChange={(e) =>
                setScopeFilter(
                  e.target.value as 'All listings' | 'Saved only' | 'My listings'
                )
              }
              className="bg-transparent text-[var(--ink)] font-semibold focus:outline-none"
            >
              <option value="All listings">All listings</option>
              <option value="Saved only">Saved only</option>
              <option value="My listings">My listings</option>
            </select>
          </label>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {EXPLORE_CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-sm font-et-mono text-[11px] font-semibold uppercase tracking-[0.08em] border transition-all ${
                active
                  ? 'bg-[var(--cobalt)] text-[#F1EFE8] border-[var(--cobalt)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--border-strong)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="et-card rounded-sm p-12 text-center">
          <div className="font-et-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            No matching skills found.
          </div>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('All');
              setSearchQuery('');
              setCategoryFilter('All');
              setScopeFilter('All listings');
              setFormatFilter('All formats');
            }}
            className="mt-4 px-4 py-2 rounded-sm border border-[var(--border-strong)] font-et-mono text-[11px] uppercase hover:border-[var(--lime)]"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredListings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
