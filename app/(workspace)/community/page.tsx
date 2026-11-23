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

  return (
    <div className="et-animate-in max-w-[1160px] mx-auto space-y-7">
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
          onClick={() => {
            setEditingSpaceId(null);
            setSpaceForm({ kind: 'Project', tag: 'tech', title: '', description: '' });
            setSpaceModalOpen(true);
          }}
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
  );
}
