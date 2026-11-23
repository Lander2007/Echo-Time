import React, { useEffect, useRef } from 'react';
import { SLAT_INDICES } from '@/data/echoData';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
}

interface SonarRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coordBadgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = heroSectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let targetX = -1000;
    let targetY = -1000;
    let smoothX = -1000;
    let smoothY = -1000;
    let isHovering = false;
    const ripples: SonarRipple[] = [];

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!isHovering) {
        isHovering = true;
        smoothX = targetX;
        smoothY = targetY;
        if (coordBadgeRef.current) coordBadgeRef.current.style.opacity = '1';
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetX = -1000;
      targetY = -1000;
      if (coordBadgeRef.current) coordBadgeRef.current.style.opacity = '0';
    };

    const onPointerDown = (e: PointerEvent) => {
      // Don't trigger ripple if clicking on door stage, buttons or links
      const target = e.target as HTMLElement | null;
      if (target?.closest('#atelier-window-outer, button, a, input')) return;

      const rect = section.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      ripples.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: Math.max(width, height) * 0.9,
        alpha: 0.85,
        speed: 15,
      });
    };

    const STEP = 72; // Exactly matches 72px Swiss drafting grid

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Sonar Shockwaves
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha *= 0.958;
        if (r.alpha < 0.015 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201, 229, 75, ${r.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        if (r.radius > 36) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.72, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(107, 132, 255, ${(r.alpha * 0.45).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Smooth Cursor Tracking
      smoothX += (targetX - smoothX) * 0.16;
      smoothY += (targetY - smoothY) * 0.16;

      // Update Floating Swiss Coordinates HUD
      if (coordBadgeRef.current && isHovering) {
        const badgeX = Math.min(Math.max(smoothX + 16, 12), width - 210);
        const badgeY = Math.min(Math.max(smoothY + 16, 12), height - 36);
        coordBadgeRef.current.style.transform = `translate3d(${badgeX.toFixed(1)}px, ${badgeY.toFixed(1)}px, 0)`;
        coordBadgeRef.current.textContent = `SWISS.GRID [${Math.round(smoothX).toString().padStart(4, '0')}:${Math.round(smoothY).toString().padStart(4, '0')}] · 72PX`;
      }

      // 3. Render Magnetic Swiss Registration Marks
      const cols = Math.ceil(width / STEP) + 1;
      const rows = Math.ceil(height / STEP) + 1;
      const maxDist = 240;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const gx = col * STEP;
          const gy = row * STEP;

          const dx = smoothX - gx;
          const dy = smoothY - gy;
          const dist = Math.hypot(dx, dy);

          let t = 0;
          if (isHovering && dist < maxDist) {
            t = 1 - dist / maxDist;
            t = t * t; // smooth non-linear acceleration
          }

          // Sonar ripple interaction on grid points
          let rippleBoost = 0;
          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k];
            const distToRip = Math.hypot(rip.x - gx, rip.y - gy);
            const wavefrontDelta = Math.abs(distToRip - rip.radius);
            if (wavefrontDelta < 48) {
              const rw = 1 - wavefrontDelta / 48;
              rippleBoost = Math.max(rippleBoost, rw * rip.alpha * 1.6);
            }
          }

          const combined = Math.min(1, t + rippleBoost);

          // Transformation: arm length (3.5px -> 6.5px), rotation (0 -> 45deg diamond)
          const arm = 3.5 + combined * 3.2;
          const angle = combined * (Math.PI / 4);
          const pull = combined * 4.0;
          const pullAngle = Math.atan2(dy, dx);
          const posX = gx + (combined > 0 ? Math.cos(pullAngle) * pull : 0);
          const posY = gy + (combined > 0 ? Math.sin(pullAngle) * pull : 0);

          ctx.save();
          ctx.translate(posX, posY);
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(-arm, 0);
          ctx.lineTo(arm, 0);
          ctx.moveTo(0, -arm);
          ctx.lineTo(0, arm);

          if (combined > 0.04) {
            const alpha = (0.14 + combined * 0.82).toFixed(3);
            ctx.strokeStyle = combined > 0.4 ? `rgba(201, 229, 75, ${alpha})` : `rgba(107, 132, 255, ${alpha})`;
            ctx.lineWidth = 1 + combined * 0.7;
          } else {
            ctx.strokeStyle = 'rgba(241, 239, 232, 0.12)';
            ctx.lineWidth = 1;
          }
          ctx.stroke();

          // Core micro-diamond at high proximity
          if (combined > 0.5) {
            ctx.fillStyle = '#C9E54B';
            ctx.fillRect(-1, -1, 2, 2);
          }

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
      section.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', resize);
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

        {/* Concept 1: Interactive Swiss Magnetic Registration Canvas & Sonar Pulse Matrix */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Floating Swiss Telemetry Coordinates Chip */}
          <div
            ref={coordBadgeRef}
            className="absolute top-0 left-0 opacity-0 pointer-events-none transition-opacity duration-300 font-swiss-mono text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-sm bg-[#1A1B17]/90 border border-[#C9E54B]/35 text-[#C9E54B] shadow-2xl backdrop-blur-sm"
            style={{ willChange: 'transform' }}
          >
            SWISS.GRID [0000:0000] · 72PX
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
                      className="font-swiss-mono text-[9px] uppercase tracking-[0.18em] mb-1 font-semibold"
                      style={{ color: '#1E3AE0' }}
                    >
                      CAMPUS PARITY UNIT
                    </div>
                    <div
                      className="font-swiss-sans font-black text-2xl sm:text-3xl leading-[0.95] tracking-[-0.04em] uppercase"
                      style={{ color: '#1A1B17' }}
                    >
                      1.00 HR
                      <br />
                      = 1.00 ECHO
                    </div>
                    <div
                      className="font-swiss-mono text-[8.5px] uppercase tracking-[0.14em] mt-2 font-medium"
                      style={{ color: '#46493D' }}
                    >
                      ATOMIC ESCROW VAULT &middot; EST. 2026
                    </div>
                  </div>

                  <div
                    className="relative z-10 pt-2.5 border-t flex items-center justify-between font-swiss-mono text-[9px]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#1A1B17' }}
                  >
                    <span className="font-semibold uppercase tracking-[0.14em]">.EDU VERIFIED</span>
                    <span className="font-bold text-[#1E3AE0]">0% TUITION FEE</span>
                  </div>
                </div>
              </div>

              {/* 3D Swinging Architectural Double Doors Overlay */}
              <div className="swiss-door-shutter-pair">
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
