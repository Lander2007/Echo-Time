import React from 'react';
import { CIRCUITS } from '@/data/echoData';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';

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
                    <span>{CANONICAL_CONTENT.solution.eyebrow}</span>
                  </div>
                  <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                    {CANONICAL_CONTENT.solution.title}
                  </h2>
                </div>
                <div className="lg:col-span-4 lg:text-right font-swiss-mono text-[10.5px] uppercase tracking-[0.13em] text-muted">
                  {CANONICAL_CONTENT.solution.exampleCard.note}
                </div>
              </div>

              <div className="patchboard-chassis p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-strong font-swiss-mono text-[10.5px] uppercase tracking-[0.14em]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
                    <span className="font-semibold text-ink">
                      {CANONICAL_CONTENT.solution.exampleCard.eyebrow} &middot; {CANONICAL_CONTENT.solution.exampleCard.title}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-sm bg-[#061354] text-[#F5F2F3] tabular">
                    {CANONICAL_CONTENT.solution.exampleCard.totalLabel}: {CANONICAL_CONTENT.solution.exampleCard.totalValue}
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
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-[#565C73] mb-1 flex items-center justify-between">
                      <span>INPUT &middot; SKILL YOU OFFER</span>
                      <span className="text-[#021F94] font-semibold">+1.00 ECHO</span>
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
                          <div className="font-swiss-sans font-extrabold text-base mt-0.5 text-[#0B1026]">
                            {c.inTitle}
                          </div>
                          <div className="jack-sub font-swiss-mono text-[10.5px] mt-0.5 text-[#565C73]">
                            {c.inSub}
                          </div>
                        </div>
                        <span className="jack-socket" data-jack-in={c.inIdx} />
                      </button>
                    ))}
                  </div>

                  {/* CENTER COLUMN: ROUTING READOUT & CAPSTONE GUILD BUS */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-4 relative z-20 lg:px-4">
                    <div className="rounded border border-[#021F94]/25 bg-white p-5 flex-1 flex flex-col justify-between text-[#0B1026]">
                      <div>
                        <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-[#565C73] pb-3 border-b border-[#021F94]/15">
                          <span className="font-semibold text-[#021F94]">{CANONICAL_CONTENT.solution.exampleCard.title}</span>
                          <span className="text-[#021F94] font-bold tabular">{CANONICAL_CONTENT.solution.exampleCard.rateValue}</span>
                        </div>
                        <div className="mt-4 font-swiss-sans font-extrabold text-xl tracking-tight text-[#0B1026]">
                          {CANONICAL_CONTENT.solution.exampleCard.goalLabel}: {CANONICAL_CONTENT.solution.exampleCard.goalValue}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-[#565C73] leading-relaxed">
                          {CANONICAL_CONTENT.solution.description}
                        </p>
                        <div className="mt-3">
                          <a
                            href="#act-marketplace"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#021F94] text-[#F5F2F3] font-swiss-mono text-[10px] font-semibold uppercase tracking-[0.1em] hover:bg-[#032BCB] transition-colors"
                          >
                            {CANONICAL_CONTENT.solution.cta} &rarr;
                          </a>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#021F94]/15 flex flex-wrap items-center gap-1.5 font-swiss-mono text-[10px] uppercase">
                        <span className="px-2 py-1 rounded-sm bg-[#061354] text-[#F5F2F3]">
                          {CANONICAL_CONTENT.solution.exampleCard.formatValue}
                        </span>
                        <span className="text-[#021F94] font-bold">&rarr;</span>
                        <span className="px-2 py-1 rounded-sm bg-[#021F94] text-[#F5F2F3] font-semibold">
                          {CANONICAL_CONTENT.solution.exampleCard.durationValue}
                        </span>
                        <span className="text-[#021F94] font-bold">&rarr;</span>
                        <span className="px-2 py-1 rounded-sm bg-[#021F94] border border-[#061354] text-[#F5F2F3] font-semibold">
                          {CANONICAL_CONTENT.solution.exampleCard.totalValue}
                        </span>
                      </div>
                    </div>

                    {/* Embedded Capstone Guild Shared Treasury Module */}
                    <div className="rounded border border-strong bg-[#061354] text-[#F5F2F3] p-4">
                      <div className="flex items-center justify-between gap-2 font-swiss-mono text-[9.5px] uppercase tracking-[0.14em]">
                        <span style={{ color: '#B9C8FF', fontWeight: 600 }}>
                          SHARED CAPSTONE GUILD BUS
                        </span>
                        <span className="tabular font-semibold" style={{ color: '#D93829' }}>
                          {guildHours.toFixed(1)} / 16.0 ECHO
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs font-semibold">
                        Solar Telemetry PCB Sprint (
                        <span className="tabular">{guildContributors}</span> peers)
                      </div>
                      <div
                        className="mt-2.5 w-full h-1.5 rounded-sm overflow-hidden"
                        style={{ backgroundColor: 'rgba(245, 242, 243, 0.18)' }}
                      >
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (guildHours / 16.0) * 100).toFixed(1)}%`,
                            backgroundColor: '#D93829',
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className="font-swiss-mono text-[9.5px] uppercase"
                          style={{ color: '#B9C8FF' }}
                        >
                          BOUNTY: CAD AUDIT
                        </span>
                        <button
                          type="button"
                          data-cursor="PLEDGE"
                          onClick={handleGuildPledge}
                          className="px-3 py-1.5 rounded-sm font-swiss-mono text-[10px] font-semibold uppercase tracking-[0.11em] transition-transform active:scale-95"
                          style={{ backgroundColor: '#D93829', color: '#F5F2F3' }}
                        >
                          +0.5 ECHO Pledge
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: YOU UNLOCK */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 relative z-20">
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-[#565C73] mb-1 flex items-center justify-between">
                      <span>OUTPUT &middot; SKILL YOU UNLOCK</span>
                      <span className="text-[#0B1026] font-semibold">-1.00 ECHO</span>
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
                          <div className="font-swiss-sans font-extrabold text-base mt-0.5 text-[#0B1026]">
                            {c.outTitle}
                          </div>
                          <div className="jack-sub font-swiss-mono text-[10.5px] mt-0.5 text-[#565C73]">
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
