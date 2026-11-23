import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';

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
                        BROKEN CAMPUS STATUS QUO
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.4rem,5.4vw,4.9rem)]"
                        style={{ color: '#F1EFE8' }}
                      >
                        $65 / HOUR.
                        <br />
                        <span style={{ color: '#989A8E' }}>20% TAX.</span>
                        <br />
                        ZERO ESCROW.
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#989A8E' }}
                      >
                        Skilled students sit two halls apart, yet freelance platforms charge steep
                        cash paywalls while campus group chats collapse under ghosting and informal
                        favors.
                      </p>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-swiss-mono">
                      <div
                        className="p-4 rounded-sm border"
                        style={{
                          borderColor: 'rgba(241, 239, 232, 0.16)',
                          backgroundColor: 'rgba(241, 239, 232, 0.03)',
                        }}
                      >
                        <div className="text-[9.5px] uppercase" style={{ color: '#989A8E' }}>
                          MEDIAN TUTOR RATE
                        </div>
                        <div
                          className="mt-1.5 text-2xl sm:text-3xl font-semibold tabular"
                          style={{ color: '#F1EFE8' }}
                        >
                          $45&ndash;65
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: '#989A8E' }}>
                          Per single hour
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-sm border"
                        style={{
                          borderColor: 'rgba(241, 239, 232, 0.16)',
                          backgroundColor: 'rgba(241, 239, 232, 0.03)',
                        }}
                      >
                        <div className="text-[9.5px] uppercase" style={{ color: '#989A8E' }}>
                          PLATFORM TAKE RATE
                        </div>
                        <div
                          className="mt-1.5 text-2xl sm:text-3xl font-semibold tabular"
                          style={{ color: '#F1EFE8' }}
                        >
                          20.0%
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: '#989A8E' }}>
                          Extracted in cash
                        </div>
                      </div>
                      <div
                        className="col-span-2 p-4 rounded-sm border flex items-center justify-between"
                        style={{
                          borderColor: 'rgba(241, 239, 232, 0.16)',
                          backgroundColor: 'rgba(241, 239, 232, 0.03)',
                        }}
                      >
                        <div>
                          <div className="text-[9.5px] uppercase" style={{ color: '#989A8E' }}>
                            DISPUTE PROTECTION
                          </div>
                          <div className="mt-1 text-xs" style={{ color: '#F1EFE8' }}>
                            Informal DMs &mdash; no deliverable proof
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 text-[9.5px] uppercase rounded-sm border"
                          style={{
                            borderColor: 'rgba(241, 239, 232, 0.22)',
                            color: '#989A8E',
                          }}
                        >
                          UNVERIFIED
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{
                      borderColor: 'rgba(241, 239, 232, 0.16)',
                      color: '#989A8E',
                    }}
                  >
                    <span>RESULT: TALENT STRANDED BEHIND TUITION DEBT</span>
                    <span style={{ color: '#C9E54B' }}>SLICE RIGHT TO DEPLOY ECHO TIME &rarr;</span>
                  </div>
                </div>

                {/* LAYER B: ECHO TIME 1:1 PARITY (#C9E54B MAIN + #F1EFE8 CARDS + #1E3AE0 COBALT) */}
                <div ref={guillotineParityRef} className="guillotine-layer guillotine-layer-parity">
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b font-swiss-mono text-[10.5px] uppercase tracking-[0.16em]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                  >
                    <span className="font-semibold">
                      STATE B &middot; ECHO TIME PROTOCOL DEPLOYED
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
                        VERIFIED CAMPUS TIME PARITY
                      </div>
                      <h2
                        className="font-swiss-sans font-black uppercase tracking-[-0.05em] leading-[0.88] text-[clamp(2.4rem,5.4vw,4.9rem)]"
                        style={{ color: '#1A1B17' }}
                      >
                        1.00 HR = 1 ECHO.
                        <br />
                        <span style={{ color: '#1E3AE0' }}>0.00% FEE.</span>
                        <br />
                        ATOMIC ESCROW.
                      </h2>
                      <p
                        className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed"
                        style={{ color: '#383B30' }}
                      >
                        Every authenticated <strong style={{ color: '#1A1B17' }}>.edu</strong>{' '}
                        student hour holds identical purchasing power. Teach one hour of your
                        strength, lock atomic escrow, and unlock any peer skill on campus.
                      </p>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-swiss-mono">
                      <div
                        className="p-4 rounded-sm border"
                        style={{
                          borderColor: '#1A1B17',
                          backgroundColor: '#F1EFE8',
                        }}
                      >
                        <div className="text-[9.5px] uppercase" style={{ color: '#46493D' }}>
                          PLATFORM FEE
                        </div>
                        <div
                          className="mt-1.5 text-2xl sm:text-3xl font-semibold tabular"
                          style={{ color: '#1E3AE0' }}
                        >
                          <span className="stat-counter" data-target="0" data-suffix="%">
                            0%
                          </span>
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: '#46493D' }}>
                          Zero fiat custody
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-sm border"
                        style={{
                          borderColor: '#1A1B17',
                          backgroundColor: '#F1EFE8',
                        }}
                      >
                        <div className="text-[9.5px] uppercase" style={{ color: '#46493D' }}>
                          SHOW-UP RATE
                        </div>
                        <div
                          className="mt-1.5 text-2xl sm:text-3xl font-semibold tabular"
                          style={{ color: '#1A1B17' }}
                        >
                          <span
                            className="stat-counter"
                            data-target="99.2"
                            data-decimals="1"
                            data-suffix="%"
                          >
                            99.2%
                          </span>
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: '#46493D' }}>
                          Median match: 12m
                        </div>
                      </div>
                      <div
                        className="col-span-2 p-4 rounded-sm border flex items-center justify-between"
                        style={{
                          borderColor: '#1A1B17',
                          backgroundColor: '#1A1B17',
                          color: '#F1EFE8',
                        }}
                      >
                        <div>
                          <div
                            className="text-[9.5px] uppercase font-semibold"
                            style={{ color: '#C9E54B' }}
                          >
                            ESCROW GUARANTEE
                          </div>
                          <div className="mt-1 text-xs font-semibold" style={{ color: '#F1EFE8' }}>
                            Checklist locked + 48h Peer-Council SLA
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 text-[9.5px] font-semibold uppercase rounded-sm"
                          style={{ backgroundColor: '#1E3AE0', color: '#F1EFE8' }}
                        >
                          .EDU SSO
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                  >
                    <span className="font-semibold">
                      RESULT: CROSS-FACULTY LIQUIDITY WITHOUT TUITION DEBT
                    </span>
                    <span className="font-bold" style={{ color: '#1E3AE0' }}>
                      EQUILIBRIUM VERIFIED
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
