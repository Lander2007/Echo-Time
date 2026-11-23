import React from 'react';
import { PASS_PRESETS } from '@/data/echoData';
import { TactileAudioEngine } from '@/lib/audio';

interface Act7PassStudioProps {
  studentName: string;
  setStudentName: React.Dispatch<React.SetStateAction<string>>;
  university: string;
  setUniversity: React.Dispatch<React.SetStateAction<string>>;
  primaryCraft: string;
  setPrimaryCraft: React.Dispatch<React.SetStateAction<string>>;
  passCardRef: React.RefObject<HTMLDivElement | null>;
  passSpecularRef: React.RefObject<HTMLDivElement | null>;
  passCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlePassCardMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePassCardLeave: () => void;
  handleMintPass: (e: React.FormEvent) => void;
  sealStampKey: number;
  displayCraft: string;
  passSerial: string;
  getAudio: () => TactileAudioEngine;
}

export const Act7PassStudio: React.FC<Act7PassStudioProps> = ({
  studentName,
  setStudentName,
  university,
  setUniversity,
  primaryCraft,
  setPrimaryCraft,
  passCardRef,
  passSpecularRef,
  passCanvasRef,
  handlePassCardMove,
  handlePassCardLeave,
  handleMintPass,
  sealStampKey,
  displayCraft,
  passSerial,
  getAudio,
}) => {
  const displayStudentName = studentName.trim() || 'Founding Student';
  const displayUniversity = university.trim() || 'Accredited .edu Campus';

  return (
            <section
              id="act-pass"
              className="relative pt-24 sm:pt-32 pb-12 border-t border-strong overflow-hidden"
            >
              <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
                <div className="max-w-3xl pb-12 border-b border-strong">
                  <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-pop font-semibold mb-3">
                    <span className="text-xl font-bold text-accent">07</span>
                    <span>FOUNDING STUDENT PASS STUDIO</span>
                  </div>
                  <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-4xl sm:text-6xl text-ink">
                    MINT YOUR VERIFIED{' '}
                    <span className="text-accent">FOUNDING PASS.</span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
                    Customize a student credential below or pick a jury test preset to preview ECHO
                    TIME&rsquo;s deterministic ledger serial, Swiss embossed verification stamp, and
                    starting +2.00 ECHO seed grant.
                  </p>
                </div>

                {/* Split Studio: Controls + 3D Metallic Swiss Pass */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  {/* Left: Form Inputs & Quick Presets */}
                  <div className="lg:col-span-5">
                    <div className="mb-6">
                      <div className="font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-2.5">
                        INSTANT JURY TEST PRESETS
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PASS_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            data-cursor="FILL"
                            onClick={() => {
                              setStudentName(preset.name);
                              setUniversity(preset.uni);
                              setPrimaryCraft(preset.craft);
                              getAudio().click();
                            }}
                            className="px-3 py-1.5 rounded-sm border border-theme hover:border-accent font-swiss-mono text-[10px] uppercase tracking-[0.1em] text-ink transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleMintPass} className="space-y-4" noValidate>
                      <div>
                        <label
                          htmlFor="input-student-name"
                          className="block font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1.5"
                        >
                          FULL NAME
                        </label>
                        <input
                          id="input-student-name"
                          type="text"
                          maxLength={28}
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full px-4 py-3 rounded border border-theme bg-surface text-ink font-swiss-sans font-semibold text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="input-university"
                          className="block font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1.5"
                        >
                          UNIVERSITY / MAJOR
                        </label>
                        <input
                          id="input-university"
                          type="text"
                          maxLength={38}
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full px-4 py-3 rounded border border-theme bg-surface text-ink font-swiss-sans font-semibold text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="input-craft"
                          className="block font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1.5"
                        >
                          PRIMARY SKILL
                        </label>
                        <input
                          id="input-craft"
                          type="text"
                          maxLength={30}
                          value={primaryCraft}
                          onChange={(e) => setPrimaryCraft(e.target.value)}
                          className="w-full px-4 py-3 rounded border border-theme bg-surface text-ink font-swiss-sans font-semibold text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          data-cursor="MINT"
                          className="magnetic btn-roll w-full py-4 rounded bg-accent text-accent-ink border border-[#1A1B17] font-swiss-mono text-xs font-semibold uppercase tracking-[0.16em]"
                        >
                          <span className="btn-roll-inner">
                            <span className="btn-roll-text">Mint Campus Pass &rarr;</span>
                            <span className="btn-roll-text-clone" aria-hidden="true">
                              Mint Campus Pass &rarr;
                            </span>
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right: 3D Tilting Charcoal, Bone, Acid Lime & Cobalt Pass */}
                  <div className="lg:col-span-7 pass-perspective flex justify-center relative">
                    <canvas
                      ref={passCanvasRef}
                      className="pointer-events-none absolute -inset-10 w-[calc(100%+5rem)] h-[calc(100%+5rem)] z-20"
                    />

                    <div
                      ref={passCardRef}
                      data-cursor="TILT"
                      onMouseMove={handlePassCardMove}
                      onMouseLeave={handlePassCardLeave}
                      className="founding-pass-card w-full max-w-[560px] rounded p-6 sm:p-8 select-none"
                    >
                      <div ref={passSpecularRef} className="pass-specular" />

                      {/* Embossed Swiss Verified Stamp */}
                      {sealStampKey > 0 && (
                        <div
                          key={sealStampKey}
                          className="seal-stamped absolute right-6 top-16 z-20 pointer-events-none"
                        >
                          <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
                            <rect
                              x="6"
                              y="6"
                              width="88"
                              height="88"
                              rx="4"
                              fill="rgba(107, 132, 255, 0.16)"
                              stroke="#6B84FF"
                              strokeWidth="2.5"
                            />
                            <rect
                              x="13"
                              y="13"
                              width="74"
                              height="74"
                              rx="2"
                              stroke="#C9E54B"
                              strokeWidth="1"
                              strokeOpacity="0.8"
                            />
                            <text
                              x="50"
                              y="47"
                              textAnchor="middle"
                              fill="#F1EFE8"
                              fontFamily="Inter"
                              fontWeight="900"
                              fontSize="11"
                              letterSpacing="1.4"
                            >
                              VERIFIED
                            </text>
                            <text
                              x="50"
                              y="62"
                              textAnchor="middle"
                              fill="#C9E54B"
                              fontFamily="IBM Plex Mono"
                              fontWeight="600"
                              fontSize="8"
                              letterSpacing="1.2"
                            >
                              FOUNDING .EDU
                            </text>
                          </svg>
                        </div>
                      )}

                      {/* Pass Top Header */}
                      <div
                        className="relative z-10 flex items-start justify-between gap-4 pb-5 border-b"
                        style={{ borderColor: 'rgba(241, 239, 232, 0.18)' }}
                      >
                        <div>
                          <div
                            className="flex items-center gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.18em]"
                            style={{ color: '#989A8E' }}
                          >
                            <span
                              className="w-2 h-2 rounded-sm"
                              style={{ backgroundColor: '#6B84FF' }}
                            />
                            <span>ECHO TIME &middot; FOUNDING CAMPUS MEMBER</span>
                          </div>
                          <div
                            className="mt-1.5 font-swiss-sans font-black uppercase tracking-[-0.03em] text-2xl sm:text-3xl leading-none"
                            style={{ color: '#F1EFE8' }}
                          >
                            TIME BANK PASS
                          </div>
                        </div>

                        <svg className="w-11 h-8 shrink-0" viewBox="0 0 48 34" fill="none">
                          <rect
                            x="1"
                            y="1"
                            width="46"
                            height="32"
                            rx="3"
                            fill="rgba(107, 132, 255, 0.14)"
                            stroke="#6B84FF"
                            strokeWidth="1.4"
                          />
                          <path
                            d="M1 12H16M32 12H47M1 22H16M32 22H47M16 1V33M32 1V33"
                            stroke="#C9E54B"
                            strokeWidth="1.1"
                          />
                        </svg>
                      </div>

                      {/* Pass Holder Details */}
                      <div className="relative z-10 py-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                        <div className="sm:col-span-8">
                          <div
                            className="font-swiss-mono text-[9px] uppercase tracking-[0.16em]"
                            style={{ color: '#989A8E' }}
                          >
                            VERIFIED STUDENT
                          </div>
                          <div
                            className="mt-1 font-swiss-sans font-extrabold text-2xl sm:text-3xl tracking-tight truncate"
                            style={{ color: '#F1EFE8' }}
                          >
                            {displayStudentName}
                          </div>
                          <div
                            className="mt-1 font-swiss-mono text-xs truncate"
                            style={{ color: '#989A8E' }}
                          >
                            {displayUniversity}
                          </div>
                        </div>

                        <div className="sm:col-span-4 sm:text-right">
                          <div
                            className="font-swiss-mono text-[9px] uppercase tracking-[0.16em]"
                            style={{ color: '#989A8E' }}
                          >
                            SEED GRANT
                          </div>
                          <div
                            className="mt-1 font-swiss-mono font-semibold text-2xl tabular"
                            style={{ color: '#C9E54B' }}
                          >
                            2.00 ECHO
                          </div>
                        </div>
                      </div>

                      {/* Pass Bottom Serial Strip */}
                      <div
                        className="relative z-10 pt-4 border-t flex flex-wrap items-center justify-between gap-3"
                        style={{ borderColor: 'rgba(241, 239, 232, 0.18)' }}
                      >
                        <span
                          className="px-3 py-1 rounded-sm font-swiss-mono text-[10px] font-semibold uppercase tracking-[0.11em]"
                          style={{ backgroundColor: '#C9E54B', color: '#1A1B17' }}
                        >
                          {displayCraft}
                        </span>
                        <span
                          className="font-swiss-mono text-[11px] tabular tracking-[0.12em]"
                          style={{ color: '#6B84FF' }}
                        >
                          {passSerial}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

  );
};
