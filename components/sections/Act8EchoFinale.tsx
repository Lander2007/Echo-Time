import React from 'react';
import { TactileAudioEngine } from '@/lib/audio';

interface Act8EchoFinaleProps {
  finaleSectionRef: React.RefObject<HTMLElement | null>;
  finaleWordWrapRef: React.RefObject<HTMLDivElement | null>;
  finaleTurbRef: React.RefObject<SVGFETurbulenceElement | null>;
  finaleDispRef: React.RefObject<SVGFEDisplacementMapElement | null>;
  handleFinalePointerEnter: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleFinalePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleFinalePointerLeave: () => void;
  handleFinalePulseClick: () => void;
  scrollToTarget: (target: string) => void;
  getAudio: () => TactileAudioEngine;
}

export const Act8EchoFinale: React.FC<Act8EchoFinaleProps> = ({
  finaleSectionRef,
  finaleWordWrapRef,
  finaleTurbRef,
  finaleDispRef,
  handleFinalePointerEnter,
  handleFinalePointerMove,
  handleFinalePointerLeave,
  handleFinalePulseClick,
  scrollToTarget,
  getAudio,
}) => {
  return (
            <section
              ref={finaleSectionRef}
              id="act-finale"
              className="echo-finale-stage relative min-h-[82vh] flex flex-col items-center justify-center px-5 sm:px-10 py-16 border-t-2 border-b-2 border-[#061354]"
            >
              {/* Hidden SVG Displacement Filter powering the liquid hover ripple */}
              <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                  <filter
                    id="echo-liquid-distort"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      ref={finaleTurbRef}
                      type="fractalNoise"
                      baseFrequency="0.011 0.072"
                      numOctaves="2"
                      seed="4"
                      result="noise"
                    />
                    <feDisplacementMap
                      ref={finaleDispRef}
                      in="SourceGraphic"
                      in2="noise"
                      scale="0"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>
              </svg>

              {/* Centerpiece Monumental Distorting Wordmark */}
              <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
                <div
                  ref={finaleWordWrapRef}
                  data-cursor="WARP"
                  onPointerEnter={handleFinalePointerEnter}
                  onPointerMove={handleFinalePointerMove}
                  onPointerLeave={handleFinalePointerLeave}
                  onPointerDown={handleFinalePointerMove}
                  onPointerUp={handleFinalePointerLeave}
                  onClick={handleFinalePulseClick}
                  className="echo-liquid-wrap"
                  role="button"
                  tabIndex={0}
                  aria-label="Interactive ECHO TIME liquid typography"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFinalePulseClick();
                    }
                  }}
                >
                  <span className="echo-liquid-word">ECHO</span>
                </div>

                <div className="mt-2 sm:mt-3 font-echo-monument uppercase tracking-[0.14em] text-2xl sm:text-4xl md:text-5xl text-[#B9C8FF]">
                  TIME BANK
                </div>
              </div>

              {/* Minimal Rotating Circular Stamp in Bottom-Right */}
              <button
                type="button"
                data-cursor="TOP"
                onClick={() => {
                  getAudio().click();
                  scrollToTarget('#act-hero');
                }}
                aria-label="Scroll back to top portal"
                className="absolute bottom-7 right-6 sm:bottom-10 sm:right-10 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center group focus:outline-none"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="echo-rotating-seal w-full h-full text-[#F5F2F3]"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="echo-seal-circle"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                    />
                  </defs>
                  <text
                    fill="currentColor"
                    fontFamily="IBM Plex Mono, monospace"
                    fontSize="8.4"
                    fontWeight="600"
                    letterSpacing="2.4"
                  >
                    <textPath href="#echo-seal-circle">
                      ECHO TIME &bull; 1 HR = 1 ECHO &bull; CAMPUS &bull;
                    </textPath>
                  </text>
                </svg>
                <span className="absolute w-9 h-9 rounded-full bg-[#061354] text-[#F5F2F3] flex items-center justify-center font-swiss-mono text-sm transition-transform duration-300 group-hover:scale-110">
                  &uarr;
                </span>
              </button>
            </section>

  );
};
