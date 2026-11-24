import React, { useState } from 'react';
import Link from 'next/link';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';
import { BrandLogo } from '@/components/BrandLogo';

interface Act7PassStudioProps {
  studentName?: string;
  setStudentName?: React.Dispatch<React.SetStateAction<string>>;
  university?: string;
  setUniversity?: React.Dispatch<React.SetStateAction<string>>;
  primaryCraft?: string;
  setPrimaryCraft?: React.Dispatch<React.SetStateAction<string>>;
  sealStampKey: number;
  passCardRef: React.RefObject<HTMLDivElement | null>;
  passSpecularRef: React.RefObject<HTMLDivElement | null>;
  passCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlePassCardMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePassCardLeave: () => void;
  handleMintPass?: (e: React.FormEvent) => void;
  passSerial: string;
  getAudio: () => TactileAudioEngine;
}

export const Act7PassStudio: React.FC<Act7PassStudioProps> = ({
  studentName = 'Maya Chen',
  university = 'UC Berkeley — Computer Science',
  primaryCraft = 'Next.js & TypeScript Audits',
  sealStampKey,
  passCardRef,
  passSpecularRef,
  passCanvasRef,
  handlePassCardMove,
  handlePassCardLeave,
  passSerial,
  getAudio,
}) => {
  const displayStudentName = studentName?.trim() || 'Maya Chen';
  const displayUniversity = university?.trim() || 'UC Berkeley — Computer Science';
  const displayCraft = primaryCraft?.trim() || 'Next.js & TypeScript Audits';

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

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
          </div>

          {/* Split Studio: Overview & CTA + 3D Metallic Swiss Pass */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Account Overview & Primary Action */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="font-swiss-mono text-[10.5px] uppercase tracking-[0.16em] text-[#021F94] font-semibold mb-2">
                  OFFICIAL STUDENT CREDENTIAL
                </div>
                <h3 className="font-swiss-sans font-black uppercase tracking-tight text-3xl sm:text-4xl text-[#0B1026] leading-tight">
                  Instant Access &middot; 5.00 ECHO Seed Grant
                </h3>
                <p className="mt-3 font-swiss-sans text-sm text-[#565C73] leading-relaxed">
                  Join verified university students exchanging skills, collaborating on real projects, and growing portfolios with zero monetary cost.
                </p>
              </div>

              <div className="space-y-3 font-swiss-mono text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded bg-white border border-[#021F94]/18 text-[#0B1026]">
                  <span className="w-2 h-2 rounded-full bg-[#021F94]" />
                  <span>1.00 HR = 1.00 ECHO Reciprocal Parity</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded bg-white border border-[#021F94]/18 text-[#0B1026]">
                  <span className="w-2 h-2 rounded-full bg-[#021F94]" />
                  <span>No credit card required &middot; Student email verification</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded bg-white border border-[#021F94]/18 text-[#0B1026]">
                  <span className="w-2 h-2 rounded-full bg-[#021F94]" />
                  <span>Interactive Time Bank Pass issued upon registration</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/login?mode=signup"
                  data-cursor="SIGNUP"
                  className="px-8 py-4 rounded bg-[#021F94] text-[#F5F2F3] font-swiss-mono text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#032BCB] transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#021F94]/15"
                >
                  Create your free account &rarr;
                </Link>
                <a
                  href="#act-marketplace"
                  className="px-6 py-4 rounded border border-[#021F94]/25 bg-white text-[#0B1026] font-swiss-mono text-xs font-semibold uppercase tracking-[0.14em] hover:border-[#021F94] transition-colors"
                >
                  Keep exploring
                </a>
              </div>
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
                        fill="rgba(217, 56, 41, 0.16)"
                        stroke="#D93829"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="74"
                        height="74"
                        rx="2"
                        stroke="#D93829"
                        strokeWidth="1"
                        strokeOpacity="0.8"
                      />
                      <text
                        x="50"
                        y="47"
                        textAnchor="middle"
                        fill="#F5F2F3"
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
                        fill="#D93829"
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
                  style={{ borderColor: 'rgba(245, 242, 243, 0.18)' }}
                >
                  <div>
                    <div
                      className="flex items-center gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: '#B9C8FF' }}
                    >
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ backgroundColor: '#D93829' }}
                      />
                      <span>ECHO TIME &middot; STUDENT MEMBER</span>
                    </div>
                    <div
                      className="mt-1.5 font-swiss-sans font-black uppercase tracking-[-0.03em] text-2xl sm:text-3xl leading-none"
                      style={{ color: '#F5F2F3' }}
                    >
                      TIME BANK PASS
                    </div>
                  </div>

                  <BrandLogo surface="blue" variant="mark" size="sm" className="shrink-0" />
                </div>

                {/* Pass Holder Details */}
                <div className="relative z-10 py-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                  <div className="sm:col-span-8">
                    <div
                      className="font-swiss-mono text-[9px] uppercase tracking-[0.16em]"
                      style={{ color: '#B9C8FF' }}
                    >
                      VERIFIED STUDENT
                    </div>
                    <div
                      className="mt-1 font-swiss-sans font-extrabold text-2xl sm:text-3xl tracking-tight truncate"
                      style={{ color: '#F5F2F3' }}
                    >
                      {displayStudentName}
                    </div>
                    <div
                      className="mt-1 font-swiss-mono text-xs truncate"
                      style={{ color: '#B9C8FF' }}
                    >
                      {displayUniversity}
                    </div>
                  </div>

                  <div className="sm:col-span-4 sm:text-right">
                    <div
                      className="font-swiss-mono text-[9px] uppercase tracking-[0.16em]"
                      style={{ color: '#B9C8FF' }}
                    >
                      SEED GRANT
                    </div>
                    <div
                      className="mt-1 font-swiss-mono font-semibold text-2xl tabular"
                      style={{ color: '#F5F2F3' }}
                    >
                      5.00 ECHO
                    </div>
                  </div>
                </div>

                {/* Pass Bottom Serial Strip */}
                <div
                  className="relative z-10 pt-4 border-t flex flex-wrap items-center justify-between gap-3"
                  style={{ borderColor: 'rgba(245, 242, 243, 0.18)' }}
                >
                  <span
                    className="px-3 py-1 rounded-sm font-swiss-mono text-[10px] font-semibold uppercase tracking-[0.11em]"
                    style={{ backgroundColor: '#021F94', color: '#F5F2F3' }}
                  >
                    {displayCraft}
                  </span>
                  <span
                    className="font-swiss-mono text-[11px] tabular tracking-[0.12em]"
                    style={{ color: '#B9C8FF' }}
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
