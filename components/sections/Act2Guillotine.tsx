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
                      SCROLL OR DRAG THE VERMILION BLADE ACROSS THE GRID
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                  <span
                    ref={guillotinePctRef}
                    className="px-2.5 py-1 rounded-sm bg-[#061354] border border-strong tabular font-semibold text-accent"
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
                    className="px-2.5 py-1 rounded-sm bg-[#061354] border border-strong hover:bg-[#F5F2F3] hover:text-[#021F94] text-ink transition-colors"
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
                    className="px-2.5 py-1 rounded-sm bg-[#061354] border border-strong hover:bg-[#F5F2F3] hover:text-[#021F94] text-ink transition-colors"
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
                {/* LAYER A: LEGACY CASH TUTORING REALITY (#061354 + #B9C8FF) */}
                <div className="guillotine-layer guillotine-layer-legacy">
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b font-swiss-mono text-[10.5px] uppercase tracking-[0.16em]"
                    style={{
                      borderColor: 'rgba(245, 242, 243, 0.16)',
                      color: '#B9C8FF',
                    }}
                  >
                    <span>STATE A &middot; COMMERCIAL TUTORING &amp; GROUP CHATS</span>
                    <span
                      className="px-2 py-0.5 rounded-sm border"
                      style={{ borderColor: 'rgba(245, 242, 243, 0.24)', color: '#F5F2F3' }}
                    >
                      LOCKED OUT BY BUDGET
                    </span>
                  </div>

                  <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-7">
                      <div
                        className="font-swiss-mono text-[11px] uppercase tracking-[0.18em] mb-3"
                        style={{ color: '#B9C8FF' }}
                      >
                        {CANONICAL_CONTENT.problem.eyebrow}
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.2rem,4.8vw,4.4rem)]"
                        style={{ color: '#F5F2F3' }}
                      >
                        {CANONICAL_CONTENT.problem.title}
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#B9C8FF' }}
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
                            borderColor: 'rgba(245, 242, 243, 0.16)',
                            backgroundColor: 'rgba(245, 242, 243, 0.04)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#D93829]">{pt.num}</span>
                            <span className="text-xs font-semibold text-[#F5F2F3]">{pt.title}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[#B9C8FF]">{pt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{
                      borderColor: 'rgba(245, 242, 243, 0.16)',
                      color: '#B9C8FF',
                    }}
                  >
                    <span>{CANONICAL_CONTENT.problem.title}</span>
                    <span style={{ color: '#D93829' }}>DRAG BLADE TO REVEAL SOLUTION &rarr;</span>
                  </div>
                </div>

                {/* LAYER B: ECHO TIME 1:1 PARITY (#F5F2F3 MAIN + #FFFFFF CARDS + #021F94 BLUE) */}
                <div ref={guillotineParityRef} className="guillotine-layer guillotine-layer-parity">
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b font-swiss-mono text-[10.5px] uppercase tracking-[0.16em]"
                    style={{ borderColor: 'rgba(2, 31, 148, 0.25)', color: '#0B1026' }}
                  >
                    <span className="font-semibold">
                      {CANONICAL_CONTENT.solution.eyebrow}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-sm font-semibold"
                      style={{
                        backgroundColor: '#021F94',
                        color: '#F5F2F3',
                      }}
                    >
                      1.00 HR = 1.00 ECHO
                    </span>
                  </div>

                  <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-7">
                      <div
                        className="font-swiss-mono text-[11px] uppercase tracking-[0.18em] mb-3 font-bold"
                        style={{ color: '#021F94' }}
                      >
                        {CANONICAL_CONTENT.solution.eyebrow}
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.2rem,4.8vw,4.4rem)]"
                        style={{ color: '#0B1026' }}
                      >
                        {CANONICAL_CONTENT.solution.title}
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#565C73' }}
                      >
                        {CANONICAL_CONTENT.solution.description}
                      </p>
                      <div className="mt-5">
                        <a
                          href="#act-marketplace"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#021F94] text-[#F5F2F3] font-swiss-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] hover:bg-[#032BCB] transition-colors"
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
                            borderColor: 'rgba(2, 31, 148, 0.20)',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#021F94]">0{idx + 1}</span>
                            <span className="text-xs font-semibold text-[#0B1026]">{bullet}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ borderColor: 'rgba(2, 31, 148, 0.25)', color: '#0B1026' }}
                  >
                    <span className="font-semibold">
                      {CANONICAL_CONTENT.solution.title}
                    </span>
                    <span className="font-bold" style={{ color: '#021F94' }}>
                      {CANONICAL_CONTENT.solution.cta}
                    </span>
                  </div>
                </div>

                {/* RAZOR-SHARP SWISS VERMILION GUILLOTINE BLADE */}
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
                    <span className="w-4 h-[1.5px] bg-[#FFFFFF]" />
                    <span className="w-4 h-[1.5px] bg-[#FFFFFF]" />
                    <span className="font-swiss-mono text-[9px] font-bold leading-none">&harr;</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

  );
};
