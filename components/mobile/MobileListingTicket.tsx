'use client';

import React from 'react';
import { SkillListing } from '@/types/workspace';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconArrowRight, IconStar } from '@/components/workspace/Icons';

interface MobileListingTicketProps {
  item: SkillListing;
}

export function MobileListingTicket({ item }: MobileListingTicketProps) {
  const { handleToggleSaveListing, handleOpenRoomForListing } = useWorkspace();
  const isOffer = item.type === 'Offering';

  return (
    <article className="et-m-box relative overflow-hidden select-none active:border-[#021F94] transition-colors">
      <span className="et-m-tick-tl" />
      <span className="et-m-tick-br" />

      {/* Top Metadata Strip */}
      <div className="bg-[#F5F2F3]/80 border-b border-[#021F94]/18 px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[9.5px] font-bold uppercase tracking-wider ${
              isOffer
                ? 'bg-[#021F94] text-[#F5F2F3]'
                : 'border border-[#021F94] text-[#021F94]'
            }`}
          >
            {item.type}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#565C73] truncate">
            {item.category}
          </span>
        </div>

        {/* Save Toggle */}
        <button
          type="button"
          onClick={() => handleToggleSaveListing(item.id)}
          aria-label={item.saved ? 'Unsave listing' : 'Save listing'}
          className="font-mono text-[10.5px] font-bold tracking-wider px-2 py-0.5 rounded-[2px] transition-colors active:opacity-75"
        >
          {item.saved ? (
            <span className="inline-flex items-center gap-1 text-[#D93829]">
              <IconStar filled className="w-3 h-3" />
              <span>SAVED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#565C73] hover:text-[#0B1026]">
              <IconStar filled={false} className="w-3 h-3" />
              <span>SAVE</span>
            </span>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans font-bold text-base text-[#0B1026] leading-snug line-clamp-2">
            {item.title}
          </h3>
          <div className="font-mono font-black text-base text-[#021F94] tabular shrink-0">
            {Number(item.creditsPerHr || 1).toFixed(1)} ECHO
          </div>
        </div>

        <p className="text-xs text-[#565C73] line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="pt-1 flex items-center gap-2 font-mono text-[10px] text-[#565C73] truncate">
          <span className="font-bold text-[#0B1026]">{item.authorName}</span>
          <span>·</span>
          <span>{item.format}</span>
          {item.rating !== null && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#021F94] font-bold tabular">
                <IconStar filled className="w-3 h-3" />
                <span>{Number(item.rating || 5).toFixed(1)}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Perforated Action Stub */}
      <div className="et-m-perforated bg-[#F5F2F3]/40 px-3.5 py-2.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#565C73]">
          1.00 HR PARITY · 0% FEE
        </span>

        <button
          type="button"
          onClick={() => handleOpenRoomForListing(item)}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#021F94] text-[#F5F2F3] font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] rounded-[2px] active:opacity-80 transition-opacity shrink-0"
        >
          <span>{isOffer ? 'REQUEST' : 'RESPOND'}</span>
          <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}
