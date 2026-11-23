import React, { useEffect, useRef } from 'react';
import { SLAT_INDICES } from '@/data/echoData';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
}

interface GridDot {
  x: number;
  y: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    let targetX = -2000;
    let targetY = -2000;
    let currentX = -2000;
    let currentY = -2000;
    let isHovering = false;

    const dots: GridDot[] = [];
    const ripples: ClickRipple[] = [];

    const SPACING = 56; // Minimalist Swiss architectural grid spacing

    const initGrid = () => {
      dots.length = 0;
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: offsetX + c * SPACING,
            y: offsetY + r * SPACING,
          });
        }
      }
    };

    const updateSize = () => {
      width = section.offsetWidth || window.innerWidth;
      height = section.offsetHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initGrid();
    };

    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;

        if (!isHovering) {
          isHovering = true;
          currentX = targetX;
          currentY = targetY;
        }
      } else {
        isHovering = false;
        targetX = -2000;
        targetY = -2000;
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetX = -2000;
      targetY = -2000;
    };

    const onClick = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: 280,
        alpha: 0.6,
      });
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('click', onClick, { passive: true });

    const SPOTLIGHT_RADIUS = 240;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth position lerp
      if (isHovering) {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
      }

      // Draw subtle ambient radial spotlight near cursor
      if (isHovering && currentX > -500) {
        const grad = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          SPOTLIGHT_RADIUS
        );
        grad.addColorStop(0, 'rgba(201, 229, 75, 0.06)');
        grad.addColorStop(0.5, 'rgba(107, 132, 255, 0.025)');
        grad.addColorStop(1, 'rgba(26, 27, 23, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw minimalist Swiss dot matrix
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        let px = dot.x;
        let py = dot.y;
        let radius = 1.15;
        let alpha = 0.11;
        let isAccent = false;

        if (isHovering && currentX > -500) {
          const dx = currentX - dot.x;
          const dy = currentY - dot.y;
          const dist = Math.hypot(dx, dy);

          if (dist < SPOTLIGHT_RADIUS) {
            const factor = 1 - dist / SPOTLIGHT_RADIUS;
            alpha = 0.11 + factor * 0.55;
            radius = 1.15 + factor * 1.5;
            isAccent = true;

            // Subtle magnetic displacement (1-3px elastic pull)
            px += (dx / (dist || 1)) * factor * 3.5;
            py += (dy / (dist || 1)) * factor * 3.5;
          }
        }

        ctx.fillStyle = isAccent
          ? `rgba(201, 229, 75, ${alpha.toFixed(3)})`
          : `rgba(241, 239, 232, ${alpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw minimalist tactile click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.09 + 1.2;
        r.alpha *= 0.92;

        if (r.alpha < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(201, 229, 75, ${r.alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
      section.removeEventListener('click', onClick);
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

        {/* Minimalist Interactive Ambient Background Canvas */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block w-full h-full pointer-events-none"
            style={{ willChange: 'contents' }}
          />
        </div>

        {/* Monumental Swiss Editorial Wordmark Behind 3D Door */}
        <div
          id="hero-monument-watermark"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden select-none px-4"
          aria-hidden="true"
        >
          <div className="font-echo-monument text-[clamp(6rem,22vw,26rem)] uppercase tracking-[-0.035em] leading-none text-[#F1EFE8]/[0.05] [-webkit-text-stroke:1px_rgba(201,229,75,0.08)] select-none whitespace-nowrap text-center">
            ECHO TIME
          </div>
        </div>

        {/* Elevated Swiss Poster Stage — Centered 3D Door Portal */}
        <div className="hero-stagger relative z-20 max-w-[1400px] w-full mx-auto px-5 sm:px-10 flex items-center justify-center">
          {/* Centerpiece: Elevated 3D Swiss Architectural Dual-Leaf Opening Door */}
          <div id="atelier-portal-stage" className="swiss-portal-stage mx-auto">
            <div id="atelier-window-outer" className="swiss-door-outer">
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
                <div className="door-daylight-poster flex flex-col items-center justify-center text-center p-6 sm:p-8">
                  <div id="door-sunbeam" className="door-sunbeam" aria-hidden="true" />

                  <div className="relative z-10 my-auto py-4">
                    <div
                      className="font-swiss-sans font-black uppercase tracking-[-0.045em] text-4xl sm:text-5xl leading-[0.92]"
                      style={{ color: '#1A1B17' }}
                    >
                      1.00 HR
                      <br />
                      = 1.00 ECHO
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Swinging Architectural Double Doors Overlay */}
              <div className="shutter-plane">
                {/* Left Door Leaf */}
                <div id="shutter-left" className="shutter-door shutter-door-left">
                  <span className="swiss-hinge hinge-lt" aria-hidden="true" />
                  <span className="swiss-hinge hinge-lb" aria-hidden="true" />
                  <div className="swiss-louver-grid m-0 h-full" aria-hidden="true">
                    {SLAT_INDICES.map((i) => (
                      <div key={`l-${i}`} className="swiss-slat" />
                    ))}
                  </div>
                </div>

                {/* Right Door Leaf */}
                <div id="shutter-right" className="shutter-door shutter-door-right">
                  <span className="swiss-hinge hinge-rt" aria-hidden="true" />
                  <span className="swiss-hinge hinge-rb" aria-hidden="true" />
                  <div className="swiss-louver-grid m-0 h-full" aria-hidden="true">
                    {SLAT_INDICES.map((i) => (
                      <div key={`r-${i}`} className="swiss-slat" />
                    ))}
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
