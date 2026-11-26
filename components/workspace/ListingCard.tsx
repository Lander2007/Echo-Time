'use client';

import React from 'react';
import { SkillListing } from '@/types/workspace';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconHeart, IconGlobe, IconClock, IconStar, IconArrowRight } from './Icons';

interface ListingCardProps {
  item: SkillListing;
}

export function ListingCard({ item }: ListingCardProps) {
  const { handleToggleSaveListing, handleOpenRoomForListing } = useWorkspace();
  const isOffer = item.type === 'Offering';

  return (
    <article className="et-card et-card-hover relative rounded-sm p-5 flex flex-col justify-between gap-5">
      {/* Top Row: Category + Type Pill + Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-et-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.category}
            </span>
            <span
              className="px-2 py-0.5 rounded-sm font-et-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]"
              style={
                isOffer
                  ? { backgroundColor: 'var(--lime)', color: 'var(--lime-ink)' }
                  : {
                      backgroundColor: 'rgba(107, 132, 255, 0.16)',
                      color: 'var(--cobalt)',
                      border: '1px solid rgba(107, 132, 255, 0.35)',
                    }
              }
            >
              {item.type}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleToggleSaveListing(item.id)}
            aria-label={item.saved ? 'Remove from saved' : 'Save listing'}
            className={`w-7 h-7 rounded-sm border flex items-center justify-center transition-colors ${
              item.saved
                ? 'border-[var(--lime)] text-[var(--lime)] bg-[var(--lime)]/10'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
            }`}
          >
            <IconHeart filled={item.saved} className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Author Strip */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-et-mono text-xs font-bold tracking-wider text-[var(--ink)] shrink-0">
            {item.authorInitials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[var(--ink)] truncate">
              {item.authorName}
            </div>
            <div className="flex items-center gap-2 flex-wrap font-et-mono text-[10px] text-[var(--muted)]">
              <span>{item.listedAt}</span>
              {item.rating !== null && (
                <span className="inline-flex items-center gap-1 tabular font-semibold" style={{ color: 'var(--lime)' }}>
                  <IconStar className="w-3 h-3" />
                  <span>{item.rating.toFixed(1)} ({item.reviewsCount} reviews)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h3 className="font-et-sans font-extrabold text-xl tracking-[-0.03em] text-[var(--ink)] leading-tight">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Spec Strip */}
        <div className="mt-4 flex items-center gap-4 font-et-mono text-[11px] tabular">
          <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
            <IconGlobe className="w-3.5 h-3.5 text-[var(--muted)]" />
            {item.format}
          </span>
          <span
            className="inline-flex items-center gap-1.5 font-semibold"
            style={{ color: isOffer ? 'var(--lime)' : 'var(--cobalt)' }}
          >
            <IconClock className="w-3.5 h-3.5" />
            {item.creditsPerHr} {item.creditsPerHr === 1 ? 'credit' : 'credits'} / hr
          </span>
        </div>
      </div>

      {/* Perforated Action Footer */}
      <div className="et-perforated pt-3.5 flex items-center justify-between gap-3">
        <span className="font-et-mono text-[9.5px] leading-snug text-[var(--muted)] max-w-[140px]">
          Agree on the details before the exchange begins
        </span>
        <button
          type="button"
          onClick={() => handleOpenRoomForListing(item)}
          className="group shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.09em] border border-[var(--border-strong)] text-[var(--ink)] hover:bg-[var(--lime)] hover:text-[var(--lime-ink)] hover:border-[var(--lime)] transition-colors"
        >
          <span>{isOffer ? 'Request skill' : 'Respond'}</span>
          <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}
