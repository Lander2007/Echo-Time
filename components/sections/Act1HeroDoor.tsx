import React, { useEffect, useRef } from 'react';
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
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const tiltStageRef = useRef<HTMLDivElement | null>(null);
  const layerLightbeamRef = useRef<HTMLDivElement | null>(null);
  const hudBadgeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const section = heroSectionRef.current;
    if (!section) return;

    let rafId = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetPanX = 0;
    let targetPanY = 0;
    let targetLightX = -1000;
    let targetLightY = -1000;

    let currentRotX = 0;
    let currentRotY = 0;
    let currentPanX = 0;
    let currentPanY = 0;
    let currentLightX = -1000;
    let currentLightY = -1000;
    let isHovering = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const nx = Math.max(-1, Math.min(1, (mouseX - centerX) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (mouseY - centerY) / (rect.height / 2)));

        targetRotX = -ny * 7.5; // pitch
        targetRotY = nx * 8.5;  // yaw
        targetPanX = -nx * 24;  // parallax x
        targetPanY = -ny * 18;  // parallax y
        targetLightX = mouseX;
        targetLightY = mouseY;

        if (!isHovering) {
          isHovering = true;
          if (layerLightbeamRef.current) layerLightbeamRef.current.style.opacity = '1';
        }
      } else if (isHovering) {
        isHovering = false;
        targetRotX = 0;
        targetRotY = 0;
        targetPanX = 0;
        targetPanY = 0;
        if (layerLightbeamRef.current) layerLightbeamRef.current.style.opacity = '0';
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
      targetPanX = 0;
      targetPanY = 0;
      if (layerLightbeamRef.current) layerLightbeamRef.current.style.opacity = '0';
    };

    const tick = () => {
      currentRotX += (targetRotX - currentRotX) * 0.085;
      currentRotY += (targetRotY - currentRotY) * 0.085;
      currentPanX += (targetPanX - currentPanX) * 0.085;
      currentPanY += (targetPanY - currentPanY) * 0.085;
      currentLightX += (targetLightX - currentLightX) * 0.12;
      currentLightY += (targetLightY - currentLightY) * 0.12;

      if (tiltStageRef.current) {
        tiltStageRef.current.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translate3d(${currentPanX.toFixed(1)}px, ${currentPanY.toFixed(1)}px, 0)`;
      }

      if (layerLightbeamRef.current) {
        layerLightbeamRef.current.style.transform = `translate3d(${currentLightX - 320}px, ${currentLightY - 320}px, 0)`;
      }

      if (hudBadgeRef.current) {
        hudBadgeRef.current.textContent = `ATELIER 3D · PITCH ${currentRotX.toFixed(1)}° · YAW ${currentRotY.toFixed(1)}° · LIGHTBOX 1:1`;
      }

      rafId = requestAnimationFrame(tick);
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <section
      ref={heroSectionRef}
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

        {/* ===================================================================
            CONCEPT 4: 3D MULTI-LAYER ARCHITECTURAL LIGHTBOX PARALLAX
            =================================================================== */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}
          aria-hidden="true"
        >
          {/* 3D Tilting Stage Frame */}
          <div
            ref={tiltStageRef}
            className="absolute inset-0 w-full h-full"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            {/* LAYER 1: Deep Parallax Watermark & Architectural Blueprint Arcs (Z: -90px) */}
            <div
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(-90px) scale(1.15)', transformStyle: 'preserve-3d' }}
            >
              {/* Monumental Watermark Wordmark */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.038] select-none">
                <span className="font-swiss-sans font-black text-[clamp(6rem,15vw,16rem)] uppercase tracking-[-0.04em] text-[#F1EFE8] leading-none">
                  ECHO TIME
                </span>
                <span className="font-swiss-mono text-[11px] sm:text-xs tracking-[0.34em] text-[#C9E54B] uppercase mt-4">
                  ARCHITECTURAL TIME BANK &middot; FIG. 01 &middot; ATELIER STAGE
                </span>
              </div>

              {/* Blueprint Construction Arcs SVG */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50%" cy="50%" r="280" fill="none" stroke="#F1EFE8" strokeWidth="1" strokeDasharray="4 8" />
                <circle cx="50%" cy="50%" r="480" fill="none" stroke="#C9E54B" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx="50%" cy="50%" r="680" fill="none" stroke="#6B84FF" strokeWidth="1" strokeDasharray="6 10" />
                <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#F1EFE8" strokeWidth="0.8" strokeDasharray="3 6" />
                <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="#F1EFE8" strokeWidth="0.8" strokeDasharray="3 6" />
              </svg>
            </div>

            {/* LAYER 2: Swiss 72mm Calibration Rulers & Precision Quadrants (Z: -20px) */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'translateZ(-20px)', transformStyle: 'preserve-3d' }}
            >
              {/* Top Horizontal Calibration Ruler */}
              <div className="absolute top-20 left-0 right-0 h-6 border-b border-[rgba(241,239,232,0.06)] flex items-end justify-between px-6 font-swiss-mono text-[8px] text-[#989A8E]/40 tracking-widest uppercase">
                {['000', '144', '288', '432', '576', '720', '864', '1008', '1152', '1296', '1440'].map((tick) => (
                  <div key={`tick-t-${tick}`} className="flex flex-col items-center">
                    <span>{tick}MM</span>
                    <span className="w-[1px] h-2 bg-[rgba(241,239,232,0.14)] mt-0.5" />
                  </div>
                ))}
              </div>

              {/* Left Vertical Calibration Ruler */}
              <div className="hidden lg:flex absolute top-20 bottom-12 left-6 w-8 border-r border-[rgba(241,239,232,0.06)] flex-col justify-between py-6 font-swiss-mono text-[8px] text-[#989A8E]/40 tracking-widest uppercase">
                {['000', '144', '288', '432', '576', '720', '864'].map((tick) => (
                  <div key={`tick-l-${tick}`} className="flex items-center justify-end gap-1.5">
                    <span>{tick}</span>
                    <span className="w-2 h-[1px] bg-[rgba(241,239,232,0.14)]" />
                  </div>
                ))}
              </div>

              {/* 4 Precision Swiss Corner L-Brackets */}
              <div className="absolute top-24 left-8 w-4 h-4 border-t-2 border-l-2 border-[#C9E54B]/35" />
              <div className="absolute top-24 right-8 w-4 h-4 border-t-2 border-r-2 border-[#6B84FF]/35" />
              <div className="absolute bottom-12 left-8 w-4 h-4 border-b-2 border-l-2 border-[#6B84FF]/35" />
              <div className="absolute bottom-12 right-8 w-4 h-4 border-b-2 border-r-2 border-[#C9E54B]/35" />
            </div>

            {/* LAYER 3: Dynamic Atelier Daylight Beam & Specular Highlight (Z: +45px) */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'translateZ(45px)', transformStyle: 'preserve-3d' }}
            >
              {/* Studio Skylight Angled Wash */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(201, 229, 75, 0.05) 0%, rgba(107, 132, 255, 0.03) 30%, transparent 60%)',
                }}
              />

              {/* Specular Spotlight Tracking Cursor */}
              <div
                ref={layerLightbeamRef}
                className="absolute w-[640px] h-[640px] rounded-full pointer-events-none opacity-0 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(circle, rgba(201, 229, 75, 0.14) 0%, rgba(107, 132, 255, 0.07) 38%, transparent 70%)',
                  willChange: 'transform',
                }}
              />
            </div>

            {/* LAYER 4: Floating Architectural Telemetry HUD Readout (Z: +80px) */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'translateZ(80px)', transformStyle: 'preserve-3d' }}
            >
              {/* Bottom-Left Live HUD Chip */}
              <div className="absolute bottom-6 left-6 lg:left-12 flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#1A1B17]/90 border border-[#C9E54B]/30 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E] shadow-2xl backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9E54B] animate-pulse" />
                <span ref={hudBadgeRef} className="text-[#C9E54B]">
                  ATELIER 3D &middot; PITCH 0.0&deg; &middot; YAW 0.0&deg; &middot; LIGHTBOX 1:1
                </span>
              </div>

              {/* Bottom-Right Specification Tag */}
              <div className="hidden sm:flex absolute bottom-6 right-6 lg:right-12 items-center gap-2 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E]/60">
                <span>SWISS ATELIER 72MM STAGE</span>
                <span className="text-[#6B84FF]">&middot;</span>
                <span>FIG. 01 ELEVATION</span>
              </div>
            </div>
          </div>
        </div>

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
                      className="font-swiss-mono text-[10px] uppercase tracking-[0.14em] font-semibold mb-1"
                      style={{ color: '#1E3AE0' }}
                    >
                      CAMPUS TIME BANK
                    </div>
                    <div
                      className="font-swiss-sans font-black tracking-[-0.045em] leading-[0.92] text-2xl sm:text-3xl uppercase"
                      style={{ color: '#1A1B17' }}
                    >
                      TRADE HOURS,
                      <br />
                      NOT TUITION.
                    </div>
                    <div
                      className="mt-2 font-swiss-mono text-[9px] uppercase tracking-wider"
                      style={{ color: '#46493D' }}
                    >
                      1.00 HR &middot; 1.00 ECHO &middot; ZERO FEES
                    </div>
                  </div>

                  <div
                    className="relative z-10 flex items-end justify-between pt-2.5 border-t font-swiss-mono text-[8.5px] uppercase tracking-wider"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#46493D' }}
                  >
                    <span>ATOMIC ESCROW</span>
                    <span className="font-semibold text-accent">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* 3D Swinging Architectural Double Doors Overlay */}
              <div className="swiss-shutter-container">
                {/* Left Door Leaf */}
                <div id="shutter-left" className="swiss-shutter-leaf shutter-leaf-l">
                  <div className="shutter-header-bar">
                    <span className="font-swiss-mono text-[8px] text-[#989A8E] tracking-widest uppercase">
                      L-01
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <div className="shutter-slat-chamber">
                    {SLAT_INDICES.map((i: number) => (
                      <div key={`slat-l-${i}`} className="shutter-slat" />
                    ))}
                  </div>
                  <div className="shutter-sill-tag font-swiss-mono text-[8px] uppercase tracking-[0.16em]">
                    ECHO.SYS
                  </div>
                </div>

                {/* Right Door Leaf */}
                <div id="shutter-right" className="swiss-shutter-leaf shutter-leaf-r">
                  <div className="shutter-header-bar">
                    <span className="w-1.5 h-1.5 rounded-full bg-pop" />
                    <span className="font-swiss-mono text-[8px] text-[#989A8E] tracking-widest uppercase">
                      R-01
                    </span>
                  </div>
                  <div className="shutter-slat-chamber">
                    {SLAT_INDICES.map((i: number) => (
                      <div key={`slat-r-${i}`} className="shutter-slat" />
                    ))}
                  </div>
                  <div className="shutter-sill-tag font-swiss-mono text-[8px] uppercase tracking-[0.16em]">
                    1:1 PARITY
                  </div>
                </div>
              </div>

              {/* Central Swiss Lock Bar */}
              <div id="shutter-latch-wrap" className="swiss-lock-bar-assembly">
                <div id="shutter-latch-lever" className="swiss-lock-bar-core">
                  <span className="w-3.5 h-[2px] rounded-full bg-pop" />
                </div>
              </div>

              {/* Architectural Steel Threshold Sill */}
              <div className="swiss-portal-threshold" aria-hidden="true" />
            </div>
          </div>

          {/* Right Split Acid Lime Display Headline */}
          <div className="order-3 text-center lg:text-left">
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
