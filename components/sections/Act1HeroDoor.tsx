import React, { useEffect, useRef } from 'react';
import { SLAT_INDICES } from '@/data/echoData';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
}

interface VectorNeedle {
  x: number;
  y: number;
  currentAngle: number;
  targetAngle: number;
  baseAngle: number;
}

interface ShockwavePulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crosshairHRef = useRef<HTMLDivElement | null>(null);
  const crosshairVRef = useRef<HTMLDivElement | null>(null);
  const reticleRingRef = useRef<HTMLDivElement | null>(null);
  const hudBadgeRef = useRef<HTMLDivElement | null>(null);

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
    let prevX = -2000;
    let prevY = -2000;
    let pointerVelocity = 0;
    let isHovering = false;

    const needles: VectorNeedle[] = [];
    const pulses: ShockwavePulse[] = [];

    const SPACING = 56; // High density Swiss architectural grid spacing

    const initGrid = () => {
      needles.length = 0;
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * SPACING;
          const y = offsetY + r * SPACING;
          needles.push({
            x,
            y,
            currentAngle: 0,
            targetAngle: 0,
            baseAngle: 0,
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
          prevX = targetX;
          prevY = targetY;
          if (crosshairHRef.current) crosshairHRef.current.style.opacity = '1';
          if (crosshairVRef.current) crosshairVRef.current.style.opacity = '1';
          if (reticleRingRef.current) reticleRingRef.current.style.opacity = '1';
          if (hudBadgeRef.current) hudBadgeRef.current.style.opacity = '1';
        }
      } else if (isHovering) {
        isHovering = false;
        targetX = -2000;
        targetY = -2000;
        if (crosshairHRef.current) crosshairHRef.current.style.opacity = '0';
        if (crosshairVRef.current) crosshairVRef.current.style.opacity = '0';
        if (reticleRingRef.current) reticleRingRef.current.style.opacity = '0';
        if (hudBadgeRef.current) hudBadgeRef.current.style.opacity = '0';
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetX = -2000;
      targetY = -2000;
      if (crosshairHRef.current) crosshairHRef.current.style.opacity = '0';
      if (crosshairVRef.current) crosshairVRef.current.style.opacity = '0';
      if (reticleRingRef.current) reticleRingRef.current.style.opacity = '0';
      if (hudBadgeRef.current) hudBadgeRef.current.style.opacity = '0';
    };

    const onClick = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      pulses.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: 620,
        strength: 1.0,
      });
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('click', onClick, { passive: true });

    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      if (isHovering) {
        const vx = targetX - currentX;
        const vy = targetY - currentY;
        pointerVelocity = Math.min(Math.hypot(vx, vy), 40);
        currentX += vx * 0.18;
        currentY += vy * 0.18;

        // Position crosshairs & reticle
        if (crosshairHRef.current) {
          crosshairHRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
        }
        if (crosshairVRef.current) {
          crosshairVRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`;
        }
        if (reticleRingRef.current) {
          reticleRingRef.current.style.transform = `translate3d(${currentX - 22}px, ${currentY - 22}px, 0)`;
        }
        if (hudBadgeRef.current) {
          const badgeX = Math.min(Math.max(currentX + 18, 12), (width || 1200) - 260);
          const badgeY = Math.min(Math.max(currentY + 18, 12), (height || 800) - 40);
          hudBadgeRef.current.style.transform = `translate3d(${badgeX}px, ${badgeY}px, 0)`;
          const deg = Math.round(((Math.atan2(currentY - height / 2, currentX - width / 2) * 180) / Math.PI + 360) % 360);
          hudBadgeRef.current.textContent = `VECTOR FLUX · θ:${deg.toString().padStart(3, '0')}° · [${Math.round(currentX).toString().padStart(4, '0')}:${Math.round(currentY).toString().padStart(4, '0')}] · SYS.ACTIVE`;
        }
      }

      // Base influence radius expands dynamically with mouse velocity
      const dynamicRadius = 310 + pointerVelocity * 3.5;

      // Update and draw vector needles
      for (let i = 0; i < needles.length; i++) {
        const needle = needles[i];
        const dx = currentX - needle.x;
        const dy = currentY - needle.y;
        const dist = Math.hypot(dx, dy);

        let influence = 0;
        let targetAngle = 0;

        if (dist < dynamicRadius && isHovering) {
          influence = Math.pow(1 - dist / dynamicRadius, 1.35);
          targetAngle = Math.atan2(dy, dx);
        } else {
          // Idle harmonic wave: subtle rhythmic breathing across Swiss grid
          targetAngle = Math.sin(time * 0.016 + (needle.x * 0.006 + needle.y * 0.008)) * 0.38;
        }

        // Apply kinetic shockwave impulse from clicks
        for (let j = 0; j < pulses.length; j++) {
          const pulse = pulses[j];
          const pDist = Math.hypot(needle.x - pulse.x, needle.y - pulse.y);
          const waveDist = Math.abs(pDist - pulse.radius);
          if (waveDist < 55) {
            const waveStrength = (1 - waveDist / 55) * pulse.strength;
            influence = Math.max(influence, waveStrength * 0.85);
            const waveAngle = Math.atan2(needle.y - pulse.y, needle.x - pulse.x) + Math.PI * 0.5;
            targetAngle = targetAngle * (1 - waveStrength) + waveAngle * waveStrength;
          }
        }

        // Smooth shortest-path angular lerping
        let diff = targetAngle - needle.currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        needle.currentAngle += diff * (0.12 + influence * 0.16);

        // Vector needle rendering
        const len = 11 + influence * 12; // Expands from 11px to 23px under magnetic field
        const cos = Math.cos(needle.currentAngle);
        const sin = Math.sin(needle.currentAngle);

        const x1 = needle.x - cos * (len * 0.35);
        const y1 = needle.y - sin * (len * 0.35);
        const x2 = needle.x + cos * (len * 0.65);
        const y2 = needle.y + sin * (len * 0.65);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (influence > 0.08) {
          const alpha = Math.min(1, 0.2 + influence * 0.8);
          if (influence > 0.42) {
            ctx.strokeStyle = `rgba(201, 229, 75, ${alpha.toFixed(3)})`; // #C9E54B Acid Lime
            ctx.lineWidth = 1.45;
          } else {
            ctx.strokeStyle = `rgba(107, 132, 255, ${alpha.toFixed(3)})`; // #6B84FF Pop Blue
            ctx.lineWidth = 1.15;
          }
        } else {
          ctx.strokeStyle = 'rgba(241, 239, 232, 0.12)';
          ctx.lineWidth = 0.9;
        }
        ctx.stroke();

        // Glowing needle tip & pivot indicator
        if (influence > 0.22) {
          ctx.beginPath();
          ctx.arc(x2, y2, 1.25 + influence * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = '#C9E54B';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(needle.x, needle.y, 0.85, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(152, 154, 142, 0.28)';
          ctx.fill();
        }
      }

      // Draw expanding shockwave rings
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        pulse.radius += 15;
        pulse.strength *= 0.942;

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201, 229, 75, ${(pulse.strength * 0.38).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        if (pulse.radius > 30) {
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.radius - 16, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(107, 132, 255, ${(pulse.strength * 0.2).toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        if (pulse.radius > pulse.maxRadius || pulse.strength < 0.02) {
          pulses.splice(k, 1);
        }
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
      className="theme-dark relative w-full min-h-screen overflow-hidden cursor-crosshair"
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
            CONCEPT 3: INTERACTIVE MAGNETIC VECTOR FLOW / COMPASS FIELD
            =================================================================== */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
          {/* Canvas-Rendered Magnetic Needle Vector Field */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block w-full h-full pointer-events-none"
            style={{ willChange: 'contents' }}
          />

          {/* Horizontal Hairline Precision Axis */}
          <div
            ref={crosshairHRef}
            className="absolute left-0 right-0 h-[1px] opacity-0 pointer-events-none transition-opacity duration-300"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(201, 229, 75, 0.04) 15%, rgba(201, 229, 75, 0.3) 50%, rgba(201, 229, 75, 0.04) 85%, transparent 100%)',
              willChange: 'transform',
            }}
          />

          {/* Vertical Hairline Precision Axis */}
          <div
            ref={crosshairVRef}
            className="absolute top-0 bottom-0 w-[1px] opacity-0 pointer-events-none transition-opacity duration-300"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(107, 132, 255, 0.04) 15%, rgba(107, 132, 255, 0.28) 50%, rgba(107, 132, 255, 0.04) 85%, transparent 100%)',
              willChange: 'transform',
            }}
          />

          {/* Magnetic Crosshair Reticle Ring */}
          <div
            ref={reticleRingRef}
            className="absolute w-11 h-11 border border-[#C9E54B]/35 rounded-full opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center"
            style={{ willChange: 'transform' }}
          >
            <div className="w-1.5 h-1.5 bg-[#C9E54B] rounded-full shadow-[0_0_8px_#C9E54B]" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-[#C9E54B]" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-[#C9E54B]" />
            <span className="absolute top-1/2 -left-1 -translate-y-1/2 h-[1px] w-2 bg-[#C9E54B]" />
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 h-[1px] w-2 bg-[#C9E54B]" />
          </div>

          {/* Floating Swiss Magnetic Telemetry Coordinates Badge */}
          <div
            ref={hudBadgeRef}
            className="absolute opacity-0 pointer-events-none transition-opacity duration-300 font-swiss-mono text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-sm bg-[#1A1B17]/90 border border-[#C9E54B]/35 text-[#C9E54B] shadow-2xl backdrop-blur-sm whitespace-nowrap"
            style={{ willChange: 'transform' }}
          >
            VECTOR FLUX · θ:000° · [0000:0000] · SYS.ACTIVE
          </div>

          {/* Ambient Swiss Corner Specifications */}
          <div className="hidden sm:flex absolute top-20 left-6 lg:left-12 items-center gap-2 font-swiss-mono text-[9px] uppercase tracking-[0.18em] text-[#989A8E]/55">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9E54B] animate-pulse" />
            <span>MAGNETIC VECTOR FIELD · 56PX COMPASS MATRIX</span>
          </div>

          <div className="hidden sm:flex absolute bottom-6 right-6 lg:right-12 items-center gap-2 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E]/55">
            <span>VELOCITY REACTIVE</span>
            <span className="text-[#6B84FF]">&middot;</span>
            <span>1.00 HR = 1.00 ECHO FLUX</span>
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
                      className="font-swiss-mono text-[10px] uppercase tracking-[0.2em] mb-1.5"
                      style={{ color: '#1E3AE0', fontWeight: 600 }}
                    >
                      CAMPUS PARITY SYSTEM
                    </div>
                    <div
                      className="font-swiss-sans font-black tracking-[-0.05em] uppercase leading-[0.88] text-[clamp(2.1rem,4.4vw,3.6rem)]"
                      style={{ color: '#1A1B17' }}
                    >
                      1.00 HR
                      <br />
                      = 1.00 ECHO
                    </div>
                    <p
                      className="mt-3 font-swiss-mono text-[10px] leading-relaxed max-w-[240px]"
                      style={{ color: '#46493D' }}
                    >
                      ATOMIC CREDIT ESCROW. ZERO TUITION BARTER. PEER-VALIDATED PROOFS.
                    </p>
                  </div>

                  <div
                    className="relative z-10 flex items-end justify-between pt-2.5 border-t font-swiss-mono text-[9px] uppercase tracking-[0.14em]"
                    style={{ borderColor: 'rgba(26, 27, 23, 0.25)', color: '#46493D' }}
                  >
                    <span>.EDU VERIFIED</span>
                    <span className="font-semibold" style={{ color: '#1E3AE0' }}>
                      ET-2026-PORTAL
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D Swinging Architectural Double Doors Overlay */}
              <div className="swiss-door-frame">
                {/* Left Door Leaf */}
                <div id="shutter-left" className="swiss-door-leaf leaf-left">
                  <div className="leaf-face">
                    <div className="leaf-header">
                      <span>L-01</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    </div>
                    <div className="leaf-slats">
                      {SLAT_INDICES.map((i: number) => (
                        <div key={`slat-l-${i}`} className="door-slat" />
                      ))}
                    </div>
                    <div className="leaf-hinge hinge-top" />
                    <div className="leaf-hinge hinge-bottom" />
                    <div className="leaf-footer">ECHO.SYS</div>
                  </div>
                </div>

                {/* Right Door Leaf */}
                <div id="shutter-right" className="swiss-door-leaf leaf-right">
                  <div className="leaf-face">
                    <div className="leaf-header">
                      <span className="w-1.5 h-1.5 rounded-full bg-pop" />
                      <span>R-01</span>
                    </div>
                    <div className="leaf-slats">
                      {SLAT_INDICES.map((i: number) => (
                        <div key={`slat-r-${i}`} className="door-slat" />
                      ))}
                    </div>
                    <div className="leaf-hinge hinge-top" />
                    <div className="leaf-hinge hinge-bottom" />
                    <div className="leaf-footer">1:1 PARITY</div>
                  </div>
                </div>

                {/* Central Swiss Lock Bar */}
                <div id="shutter-latch-wrap" className="swiss-lock-bar">
                  <div className="lock-bar-core">
                    <div id="shutter-latch-lever" className="lock-bar-lever" />
                  </div>
                </div>
              </div>

              {/* Architectural Steel Threshold Sill */}
              <div className="swiss-door-sill" aria-hidden="true" />
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
            <h1
              id="hero-headline-right"
              className="hero-stagger font-swiss-sans font-black uppercase tracking-[-0.048em] leading-[0.88] text-[clamp(2.85rem,5.6vw,5.6rem)]"
              style={{ color: '#C9E54B' }}
            >
              NOT
              <br className="hidden lg:inline" /> TUITION.
            </h1>
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
