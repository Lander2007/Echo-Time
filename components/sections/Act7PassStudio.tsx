import React, { useState } from 'react';
import Link from 'next/link';
import { PASS_PRESETS } from '@/data/echoData';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';

interface Act7PassStudioProps {
  studentName: string;
  setStudentName: React.Dispatch<React.SetStateAction<string>>;
  university: string;
  setUniversity: React.Dispatch<React.SetStateAction<string>>;
  primaryCraft: string;
  setPrimaryCraft: React.Dispatch<React.SetStateAction<string>>;
  sealStampKey: number;
  passCardRef: React.RefObject<HTMLDivElement | null>;
  passSpecularRef: React.RefObject<HTMLDivElement | null>;
  passCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlePassCardMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePassCardLeave: () => void;
  handleMintPass: (e: React.FormEvent) => void;
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
  sealStampKey,
  passCardRef,
  passSpecularRef,
  passCanvasRef,
  handlePassCardMove,
  handlePassCardLeave,
  handleMintPass,
  passSerial,
  getAudio,
}) => {
  const displayStudentName = studentName.trim() || 'Founding Student';
  const displayUniversity = university.trim() || 'Accredited .edu Campus';
  const displayCraft = primaryCraft.trim() || 'System Contributor';

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'create' | 'welcome'>('create');

  const toggleFaq = (idx: number) => {
    getAudio().click();
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <>
      {/* SECTION: QUESTIONS & ANSWERS (FAQS) */}
      <section id="act-faq" className="relative py-24 sm:py-32 border-t border-strong bg-theme text-ink">
        <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-strong">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 font-swiss-mono text-[10.5px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>{CANONICAL_CONTENT.faq.eyebrow}</span>
              </div>
              <h2 className="font-swiss-sans font-black uppercase tracking-[-0.04em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                {CANONICAL_CONTENT.faq.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
                {CANONICAL_CONTENT.faq.description}
              </p>
            </div>
            <div>
              <a
                href="#act-marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-strong bg-surface text-ink font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-accent hover:text-accent transition-colors"
              >
                {CANONICAL_CONTENT.faq.cta} &rarr;
              </a>
            </div>
          </div>

          {/* 7 Verbatim FAQ Accordions */}
          <div className="mt-12 max-w-4xl mx-auto space-y-3 font-swiss-sans">
            {CANONICAL_CONTENT.faq.items.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded border border-strong bg-surface overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-swiss-mono text-xs font-bold text-accent">0{idx + 1}</span>
                      <span className="font-bold text-base sm:text-lg text-ink">{item.question}</span>
                    </div>
                    <span className="font-swiss-mono text-xl text-accent font-light shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-muted leading-relaxed border-t border-strong/40">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: PASS STUDIO / SIGN UP / CTA */}
      <section
        id="act-pass"
        className="relative pt-24 sm:pt-32 pb-20 border-t border-strong overflow-hidden bg-theme text-ink"
      >
        <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
          <div className="max-w-3xl pb-12 border-b border-strong">
            <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-pop font-semibold mb-3">
              <span className="text-xl font-bold text-accent">07</span>
              <span>{CANONICAL_CONTENT.cta.title}</span>
            </div>
            <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-4xl sm:text-6xl text-ink">
              {CANONICAL_CONTENT.cta.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
              {CANONICAL_CONTENT.cta.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`px-5 py-2.5 rounded font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  activeTab === 'create'
                    ? 'bg-accent text-accent-ink'
                    : 'border border-strong text-ink hover:border-accent'
                }`}
              >
                {CANONICAL_CONTENT.cta.primaryBtn}
              </button>
              <a
                href="#act-marketplace"
                className="px-5 py-2.5 rounded border border-strong bg-surface text-ink font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-accent transition-colors"
              >
                {CANONICAL_CONTENT.cta.secondaryBtn}
              </a>
            </div>
          </div>

          {/* Split Studio: Controls + 3D Metallic Swiss Pass */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Account Form / Welcome State */}
            <div className="lg:col-span-5">
              {activeTab === 'create' ? (
                <>
                  <div className="mb-6">
                    <div className="font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-2.5">
                      {CANONICAL_CONTENT.cta.signupCard.subtitle}
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
                        {CANONICAL_CONTENT.cta.signupCard.fields[0]}
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
                        htmlFor="input-email"
                        className="block font-swiss-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1.5"
                      >
                        {CANONICAL_CONTENT.cta.signupCard.fields[1]}
                      </label>
                      <input
                        id="input-email"
                        type="email"
                        placeholder="student@university.edu"
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
                          <span className="btn-roll-text">{CANONICAL_CONTENT.cta.signupCard.submit} &rarr;</span>
                          <span className="btn-roll-text-clone" aria-hidden="true">
                            {CANONICAL_CONTENT.cta.signupCard.submit} &rarr;
                          </span>
                        </span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Welcome State Preview */
                <div className="p-6 rounded border border-strong bg-surface space-y-6">
                  <div>
                    <h3 className="font-swiss-sans font-black text-2xl text-ink">
                      {CANONICAL_CONTENT.cta.welcomeState.title}
                    </h3>
                    <p className="font-swiss-sans text-sm text-muted mt-1">
                      {CANONICAL_CONTENT.cta.welcomeState.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-swiss-mono">
                    <div className="p-3.5 rounded bg-theme border border-strong">
                      <div className="text-[10px] text-muted uppercase">{CANONICAL_CONTENT.cta.welcomeState.stats[0]}</div>
                      <div className="text-xl font-bold text-accent mt-1">5.00 ECHO</div>
                    </div>
                    <div className="p-3.5 rounded bg-theme border border-strong">
                      <div className="text-[10px] text-muted uppercase">{CANONICAL_CONTENT.cta.welcomeState.stats[1]}</div>
                      <div className="text-xl font-bold text-ink mt-1">0</div>
                    </div>
                    <div className="p-3.5 rounded bg-theme border border-strong">
                      <div className="text-[10px] text-muted uppercase">{CANONICAL_CONTENT.cta.welcomeState.stats[2]}</div>
                      <div className="text-xl font-bold text-ink mt-1">5.00 ★</div>
                    </div>
                    <div className="p-3.5 rounded bg-theme border border-strong">
                      <div className="text-[10px] text-muted uppercase">{CANONICAL_CONTENT.cta.welcomeState.stats[3]}</div>
                      <div className="text-xl font-bold text-ink mt-1">12</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a
                      href="#act-marketplace"
                      className="flex-1 py-3 text-center rounded bg-accent text-accent-ink font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
                    >
                      {CANONICAL_CONTENT.cta.welcomeState.actions[0]}
                    </a>
                    <a
                      href="#act-escrow"
                      className="flex-1 py-3 text-center rounded border border-strong text-ink font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
                    >
                      {CANONICAL_CONTENT.cta.welcomeState.actions[1]}
                    </a>
                  </div>

                  <Link
                    href="/dashboard"
                    className="w-full py-3 text-center rounded bg-accent text-accent-ink font-swiss-mono text-[11px] font-bold uppercase tracking-[0.12em] block hover:brightness-95 transition-all mt-2"
                  >
                    Enter Student Workspace →
                  </Link>
                </div>
              )}
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
                      <span>ECHO TIME &middot; STUDENT MEMBER</span>
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
                      5.00 ECHO
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
    </>
  );
};
