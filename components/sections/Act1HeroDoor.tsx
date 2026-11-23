import React from 'react';
import { SLAT_INDICES } from '@/data/echoData';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
}

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  return (
        <section
          id="act-hero"
          className="theme-dark relative w-full min-h-screen overflow-hidden"
          style={{ backgroundColor: '#1A1B17', color: '#F1EFE8' }}
        >
          {/* Camera Rig Wrapper: Powers 60fps Mechanical Screen-Shake Without Breaking GSAP Pin */}
          <div
            ref={heroCameraRigRef}
            className="swiss-grid-dark relative w-full min-h-screen pt-[78px] pb-8 flex flex-col items-center justify-center"
            style={{ willChange: 'transform' }}
          >
            {/* Kinetic Impact Vignette Flash */}
            <div ref={heroImpactVignetteRef} className="hero-impact-vignette" aria-hidden="true" />

            {/* Elevated Swiss Poster Stage */}
            <div className="relative z-20 max-w-[1400px] w-full mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-y-7 lg:gap-x-10 xl:gap-x-14">
              {/* Left Split Swiss Display Headline */}
              <div className="order-2 lg:order-1 text-center lg:text-right">
                <div
                  id="hero-meta-left"
                  className="hero-stagger hidden lg:inline-flex items-center gap-2 mb-4 font-swiss-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: '#989A8E' }}
                >
                  <span>01 / PORTAL</span>
                  <span className="w-4 h-[1px]" style={{ backgroundColor: '#6B84FF' }} />
                </div>
                <h1
                  id="hero-headline-left"
                  className="hero-stagger font-swiss-sans font-black uppercase tracking-[-0.048em] leading-[0.88] text-[clamp(2.85rem,5.6vw,5.6rem)]"
                  style={{ color: '#F1EFE8' }}
                >
                  TRADE
                  <br className="hidden lg:inline" /> HOURS,
                </h1>
              </div>

              {/* Centerpiece: Elevated 3D Swiss Architectural Dual-Leaf Opening Door */}
              <div id="atelier-portal-stage" className="order-1 lg:order-2 swiss-portal-stage mx-auto">
                <div id="atelier-window-outer" className="swiss-door-outer" data-cursor="OPEN">
                  {/* Kinetic Door-Stop Slam Frame & Latch Shockwave */}
                  <div ref={doorImpactFrameRef} className="door-impact-frame" aria-hidden="true" />
                  <div ref={latchPulseRef} className="latch-pulse-ring" aria-hidden="true" />

                  {/* Swiss Signal Corner Registration Ticks */}
                  <span className="door-corner-tick tick-tl" aria-hidden="true" />
                  <span className="door-corner-tick tick-tr" aria-hidden="true" />
                  <span className="door-corner-tick tick-bl" aria-hidden="true" />
                  <span className="door-corner-tick tick-br" aria-hidden="true" />

                  {/* Inner Acid Lime Poster with International Cobalt Accents */}
                  <div className="swiss-door-aperture">
                    <div className="door-daylight-poster">
                      <div id="door-sunbeam" className="door-sunbeam" aria-hidden="true" />

                      <div
                        className="relative z-10 flex items-center justify-between pb-2.5 border-b font-swiss-mono text-[9px] uppercase tracking-[0.16em]"
                        style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#46493D' }}
                      >
                        <span>ECHO TIME LEDGER</span>
                        <span style={{ color: '#1E3AE0', fontWeight: 700 }}>FIG. 01</span>
                      </div>

                      <div className="relative z-10 my-auto py-3">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-swiss-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
                          style={{
                            backgroundColor: '#1E3AE0',
                            color: '#F1EFE8',
                          }}
                        >
                          <span>PARITY OPEN</span>
                        </div>
                        <div
                          className="mt-3.5 font-swiss-sans font-black uppercase tracking-[-0.045em] text-3xl sm:text-4xl leading-[0.94]"
                          style={{ color: '#1A1B17' }}
                        >
                          1.00 HR =
                          <br />
                          1.00 ECHO
                        </div>
                        <p
                          className="mt-3 font-swiss-mono text-[10.5px] leading-relaxed max-w-[230px]"
                          style={{ color: '#46493D' }}
                        >
                          Cross-faculty student skill exchange settled atomically with zero tuition
                          fees.
                        </p>
                      </div>

                      <div
                        className="relative z-10 pt-2.5 border-t flex items-center justify-between font-swiss-mono text-[9px] uppercase tracking-[0.14em]"
                        style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                      >
                        <span>0.00% FEE</span>
                        <span style={{ color: '#1E3AE0', fontWeight: 700 }}>ATOMIC ESCROW</span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Swinging Architectural Double Doors Overlay */}
                  <div className="shutter-plane">
                    {/* Left Door Leaf */}
                    <div id="shutter-left" className="shutter-door shutter-door-left">
                      <span className="swiss-hinge hinge-lt" aria-hidden="true" />
                      <span className="swiss-hinge hinge-lb" aria-hidden="true" />
                      <div
                        className="flex items-center justify-between font-swiss-mono text-[9px] tracking-[0.14em]"
                        style={{ color: '#989A8E' }}
                      >
                        <span>L—01</span>
                        <span
                          className="w-1.5 h-1.5 rounded-sm"
                          style={{ backgroundColor: '#C9E54B' }}
                        />
                      </div>
                      <div className="swiss-louver-grid" aria-hidden="true">
                        {SLAT_INDICES.map((i) => (
                          <div key={`l-${i}`} className="swiss-slat" />
                        ))}
                      </div>
                      <div
                        className="font-swiss-mono text-[8.5px] uppercase tracking-[0.16em]"
                        style={{ color: '#989A8E' }}
                      >
                        ECHO.SYS
                      </div>
                    </div>

                    {/* Right Door Leaf */}
                    <div id="shutter-right" className="shutter-door shutter-door-right">
                      <span className="swiss-hinge hinge-rt" aria-hidden="true" />
                      <span className="swiss-hinge hinge-rb" aria-hidden="true" />
                      <div
                        className="flex items-center justify-between font-swiss-mono text-[9px] tracking-[0.14em]"
                        style={{ color: '#989A8E' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-sm"
                          style={{ backgroundColor: '#6B84FF' }}
                        />
                        <span>R—02</span>
                      </div>
                      <div className="swiss-louver-grid" aria-hidden="true">
                        {SLAT_INDICES.map((i) => (
                          <div key={`r-${i}`} className="swiss-slat" />
                        ))}
                      </div>
                      <div
                        className="font-swiss-mono text-[8.5px] uppercase tracking-[0.16em] text-right"
                        style={{ color: '#989A8E' }}
                      >
                        1:1 PARITY
                      </div>
                    </div>

                    {/* Central Swiss Lock Bar */}
                    <div id="shutter-latch-wrap" className="shutter-latch-wrap" aria-hidden="true">
                      <div className="swiss-latch-plate">
                        <div id="shutter-latch-lever" className="shutter-latch-lever" />
                      </div>
                    </div>
                  </div>

                  {/* Architectural Steel Threshold Sill */}
                  <div className="swiss-door-threshold" aria-hidden="true" />
                </div>
              </div>

              {/* Right Split Acid Lime Display Headline */}
              <div className="order-3 text-center lg:text-left -mt-4 lg:mt-0">
                <div
                  id="hero-meta-right"
                  className="hero-stagger hidden lg:inline-flex items-center gap-2 mb-4 font-swiss-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: '#989A8E' }}
                >
                  <span className="w-4 h-[1px]" style={{ backgroundColor: '#C9E54B' }} />
                  <span>TIME BANK</span>
                </div>
                <div
                  id="hero-headline-right"
                  className="hero-stagger font-swiss-sans font-black uppercase tracking-[-0.048em] leading-[0.88] text-[clamp(2.85rem,5.6vw,5.6rem)]"
                  style={{ color: '#C9E54B' }}
                >
                  NOT
                  <br className="hidden lg:inline" /> TUITION.
                </div>
              </div>
            </div>
          </div>

          {/* Seamless Acid Lime Wash at Door Zoom Finale */}
          <div
            id="hero-parchment-wash"
            className="pointer-events-none absolute inset-0 z-40 opacity-0"
            style={{ backgroundColor: '#C9E54B', willChange: 'opacity' }}
          />
        </section>

  );
};
