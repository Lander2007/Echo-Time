import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';

interface Act2GuillotineProps {
  guillotineStageRef: React.RefObject<HTMLDivElement | null>;
  guillotineParityRef: React.RefObject<HTMLDivElement | null>;
  guillotineBladeRef: React.RefObject<HTMLDivElement | null>;
  guillotinePctRef: React.RefObject<HTMLSpanElement | null>;
  isDraggingBladeRef: React.MutableRefObject<boolean>;
  bladePctRef: React.MutableRefObject<number>;
  animateBladeTo: (pct: number) => void;
  updateBladeFromPointer: (clientX: number) => void;
  getAudio: () => TactileAudioEngine;
}

export const Act2Guillotine: React.FC<Act2GuillotineProps> = ({
  guillotineStageRef,
  guillotineParityRef,
  guillotineBladeRef,
  guillotinePctRef,
  isDraggingBladeRef,
  bladePctRef,
  animateBladeTo,
  updateBladeFromPointer,
  getAudio,
}) => {
  return (
          <section
            id="act-thesis"
            className="relative min-h-screen py-20 lg:py-24 flex flex-col justify-center"
          >
            <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10 my-auto">
              {/* Swiss Header Bar + Blade Controls */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-7 border-b border-strong">
                <div className="flex items-baseline gap-4">
                  <span className="font-swiss-mono font-semibold text-2xl sm:text-3xl tabular text-accent">
                    02
                  </span>
                  <div>
                    <div className="font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-ink font-semibold">
                      THE PARITY GUILLOTINE &mdash; MARKET CUTAWAY
                    </div>
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.13em] text-muted mt-0.5">
                      SCROLL OR DRAG THE COBALT BLADE ACROSS THE GRID
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                  <span
                    ref={guillotinePctRef}
                    className="px-2.5 py-1 rounded-sm bg-surface border border-strong tabular font-semibold text-accent"
                  >
                    CUT: 12%
                  </span>
                  <button
                    type="button"
                    data-cursor="CUT"
                    onClick={() => {
                      getAudio().click();
                      animateBladeTo(0);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-surface border border-strong hover:bg-[#1A1B17] hover:text-[#F1EFE8] text-ink transition-colors"
                  >
                    Legacy
                  </button>
                  <button
                    type="button"
                    data-cursor="CUT"
                    onClick={() => {
                      getAudio().click();
                      animateBladeTo(50);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-surface border border-strong hover:bg-[#1A1B17] hover:text-[#F1EFE8] text-ink transition-colors"
                  >
                    50/50 Split
                  </button>
                  <button
                    type="button"
                    data-cursor="CUT"
                    onClick={() => {
                      getAudio().click();
                      animateBladeTo(100);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-accent text-accent-ink font-semibold border border-accent transition-colors"
                  >
                    ECHO Parity
                  </button>
                </div>
              </div>

              {/* Dual-Layer Swiss Guillotine Poster */}
              <div
                ref={guillotineStageRef}
                className="guillotine-stage"
                data-cursor="DRAG"
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  isDraggingBladeRef.current = true;
                  updateBladeFromPointer(e.clientX);
                }}
              >
                {/* LAYER A: LEGACY CASH TUTORING REALITY (#1A1B17 + #F1EFE8) */}
                <div className="guillotine-layer guillotine-layer-legacy">
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b font-swiss-mono text-[10.5px] uppercase tracking-[0.16em]"
                    style={{
                      borderColor: 'rgba(241, 239, 232, 0.16)',
                      color: '#989A8E',
                    }}
                  >
                    <span>STATE A &middot; COMMERCIAL TUTORING &amp; GROUP CHATS</span>
                    <span
                      className="px-2 py-0.5 rounded-sm border"
                      style={{ borderColor: 'rgba(241, 239, 232, 0.24)', color: '#F1EFE8' }}
                    >
                      LOCKED OUT BY BUDGET
                    </span>
                  </div>

                  <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-7">
                      <div
                        className="font-swiss-mono text-[11px] uppercase tracking-[0.18em] mb-3"
                        style={{ color: '#989A8E' }}
                      >
                        {CANONICAL_CONTENT.problem.eyebrow}
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.2rem,4.8vw,4.4rem)]"
                        style={{ color: '#F1EFE8' }}
                      >
                        {CANONICAL_CONTENT.problem.title}
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#989A8E' }}
                      >
                        {CANONICAL_CONTENT.problem.description}
                      </p>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-1 gap-3 font-swiss-mono">
                      {CANONICAL_CONTENT.problem.points.map((pt) => (
                        <div
                          key={pt.num}
                          className="p-3.5 rounded-sm border"
                          style={{
                            borderColor: 'rgba(241, 239, 232, 0.16)',
                            backgroundColor: 'rgba(241, 239, 232, 0.03)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#C9E54B]">{pt.num}</span>
                            <span className="text-xs font-semibold text-[#F1EFE8]">{pt.title}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[#989A8E]">{pt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{
                      borderColor: 'rgba(241, 239, 232, 0.16)',
                      color: '#989A8E',
                    }}
                  >
                    <span>{CANONICAL_CONTENT.problem.title}</span>
                    <span style={{ color: '#C9E54B' }}>DRAG BLADE TO REVEAL SOLUTION &rarr;</span>
                  </div>
                </div>

                {/* LAYER B: ECHO TIME 1:1 PARITY (#C9E54B MAIN + #F1EFE8 CARDS + #1E3AE0 COBALT) */}
                <div ref={guillotineParityRef} className="guillotine-layer guillotine-layer-parity">
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b font-swiss-mono text-[10.5px] uppercase tracking-[0.16em]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                  >
                    <span className="font-semibold">
                      {CANONICAL_CONTENT.solution.eyebrow}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-sm font-semibold"
                      style={{
                        backgroundColor: '#1E3AE0',
                        color: '#F1EFE8',
                      }}
                    >
                      1.00 HR = 1.00 ECHO
                    </span>
                  </div>

                  <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-7">
                      <div
                        className="font-swiss-mono text-[11px] uppercase tracking-[0.18em] mb-3 font-bold"
                        style={{ color: '#1E3AE0' }}
                      >
                        {CANONICAL_CONTENT.solution.eyebrow}
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.2rem,4.8vw,4.4rem)]"
                        style={{ color: '#1A1B17' }}
                      >
                        {CANONICAL_CONTENT.solution.title}
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#383B30' }}
                      >
                        {CANONICAL_CONTENT.solution.description}
                      </p>
                      <div className="mt-5">
                        <a
                          href="#act-marketplace"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1E3AE0] text-[#F1EFE8] font-swiss-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] hover:bg-[#152bb5] transition-colors"
                        >
                          {CANONICAL_CONTENT.solution.cta} &rarr;
                        </a>
                      </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-1 gap-3 font-swiss-mono">
                      {CANONICAL_CONTENT.solution.bullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-sm border"
                          style={{
                            borderColor: '#1A1B17',
                            backgroundColor: '#F1EFE8',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#1E3AE0]">0{idx + 1}</span>
                            <span className="text-xs font-semibold text-[#1A1B17]">{bullet}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                  >
                    <span className="font-semibold">
                      {CANONICAL_CONTENT.solution.title}
                    </span>
                    <span className="font-bold" style={{ color: '#1E3AE0' }}>
                      {CANONICAL_CONTENT.solution.cta}
                    </span>
                  </div>
                </div>

                {/* RAZOR-SHARP INTERNATIONAL COBALT GUILLOTINE BLADE */}
                <div
                  ref={guillotineBladeRef}
                  className="guillotine-blade"
                  role="slider"
                  tabIndex={0}
                  aria-label="Parity Guillotine Comparison Slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={12}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    isDraggingBladeRef.current = true;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    updateBladeFromPointer(e.clientX);
                    getAudio().click();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      animateBladeTo(Math.min(100, bladePctRef.current + 10));
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      animateBladeTo(Math.max(0, bladePctRef.current - 10));
                    }
                  }}
                >
                  <div className="guillotine-handle" title="Drag left or right to slice">
                    <span className="font-swiss-mono text-[8px] font-bold tracking-widest">CUT</span>
                    <span className="w-4 h-[1.5px] bg-[#F1EFE8]" />
                    <span className="w-4 h-[1.5px] bg-[#F1EFE8]" />
                    <span className="font-swiss-mono text-[9px] font-bold leading-none">&harr;</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

  );
};
