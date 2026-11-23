import React from 'react';
import { STRESS_SCENARIOS } from '@/data/echoData';
import { StressScenario } from '@/types/echo';
import { TactileAudioEngine } from '@/lib/audio';

interface Act6StressTestProps {
  stressIdx: number;
  setStressIdx: React.Dispatch<React.SetStateAction<number>>;
  activeStressScenario: StressScenario;
  stressCurvePathRef: React.RefObject<SVGPathElement | null>;
  stressPulseDotRef: React.RefObject<SVGCircleElement | null>;
  visibleLogCount: number;
  setVisibleLogCount: React.Dispatch<React.SetStateAction<number>>;
  getAudio: () => TactileAudioEngine;
}

export const Act6StressTest: React.FC<Act6StressTestProps> = ({
  stressIdx,
  setStressIdx,
  activeStressScenario,
  stressCurvePathRef,
  stressPulseDotRef,
  visibleLogCount,
  setVisibleLogCount,
  getAudio,
}) => {
  return (
            <section id="act-architecture" className="relative py-24 sm:py-32 border-t border-strong">
              <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-5 pb-8 mb-10 border-b border-strong">
                  <div className="lg:col-span-8">
                    <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-pop font-semibold mb-2.5">
                      <span className="text-xl font-bold text-accent">06</span>
                      <span>JUDGE STRESS-TEST CONSOLE &mdash; LIVE FAULT INJECTION</span>
                    </div>
                    <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                      TRY TO BREAK <span className="text-accent">THE PROTOCOL.</span>
                    </h2>
                  </div>
                  <div className="lg:col-span-4 lg:text-right font-swiss-mono text-[10.5px] uppercase tracking-[0.13em] text-muted">
                    TRIGGER AN EDGE CASE BELOW TO INSPECT LIVE GOVERNANCE
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: 3 Tactile Fault-Injection Switches */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    {STRESS_SCENARIOS.map((sc, idx) => (
                      <button
                        key={sc.switchTag}
                        type="button"
                        data-cursor="INJECT"
                        onClick={() => {
                          setStressIdx(idx);
                          getAudio().alarm();
                        }}
                        className={`stress-key-btn ${stressIdx === idx ? 'is-active' : ''}`}
                      >
                        <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                          <span>{sc.switchTag}</span>
                          <span className="stress-led" />
                        </div>
                        <div className="mt-2 font-swiss-sans font-extrabold text-xl text-ink">
                          {sc.switchTitle}
                        </div>
                        <p className="mt-1.5 text-xs text-muted leading-relaxed">
                          {sc.switchDesc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Right: Live Oscilloscope Telemetry & Protocol Stream */}
                  <div className="lg:col-span-7 rounded border border-strong bg-surface p-6 sm:p-7 flex flex-col justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme font-swiss-mono text-[10.5px] uppercase tracking-[0.14em]">
                      <span className="text-ink font-semibold">{activeStressScenario.title}</span>
                      <span className="px-2.5 py-0.5 rounded-sm bg-pop text-[#F1EFE8] font-semibold">
                        {activeStressScenario.pill}
                      </span>
                    </div>

                    {/* Live SVG Telemetry Graph */}
                    <div className="rounded border border-theme bg-theme p-4">
                      <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-muted mb-2">
                        <span>{activeStressScenario.chartLabel}</span>
                        <span className="text-accent font-semibold tabular">
                          {activeStressScenario.chartMetric}
                        </span>
                      </div>
                      <svg viewBox="0 0 560 140" className="w-full h-36 overflow-visible">
                        <line
                          x1="0"
                          y1="28"
                          x2="560"
                          y2="28"
                          stroke="rgba(241,239,232,0.08)"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1="70"
                          x2="560"
                          y2="70"
                          stroke="rgba(241,239,232,0.08)"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1="112"
                          x2="560"
                          y2="112"
                          stroke="rgba(241,239,232,0.14)"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1={activeStressScenario.limitY}
                          x2="560"
                          y2={activeStressScenario.limitY}
                          stroke="#6B84FF"
                          strokeWidth="1.3"
                          strokeDasharray="5 5"
                        />
                        <text
                          x="556"
                          y={activeStressScenario.limitY - 6}
                          textAnchor="end"
                          fill="#6B84FF"
                          fontFamily="IBM Plex Mono"
                          fontSize="9"
                        >
                          {activeStressScenario.limitText}
                        </text>
                        <path
                          ref={stressCurvePathRef}
                          d={activeStressScenario.curve}
                          fill="none"
                          stroke="#C9E54B"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        <circle
                          ref={stressPulseDotRef}
                          cx={activeStressScenario.dot.cx}
                          cy={activeStressScenario.dot.cy}
                          r="5"
                          fill="#6B84FF"
                          stroke="#F1EFE8"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>

                    {/* Live Streaming Protocol Audit Terminal */}
                    <div className="rounded border border-theme bg-[#131411] p-4 font-swiss-mono text-[11px] leading-relaxed min-h-[132px]">
                      <div className="text-[9.5px] uppercase tracking-[0.16em] text-muted pb-2 mb-2 border-b border-theme flex justify-between">
                        <span>PROTOCOL EVENT STREAM</span>
                        <span className="text-pop">LIVE SIMULATION</span>
                      </div>
                      <div className="space-y-1.5 text-ink">
                        {activeStressScenario.logs.slice(0, visibleLogCount).map((line, i) => {
                          const isLast = i === activeStressScenario.logs.length - 1;
                          const color = i === 0 ? '#6B84FF' : isLast ? '#C9E54B' : '#989A8E';
                          return (
                            <div key={line} style={{ color }}>
                              {line}
                              {isLast && <span className="term-cursor ml-1.5" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Architectural Invariant Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-swiss-mono">
                      {activeStressScenario.metrics.map((m) => (
                        <div key={m.k} className="p-3.5 rounded border border-theme bg-theme">
                          <div className="text-[9.5px] uppercase text-muted">{m.k}</div>
                          <div className="mt-1 text-lg font-semibold tabular text-accent">
                            {m.v}
                          </div>
                          <div className="text-[10px] text-muted mt-0.5">{m.s}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

  );
};
