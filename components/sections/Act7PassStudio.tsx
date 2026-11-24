import React, { useState } from 'react';
import Link from 'next/link';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';

interface Act7PassStudioProps {
  studentName?: string;
  setStudentName?: React.Dispatch<React.SetStateAction<string>>;
  university?: string;
  setUniversity?: React.Dispatch<React.SetStateAction<string>>;
  primaryCraft?: string;
  setPrimaryCraft?: React.Dispatch<React.SetStateAction<string>>;
  sealStampKey?: number;
  passCardRef?: React.RefObject<HTMLDivElement | null>;
  passSpecularRef?: React.RefObject<HTMLDivElement | null>;
  passCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  handlePassCardMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePassCardLeave?: () => void;
  handleMintPass?: (e: React.FormEvent) => void;
  passSerial?: string;
  getAudio: () => TactileAudioEngine;
}

export const Act7PassStudio: React.FC<Act7PassStudioProps> = ({
  getAudio,
}) => {
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
        className="relative py-24 sm:py-36 border-t border-strong overflow-hidden bg-theme text-ink"
      >
        <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Section Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#021F94]/8 border border-[#021F94]/18 font-swiss-mono text-[10.5px] uppercase tracking-[0.16em] text-[#021F94] font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D93829]" />
              <span>07 &middot; {CANONICAL_CONTENT.cta.title}</span>
            </div>

            {/* Monumental Headline */}
            <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-4xl sm:text-6xl lg:text-7xl text-[#0B1026]">
              {CANONICAL_CONTENT.cta.title}
            </h2>

            {/* Supporting Description */}
            <p className="mt-6 text-base sm:text-lg text-[#565C73] max-w-2xl leading-relaxed">
              {CANONICAL_CONTENT.cta.description} Join verified students exchanging skills, collaborating on real projects, and growing portfolios with zero monetary cost.
            </p>

            {/* 3 Core Value Pillars */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
              <div className="p-5 rounded border border-[#021F94]/18 bg-white flex flex-col justify-between">
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] text-[#021F94] font-semibold">
                  PARITY LEDGER
                </div>
                <div className="mt-2 font-swiss-sans font-extrabold text-lg text-[#0B1026]">
                  1.00 HR = 1.00 ECHO
                </div>
                <div className="mt-1 font-swiss-mono text-xs text-[#565C73]">
                  Reciprocal time parity
                </div>
              </div>

              <div className="p-5 rounded border border-[#021F94]/18 bg-white flex flex-col justify-between">
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] text-[#021F94] font-semibold">
                  SEED GRANT
                </div>
                <div className="mt-2 font-swiss-sans font-extrabold text-lg text-[#0B1026]">
                  5.00 ECHO Starter
                </div>
                <div className="mt-1 font-swiss-mono text-xs text-[#565C73]">
                  Instant balance on signup
                </div>
              </div>

              <div className="p-5 rounded border border-[#021F94]/18 bg-white flex flex-col justify-between">
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] text-[#021F94] font-semibold">
                  STUDENT VERIFIED
                </div>
                <div className="mt-2 font-swiss-sans font-extrabold text-lg text-[#0B1026]">
                  Zero Financial Cost
                </div>
                <div className="mt-1 font-swiss-mono text-xs text-[#565C73]">
                  No credit cards required
                </div>
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login?mode=signup"
                data-cursor="SIGNUP"
                className="px-8 py-4 rounded bg-[#021F94] text-[#F5F2F3] font-swiss-mono text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#032BCB] transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#021F94]/15"
              >
                {CANONICAL_CONTENT.cta.primaryBtn} &rarr;
              </Link>
              <a
                href="#act-marketplace"
                className="px-6 py-4 rounded border border-[#021F94]/25 bg-white text-[#0B1026] font-swiss-mono text-xs font-semibold uppercase tracking-[0.14em] hover:border-[#021F94] transition-colors"
              >
                {CANONICAL_CONTENT.cta.secondaryBtn}
              </a>
            </div>

            <div className="mt-5 font-swiss-mono text-[11px] text-[#565C73]">
              Accredited university student email &middot; Instant access to all campus exchanges
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
