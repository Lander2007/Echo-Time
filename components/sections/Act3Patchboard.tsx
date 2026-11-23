import React from 'react';
import { CIRCUITS } from '@/data/echoData';
import { TactileAudioEngine } from '@/lib/audio';

interface Act3PatchboardProps {
  patchGridRef: React.RefObject<HTMLDivElement | null>;
  patchSvgRef: React.RefObject<SVGSVGElement | null>;
  activeCircuitIdx: number;
  setActiveCircuitIdx: React.Dispatch<React.SetStateAction<number>>;
  guildHours: number;
  guildContributors: number;
  userPledgedGuild: boolean;
  handleGuildPledge: () => void;
  getAudio: () => TactileAudioEngine;
}

export const Act3Patchboard: React.FC<Act3PatchboardProps> = ({
  patchGridRef,
  patchSvgRef,
  activeCircuitIdx,
  setActiveCircuitIdx,
  guildHours,
  guildContributors,
  userPledgedGuild,
  handleGuildPledge,
  getAudio,
}) => {
  const activeCircuit = CIRCUITS[activeCircuitIdx] || CIRCUITS[0];

  return (
          <section id="act-workflow" className="relative py-24 sm:py-28 border-t border-strong">
            <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-5 pb-7 mb-10 border-b border-strong">
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                    <span className="text-xl font-bold">03</span>
                    <span>CAMPUS SKILL PATCHBOARD &mdash; MULTI-HOP CREDIT ROUTING</span>
                  </div>
                  <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                    PLUG IN YOUR STRENGTH.{' '}
                    <span className="text-accent">ROUTE ANY SKILL.</span>
                  </h2>
                </div>
                <div className="lg:col-span-4 lg:text-right font-swiss-mono text-[10.5px] uppercase tracking-[0.13em] text-muted">
                  CLICK ANY JACK SOCKET TO PATCH LIVE CAMPUS CIRCUITS
                </div>
              </div>

              <div className="patchboard-chassis p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-strong font-swiss-mono text-[10.5px] uppercase tracking-[0.14em]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
                    <span className="font-semibold text-ink">
                      MODEL ET-03 &middot; CROSS-FACULTY LIQUIDITY ROUTER
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-sm bg-[#1A1B17] text-[#C9E54B] tabular">
                    {activeCircuit.routeLabel}
                  </span>
                </div>

                <div
                  ref={patchGridRef}
                  className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                  {/* Dynamic Desktop SVG Cable Matrix */}
                  <svg
                    ref={patchSvgRef}
                    className="hidden lg:block pointer-events-none absolute inset-0 w-full h-full z-10 overflow-visible"
                    aria-hidden="true"
                  />

                  {/* LEFT COLUMN: YOU OFFER */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 relative z-20">
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-1 flex items-center justify-between">
                      <span>INPUT &middot; SKILL YOU OFFER</span>
                      <span className="text-accent font-semibold">+1.00 ECHO</span>
                    </div>

                    {CIRCUITS.map((c, idx) => (
                      <button
                        key={c.inTag}
                        type="button"
                        data-cursor="PATCH"
                        onClick={() => {
                          setActiveCircuitIdx(idx);
                          getAudio().patch();
                        }}
                        className={`patch-jack-btn flex items-center justify-between gap-3 ${
                          activeCircuit.inIdx === c.inIdx ? 'is-patched' : ''
                        }`}
                      >
                        <div>
                          <div className="font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-accent font-semibold">
                            {c.inTag}
                          </div>
                          <div className="font-swiss-sans font-extrabold text-base mt-0.5">
                            {c.inTitle}
                          </div>
                          <div className="jack-sub font-swiss-mono text-[10.5px] text-muted mt-0.5">
                            {c.inSub}
                          </div>
                        </div>
                        <span className="jack-socket" data-jack-in={c.inIdx} />
                      </button>
                    ))}
                  </div>

                  {/* CENTER COLUMN: ROUTING READOUT & CAPSTONE GUILD BUS */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-4 relative z-20 lg:px-4">
                    <div className="rounded border border-strong bg-[#E6E3D8] p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-muted pb-3 border-b border-theme">
                          <span>ACTIVE CREDIT CIRCUIT</span>
                          <span className="text-accent font-semibold tabular">0% FRICTION</span>
                        </div>
                        <div className="mt-4 font-swiss-sans font-extrabold text-xl tracking-tight text-ink">
                          {activeCircuit.title}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                          {activeCircuit.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-theme flex flex-wrap items-center gap-1.5 font-swiss-mono text-[10px] uppercase">
                        <span className="px-2 py-1 rounded-sm bg-[#1A1B17] text-[#F1EFE8]">
                          {activeCircuit.hops[0]}
                        </span>
                        <span className="text-accent font-bold">&rarr;</span>
                        <span className="px-2 py-1 rounded-sm bg-accent text-accent-ink font-semibold">
                          {activeCircuit.hops[1]}
                        </span>
                        <span className="text-accent font-bold">&rarr;</span>
                        <span className="px-2 py-1 rounded-sm bg-[#C9E54B] border border-[#1A1B17] text-[#1A1B17] font-semibold">
                          {activeCircuit.hops[2]}
                        </span>
                      </div>
                    </div>

                    {/* Embedded Capstone Guild Shared Treasury Module */}
                    <div className="rounded border border-strong bg-[#1A1B17] text-[#F1EFE8] p-4">
                      <div className="flex items-center justify-between gap-2 font-swiss-mono text-[9.5px] uppercase tracking-[0.14em]">
                        <span style={{ color: '#6B84FF', fontWeight: 600 }}>
                          SHARED CAPSTONE GUILD BUS
                        </span>
                        <span className="tabular font-semibold" style={{ color: '#C9E54B' }}>
                          {guildHours.toFixed(1)} / 16.0 ECHO
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs font-semibold">
                        Solar Telemetry PCB Sprint (
                        <span className="tabular">{guildContributors}</span> peers)
                      </div>
                      <div
                        className="mt-2.5 w-full h-1.5 rounded-sm overflow-hidden"
                        style={{ backgroundColor: 'rgba(241, 239, 232, 0.14)' }}
                      >
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (guildHours / 16.0) * 100).toFixed(1)}%`,
                            backgroundColor: '#C9E54B',
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className="font-swiss-mono text-[9.5px] uppercase"
                          style={{ color: '#989A8E' }}
                        >
                          BOUNTY: CAD AUDIT
                        </span>
                        <button
                          type="button"
                          data-cursor="PLEDGE"
                          onClick={handleGuildPledge}
                          className="px-3 py-1.5 rounded-sm font-swiss-mono text-[10px] font-semibold uppercase tracking-[0.11em] transition-transform active:scale-95"
                          style={{ backgroundColor: '#C9E54B', color: '#1A1B17' }}
                        >
                          +0.5 ECHO Pledge
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: YOU UNLOCK */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 relative z-20">
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-1 flex items-center justify-between">
                      <span>OUTPUT &middot; SKILL YOU UNLOCK</span>
                      <span className="text-ink font-semibold">-1.00 ECHO</span>
                    </div>

                    {CIRCUITS.map((c, idx) => (
                      <div
                        key={c.outTag}
                        className={`patch-target-card flex items-center gap-3 ${
                          activeCircuit.outIdx === idx ? 'is-patched' : ''
                        }`}
                      >
                        <span className="jack-socket" data-jack-out={idx} />
                        <div>
                          <div className="font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-accent font-semibold">
                            {c.outTag}
                          </div>
                          <div className="font-swiss-sans font-extrabold text-base mt-0.5">
                            {c.outTitle}
                          </div>
                          <div className="jack-sub font-swiss-mono text-[10.5px] text-muted mt-0.5">
                            {c.outSub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

  );
};
