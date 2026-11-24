'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconSearch } from '@/components/workspace/Icons';

export default function CommunityPage() {
  const {
    spaces,
    setSpaceModalOpen,
    setEditingSpaceId,
    setSpaceForm,
    handleDeleteSpace,
    pushToast,
  } = useWorkspace();

  const [communityFilter, setCommunityFilter] = useState<'All' | 'Projects' | 'Groups' | 'Events'>('All');
  const [communitySearch, setCommunitySearch] = useState<string>('');

  const filteredSpaces = useMemo(() => {
    const q = communitySearch.trim().toLowerCase();
    return spaces.filter((s) => {
      if (communityFilter === 'Projects' && s.kind !== 'Project') return false;
      if (communityFilter === 'Groups' && s.kind !== 'Group') return false;
      if (communityFilter === 'Events' && s.kind !== 'Event') return false;
      if (q && !`${s.title} ${s.description} ${s.tag} ${s.hostName}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [spaces, communityFilter, communitySearch]);

  const openCreateSpace = () => {
    setEditingSpaceId(null);
    setSpaceForm({ kind: 'Project', tag: 'tech', title: '', description: '' });
    setSpaceModalOpen(true);
  };

  return (
    <div className="et-animate-in">
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px SWISS EDITORIAL COMMUNITY)
          ==================================================================== */}
      <div className="lg:hidden space-y-3.5 select-none">
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#021F94]/20">
          <div>
            <div className="font-mono text-[9px] font-bold text-[#021F94] uppercase tracking-wider">
              04 · COLLABORATION / COMMUNITY
            </div>
            <h1 className="font-sans font-black text-2xl text-[#0B1026] tracking-tight mt-0.5">
              Campus Spaces
            </h1>
          </div>
          <button
            type="button"
            onClick={openCreateSpace}
            className="px-3 py-1.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px] active:opacity-85"
          >
            + SPACE
          </button>
        </div>

        {/* Flush 4-Column Segmented Filter */}
        <div className="grid grid-cols-4 divide-x divide-[#021F94]/20 border border-[#021F94]/30 bg-white rounded-[2px] overflow-hidden font-mono text-[10px] font-bold uppercase text-center">
          {(['All', 'Projects', 'Groups', 'Events'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCommunityFilter(tab)}
              className={`py-2 transition-colors ${
                communityFilter === tab
                  ? 'bg-[#021F94] text-[#F5F2F3]'
                  : 'text-[#565C73] hover:text-[#0B1026]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Compact Search Input */}
        <div className="relative">
          <IconSearch className="w-4 h-4 text-[#565C73] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={communitySearch}
            onChange={(e) => setCommunitySearch(e.target.value)}
            placeholder="Search spaces, tags, hosts..."
            className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#021F94]/35 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
          />
        </div>

        {/* Count Indicator */}
        <div className="font-mono text-[10px] text-[#565C73] uppercase tracking-wider px-0.5">
          {filteredSpaces.length} {filteredSpaces.length === 1 ? 'SPACE AVAILABLE' : 'SPACES AVAILABLE'}
        </div>

        {/* Architectural Space Cards */}
        <div className="space-y-3">
          {filteredSpaces.length > 0 ? (
            filteredSpaces.map((sp) => (
              <article
                key={sp.id}
                className="et-m-box relative overflow-hidden select-none active:border-[#021F94] transition-colors"
              >
                <span className="et-m-tick-tl" />
                <span className="et-m-tick-br" />

                {/* Top Metadata Strip */}
                <div className="bg-[#F5F2F3]/80 border-b border-[#021F94]/18 px-3.5 py-2 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] font-bold text-[#021F94] uppercase tracking-wider">
                    — {sp.kind.toUpperCase()}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-[2px] border border-[#021F94]/25 bg-white font-mono text-[9px] text-[#565C73] uppercase font-bold">
                    #{sp.tag}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2">
                  <div className="font-mono text-[9.5px] font-bold text-[#021F94] uppercase tracking-wider">
                    → {sp.eyebrowCta}
                  </div>

                  {/* Title & Description with dir="auto" for Cairo / Arabic string support */}
                  <h2
                    className="font-sans font-bold text-lg text-[#0B1026] leading-snug"
                    dir="auto"
                  >
                    {sp.title}
                  </h2>

                  <p
                    className="text-xs text-[#565C73] leading-relaxed line-clamp-3"
                    dir="auto"
                  >
                    {sp.description}
                  </p>

                  <div className="pt-1 flex items-center gap-2 font-mono text-[10px] text-[#565C73]">
                    <span className="w-5 h-5 rounded-[2px] bg-[#021F94] text-[#F5F2F3] flex items-center justify-center font-bold text-[9px] shrink-0">
                      {sp.hostInitials}
                    </span>
                    <span className="truncate">Hosted by <strong className="text-[#0B1026]">{sp.hostName}</strong></span>
                  </div>
                </div>

                {/* Perforated Action Footer */}
                <div className="et-m-perforated bg-[#F5F2F3]/40 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#565C73] font-bold tabular uppercase">
                    {sp.members} {sp.members === 1 ? 'MEMBER' : 'MEMBERS'}
                  </span>

                  {sp.isHost ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpaceId(sp.id);
                          setSpaceForm({
                            kind: sp.kind,
                            tag: sp.tag,
                            title: sp.title,
                            description: sp.description,
                          });
                          setSpaceModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-[2px] border border-[#021F94]/40 bg-white font-mono text-[9.5px] font-bold uppercase text-[#021F94]"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpace(sp.id)}
                        className="px-2.5 py-1 rounded-[2px] border border-[#D93829]/40 bg-white font-mono text-[9.5px] font-bold uppercase text-[#D93829]"
                      >
                        DELETE
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pushToast(`Joined space: ${sp.title}`)}
                      className="px-3.5 py-1.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px] active:opacity-85"
                    >
                      JOIN →
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="et-m-box p-6 text-center space-y-2">
              <div className="font-mono text-xs font-bold text-[#565C73] uppercase">
                NO MATCHING SPACES FOUND
              </div>
              <p className="text-xs text-[#565C73]">
                Try adjusting your search terms or create a new student collaboration space.
              </p>
              <button
                type="button"
                onClick={openCreateSpace}
                className="mt-1 px-4 py-2 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px]"
              >
                + CREATE A SPACE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block max-w-[1160px] mx-auto space-y-7">
        <div className="pb-6 border-b border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
              STUDENT COLLABORATION
            </div>
            <h1 className="mt-1 font-et-sans font-black tracking-[-0.045em] text-4xl sm:text-5xl">
              Community
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Find teammates, join groups, and make room for the next useful connection.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateSpace}
            className="shrink-0 px-5 py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
          >
            + Create space
          </button>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] self-start">
            {(['All', 'Projects', 'Groups', 'Events'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCommunityFilter(tab)}
                className={`px-4 py-1.5 rounded-sm font-et-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  communityFilter === tab
                    ? 'bg-[var(--lime)] text-[var(--lime-ink)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <IconSearch className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
              placeholder="Search projects, groups, and events"
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
            />
          </div>
        </div>

        {/* Community Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpaces.map((sp) => (
            <article
              key={sp.id}
              className="et-card et-card-hover relative rounded-sm p-6 flex flex-col justify-between gap-6"
            >
              <span className="et-tick-tl" />
              <span className="et-tick-br" />
              <div>
                <div className="flex items-center gap-2.5 font-et-mono text-[10px] uppercase tracking-[0.14em]">
                  <span className="font-bold text-[var(--cobalt)]">&mdash; {sp.kind}</span>
                  <span className="px-2 py-0.5 rounded-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]">
                    {sp.tag}
                  </span>
                </div>
                <div className="mt-3 font-et-mono text-[11px] font-semibold text-[var(--lime)]">
                  → {sp.eyebrowCta}
                </div>
                <h2 className="mt-2 font-et-sans font-extrabold text-2xl tracking-tight text-[var(--ink)]">
                  {sp.title}
                </h2>
                <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                  {sp.description}
                </p>

                <div className="mt-5 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-sm bg-[var(--cobalt)] text-[#F1EFE8] font-et-mono text-[10px] font-bold flex items-center justify-center">
                    {sp.hostInitials}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Hosted by <strong className="text-[var(--ink)]">{sp.hostName}</strong>
                  </span>
                </div>
              </div>

              <div className="et-perforated pt-4 flex items-center justify-between gap-2">
                <span className="font-et-mono text-xs text-[var(--muted)] tabular">
                  Members <strong className="text-[var(--ink)] ml-1">{sp.members}</strong>
                </span>
                {sp.isHost && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpaceId(sp.id);
                        setSpaceForm({
                          kind: sp.kind,
                          tag: sp.tag,
                          title: sp.title,
                          description: sp.description,
                        });
                        setSpaceModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-sm border border-[var(--border-strong)] font-et-mono text-[10.5px] uppercase hover:border-[var(--lime)] hover:text-[var(--lime)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpace(sp.id)}
                      className="px-3 py-1.5 rounded-sm border border-[var(--border)] font-et-mono text-[10.5px] uppercase text-[var(--muted)] hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
