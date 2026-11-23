import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';

interface Act6StressTestProps {
  stressIdx: number;
  setStressIdx: React.Dispatch<React.SetStateAction<number>>;
  getAudio: () => TactileAudioEngine;
}

export const Act6StressTest: React.FC<Act6StressTestProps> = ({
  stressIdx,
  setStressIdx,
  getAudio,
}) => {
  const activePlan = CANONICAL_CONTENT.grow.plans[stressIdx] || CANONICAL_CONTENT.grow.plans[0];

  return (
    <section id="act-architecture" className="relative py-24 sm:py-32 border-t border-strong">
      <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10">
        {/* Community Metrics Header */}
        <div className="mb-16 pb-12 border-b border-strong">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5 font-swiss-mono text-[10.5px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>{CANONICAL_CONTENT.metrics.badge}</span>
              </div>
              <h2 className="font-swiss-sans font-black uppercase tracking-[-0.04em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                {CANONICAL_CONTENT.metrics.title}
              </h2>
            </div>
            <div className="font-swiss-mono text-[10.5px] text-muted">
              {CANONICAL_CONTENT.metrics.footnote}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CANONICAL_CONTENT.metrics.items.map((item) => (
              <div
                key={item.label}
                className="p-5 rounded border border-strong bg-surface flex flex-col justify-between"
              >
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-2">
                  {item.label}
                </div>
                <div className="font-swiss-mono font-bold text-3xl sm:text-4xl tabular text-accent">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header: Grow Beyond Single Exchange */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-5 pb-8 mb-10 border-b border-strong">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-pop font-semibold mb-2.5">
              <span className="text-xl font-bold text-accent">06</span>
              <span>{CANONICAL_CONTENT.grow.eyebrow}</span>
            </div>
            <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
              {CANONICAL_CONTENT.grow.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              {CANONICAL_CONTENT.grow.description}
            </p>
          </div>
        </div>

        {/* 2 Growth Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {CANONICAL_CONTENT.grow.features.map((feat) => (
            <div
              key={feat.badge}
              className="p-6 sm:p-8 rounded border border-strong bg-surface flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-[#021F94] text-[#F5F2F3] font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] font-semibold mb-4">
                  {feat.badge}
                </span>
                <h3 className="font-swiss-sans font-bold text-2xl text-ink mb-2">
                  {feat.title}
                </h3>
                <p className="font-swiss-sans text-sm text-muted leading-relaxed">
                  {feat.description}
                </p>
              </div>
              <div className="mt-6">
                <a
                  href="#act-pass"
                  className="inline-flex items-center gap-2 font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent hover:underline"
                >
                  {feat.cta} &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Subscription Plans Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Plan Selector Buttons */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            {CANONICAL_CONTENT.grow.plans.map((p, idx) => (
              <button
                key={p.name}
                type="button"
                data-cursor="PLAN"
                onClick={() => {
                  setStressIdx(idx);
                  getAudio().click();
                }}
                className={`stress-key-btn text-left p-4 sm:p-5 rounded border transition-all ${
                  stressIdx === idx
                    ? 'border-accent bg-surface is-active'
                    : 'border-strong bg-surface/60 hover:border-accent'
                }`}
              >
                <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  <span className="font-bold text-ink">{p.name}</span>
                  <span className="px-2 py-0.5 rounded-sm bg-accent/20 text-accent font-semibold">
                    {p.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Active Plan Detail Inspector */}
          <div className="lg:col-span-7 rounded border border-strong bg-surface p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme font-swiss-mono text-[10.5px] uppercase tracking-[0.14em]">
                <span className="text-ink font-semibold text-base">{activePlan.name} Plan</span>
                <span className="px-2.5 py-0.5 rounded-sm bg-[#021F94] text-[#F5F2F3] font-semibold">
                  {activePlan.badge}
                </span>
              </div>
              <p className="mt-4 font-swiss-sans text-sm text-ink leading-relaxed">
                {activePlan.desc}
              </p>

              <div className="mt-6 space-y-3">
                <div className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Included Capabilities
                </div>
                {activePlan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3 p-3 rounded bg-theme border border-strong">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="font-swiss-mono text-xs text-ink">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-theme flex flex-wrap items-center justify-between gap-3">
              <span className="font-swiss-mono text-[10.5px] text-muted">
                {activePlan.badge === 'Free plan' ? 'Instant access with student email' : 'Join the waitlist to receive updates'}
              </span>
              <a
                href="#act-pass"
                className="px-5 py-2.5 rounded bg-accent text-accent-ink font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-[#032BCB] transition-colors"
              >
                {activePlan.badge === 'Free plan' ? 'Start free' : 'Join waitlist'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
