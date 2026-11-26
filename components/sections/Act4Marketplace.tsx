import React from 'react';
import { CATEGORIES, SLAT_INDICES } from '@/data/echoData';
import { CategoryFilter, MarketplaceListing } from '@/types/echo';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';
import { IconArrowRight, IconCheck, IconStar } from '@/components/workspace/Icons';

interface Act4MarketplaceProps {
  walletAvailable: number;
  walletLocked: number;
  activeCategory: CategoryFilter;
  setActiveCategory: React.Dispatch<React.SetStateAction<CategoryFilter>>;
  filterShellRef: React.RefObject<HTMLDivElement | null>;
  filterPillRef: React.RefObject<HTMLDivElement | null>;
  moveFilterPill: (cat: CategoryFilter) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortMode: 'rating' | 'hours-asc' | 'hours-desc';
  setSortMode: React.Dispatch<React.SetStateAction<'rating' | 'hours-asc' | 'hours-desc'>>;
  marketBoardRef: React.RefObject<HTMLDivElement | null>;
  boardClock: string;
  triggerFlapScramble: () => void;
  filteredListings: MarketplaceListing[];
  expandedRowId: string | null;
  setExpandedRowId: React.Dispatch<React.SetStateAction<string | null>>;
  handleOpenAgreementRoom: (listing: MarketplaceListing) => void;
  getAudio: () => TactileAudioEngine;
}

export const Act4Marketplace: React.FC<Act4MarketplaceProps> = ({
  walletAvailable,
  walletLocked,
  activeCategory,
  setActiveCategory,
  filterShellRef,
  filterPillRef,
  moveFilterPill,
  searchQuery,
  setSearchQuery,
  sortMode,
  setSortMode,
  marketBoardRef,
  boardClock,
  triggerFlapScramble,
  filteredListings,
  expandedRowId,
  setExpandedRowId,
  handleOpenAgreementRoom,
  getAudio,
}) => {
  return (
          <section
            id="act-marketplace"
            className="relative py-24 sm:py-28 pb-28 sm:pb-36 border-t border-strong"
          >
            <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
              {/* HOW IT WORKS: 4-Step Journey */}
              <div className="pb-16 border-b border-strong">
                <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                  <span className="text-xl font-bold">04</span>
                  <span>{CANONICAL_CONTENT.howItWorks.eyebrow}</span>
                </div>
                <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                  {CANONICAL_CONTENT.howItWorks.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
                  {CANONICAL_CONTENT.howItWorks.description}
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CANONICAL_CONTENT.howItWorks.steps.map((st) => (
                    <div
                      key={st.step}
                      className="p-5 rounded border border-[#021F94]/25 bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-swiss-mono text-sm font-bold text-[#021F94] mb-2">
                          {st.step}
                        </div>
                        <h3 className="font-swiss-sans font-bold text-base text-[#0B1026] mb-2">
                          {st.title}
                        </h3>
                        <p className="font-swiss-sans text-xs text-[#565C73] leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISCOVER: SBB Split-Flap Exchange Board */}
              <div className="pt-16">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-strong">
                  <div>
                    <div className="font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                      {CANONICAL_CONTENT.discover.eyebrow}
                    </div>
                    <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                      {CANONICAL_CONTENT.discover.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-muted">
                      {CANONICAL_CONTENT.discover.description} &middot; {CANONICAL_CONTENT.discover.note}
                    </p>
                  </div>

                  {/* Live Demo Wallet Telemetry (Warm Bone Card on Acid Lime) */}
                  <div className="inline-flex items-center gap-5 px-5 py-3 rounded border border-[#021F94]/25 bg-white">
                    <div>
                      <div className="font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-[#565C73]">
                        {CANONICAL_CONTENT.discover.wallet.labels[0]}
                      </div>
                      <div className="font-swiss-mono font-semibold text-xl tabular text-[#0B1026]">
                        {walletAvailable.toFixed(2)} ECHO
                      </div>
                    </div>
                    <div className="h-8 w-px bg-[#021F94]/20" />
                    <div>
                      <div className="font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-[#565C73]">
                        {CANONICAL_CONTENT.discover.wallet.labels[1]}
                      </div>
                      <div className="font-swiss-mono font-semibold text-xl tabular text-[#021F94]">
                        {walletLocked.toFixed(2)} ECHO
                      </div>
                    </div>
                  </div>
                </div>

              {/* Controls: Sliding Category Tabs + Search + Sort + Flip Board */}
              <div className="mt-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div
                  ref={filterShellRef}
                  className="filter-tab-shell"
                  role="tablist"
                  aria-label="Filter skill listings by discipline"
                >
                  <div ref={filterPillRef} className="filter-sliding-pill" aria-hidden="true" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      data-category={cat}
                      data-cursor="FILTER"
                      onClick={() => {
                        setActiveCategory(cat);
                        window.requestAnimationFrame(() => triggerFlapScramble());
                      }}
                      className={`filter-tab-btn ${activeCategory === cat ? 'is-active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter board: Next.js, Rhino, SQL..."
                      aria-label="Search student listings"
                      className="w-full pl-9 pr-4 py-2 rounded border border-[#021F94]/25 bg-white text-sm text-[#0B1026] placeholder:text-[#565C73] focus:outline-none focus:border-[#021F94] transition-colors"
                    />
                    <svg
                      className="w-4 h-4 text-[#565C73] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="9" cy="9" r="6" />
                      <path d="M13.5 13.5L17.5 17.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  <select
                    value={sortMode}
                    onChange={(e) => {
                      setSortMode(e.target.value as 'rating' | 'hours-asc' | 'hours-desc');
                      window.requestAnimationFrame(() => triggerFlapScramble());
                    }}
                    aria-label="Sort listings"
                    className="px-4 py-2 rounded border border-[#021F94]/25 bg-white hover:border-[#021F94] font-swiss-mono text-[11px] uppercase tracking-[0.09em] text-[#0B1026] focus:outline-none focus:border-[#021F94] transition-colors"
                  >
                    <option value="rating">Sort: Highest Rating</option>
                    <option value="hours-asc">Sort: Shortest Session</option>
                    <option value="hours-desc">Sort: Deepest Session</option>
                  </select>

                  <button
                    type="button"
                    data-cursor="FLIP"
                    onClick={triggerFlapScramble}
                    className="px-3.5 py-2 rounded border border-strong bg-[#061354] text-[#F5F2F3] hover:bg-[#021F94] hover:border-[#021F94] font-swiss-mono text-[10.5px] font-semibold uppercase tracking-[0.11em] transition-colors"
                  >
                    Flip Board
                  </button>
                </div>
              </div>

              {/* Swiss SBB Mechanical Split-Flap Board */}
              <div className="mt-7 sbb-board-shell">
                <div
                  className="px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 font-swiss-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    borderColor: 'rgba(245, 242, 243, 0.14)',
                    backgroundColor: '#040C38',
                    color: '#B9C8FF',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded-sm font-semibold"
                      style={{ backgroundColor: '#021F94', color: '#F5F2F3' }}
                    >
                      SBB &middot; CAMPUS LIVE
                    </span>
                    <span>CLICK ANY ROW TO INSPECT PERFORATED AGREEMENT STUB</span>
                  </div>
                  <span className="tabular" style={{ color: '#F5F2F3' }}>
                    {boardClock}
                  </span>
                </div>

                {/* Desktop Column Headers */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-3 px-6 py-2.5 border-b font-swiss-mono text-[9.5px] uppercase tracking-[0.16em]"
                  style={{
                    borderColor: 'rgba(245, 242, 243, 0.10)',
                    backgroundColor: '#061354',
                    color: '#B9C8FF',
                  }}
                >
                  <span className="col-span-1">SLOT</span>
                  <span className="col-span-4">SKILL EXCHANGE</span>
                  <span className="col-span-3">PEER / CAMPUS</span>
                  <span className="col-span-2">CAP &amp; RATING</span>
                  <span className="col-span-2 text-right">BOARD STATUS</span>
                </div>

                {/* Split-Flap Rows */}
                <div ref={marketBoardRef}>
                  {filteredListings.length === 0 ? (
                    <div
                      className="p-10 text-center font-swiss-mono text-xs uppercase tracking-[0.14em]"
                      style={{ color: '#B9C8FF' }}
                    >
                      NO DEPARTURES MATCHING QUERY &mdash; CLEAR FILTER TO RE-SYNC BOARD
                    </div>
                  ) : (
                    filteredListings.map((item) => {
                      const isOpen = expandedRowId === item.id;
                      return (
                        <div key={item.id} className="sbb-row-wrapper">
                          <button
                            type="button"
                            data-cursor="STUB"
                            onClick={() => {
                              setExpandedRowId((prev) => (prev === item.id ? null : item.id));
                              getAudio().flap();
                            }}
                            className={`sbb-row-btn ${
                              isOpen ? 'is-expanded' : ''
                            } px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center`}
                          >
                            <div className="lg:col-span-1 flex items-center justify-between lg:block">
                              <span
                                className="flap-cell text-xs font-semibold tabular"
                                data-flap-text={item.slot}
                              >
                                {item.slot}
                              </span>
                              <span
                                className={`lg:hidden flap-cell ${
                                  item.status !== 'OPEN' ? 'flap-cell-accent' : ''
                                } text-[10px] font-semibold`}
                                data-flap-text={item.status}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="lg:col-span-4">
                              <div className="font-swiss-sans font-extrabold text-base sm:text-lg tracking-tight text-[#F5F2F3] leading-snug">
                                {item.title}
                              </div>
                              <div
                                className="mt-0.5 font-swiss-mono text-[10px] uppercase tracking-[0.12em]"
                                style={{ color: '#B9C8FF' }}
                              >
                                {item.category} &middot; {item.sessions} SETTLED SESSIONS
                              </div>
                            </div>

                            <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
                              <span
                                className="flap-cell text-[10.5px]"
                                data-flap-text={item.hall}
                              >
                                {item.hall}
                              </span>
                              <span
                                className="font-swiss-mono text-xs"
                                style={{ color: '#B9C8FF' }}
                              >
                                {item.peer}
                              </span>
                            </div>

                            <div className="lg:col-span-2 flex items-center gap-2">
                              <span
                                className="flap-cell text-xs font-semibold tabular"
                                style={{ color: '#F5F2F3' }}
                                data-flap-text={`${item.hours.toFixed(1)} HR`}
                              >
                                {item.hours.toFixed(1)} HR
                              </span>
                              <span
                                className="inline-flex items-center gap-1 font-swiss-mono text-[11px] tabular"
                                style={{ color: '#B9C8FF' }}
                              >
                                <IconStar filled className="w-3 h-3" />
                                <span>{item.rating.toFixed(2)}</span>
                              </span>
                            </div>

                            <div className="hidden lg:flex lg:col-span-2 items-center justify-end gap-2.5">
                              <span
                                className={`flap-cell ${
                                  item.status !== 'OPEN' ? 'flap-cell-accent' : ''
                                } text-[10px] font-semibold`}
                                style={item.status === 'OPEN' ? { color: '#F5F2F3' } : undefined}
                                data-flap-text={item.status}
                              >
                                {item.status}
                              </span>
                              <span
                                className="font-swiss-mono text-xs"
                                style={{ color: '#B9C8FF' }}
                              >
                                {isOpen ? '−' : '+'}
                              </span>
                            </div>
                          </button>

                          {/* Inline Perforated Warm Bone Ticket Stub */}
                          <div className={`ticket-stub-drawer ${isOpen ? 'is-open' : ''}`}>
                            <div>
                              <div className="perforated-edge px-5 sm:px-7 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                                <div className="lg:col-span-7">
                                  <div
                                    className="font-swiss-mono text-[9.5px] uppercase tracking-[0.16em] font-semibold"
                                    style={{ color: '#021F94' }}
                                  >
                                    PERFORATED AGREEMENT STUB &middot; {item.meta}
                                  </div>
                                  <p
                                    className="mt-1.5 text-sm leading-relaxed"
                                    style={{ color: '#0B1026' }}
                                  >
                                    {item.summary}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.deliverables.map((d) => (
                                      <span
                                        key={d}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-swiss-mono text-[10px]"
                                        style={{
                                          borderColor: 'rgba(2, 31, 148, 0.16)',
                                          backgroundColor: '#F5F2F3',
                                          color: '#0B1026',
                                        }}
                                      >
                                        <IconCheck className="w-3 h-3 text-[#021F94]" />
                                        <span>{d}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div
                                  className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0"
                                  style={{ borderColor: 'rgba(2, 31, 148, 0.16)' }}
                                >
                                  <div className="font-swiss-mono">
                                    <div
                                      className="text-[9px] uppercase"
                                      style={{ color: '#565C73' }}
                                    >
                                      PARITY CAP
                                    </div>
                                    <div className="text-xl font-semibold tabular">
                                      {item.hours.toFixed(2)} ECHO
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    data-cursor="OPEN"
                                    onClick={() => handleOpenAgreementRoom(item)}
                                    className="group inline-flex items-center gap-2 px-5 py-3 rounded-sm font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-transform active:scale-95"
                                    style={{
                                      backgroundColor: '#021F94',
                                      color: '#F5F2F3',
                                    }}
                                  >
                                    <span>Open Agreement Room</span>
                                    <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

  );
};
