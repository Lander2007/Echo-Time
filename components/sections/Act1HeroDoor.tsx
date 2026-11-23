import React, { useEffect, useRef } from 'react';
import { SLAT_INDICES } from '@/data/echoData';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

interface VectorNeedle {
  x: number;
  y: number;
  angle: number;
  length: number;
  brightness: number;
}

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowSpotRef = useRef<HTMLDivElement | null>(null);
  const hudBadgeRef = useRef<HTMLSpanElement | null>(null);

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

    let mouseX = -2000;
    let mouseY = -2000;
    let targetX = -2000;
    let targetY = -2000;
    let prevMouseX = -2000;
    let prevMouseY = -2000;
    let mouseVelocity = 0;
    let isHovering = false;

    const needles: VectorNeedle[] = [];
    const pulses: PulseWave[] = [];
    const GRID_STEP = 72; // Swiss 72px grid step parity

    const initGrid = () => {
      width = section.offsetWidth || window.innerWidth;
      height = section.offsetHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      needles.length = 0;
      const cols = Math.ceil(width / GRID_STEP) + 1;
      const rows = Math.ceil(height / GRID_STEP) + 1;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          needles.push({
            x: c * GRID_STEP,
            y: r * GRID_STEP,
            angle: 0,
            length: 13,
            brightness: 0,
          });
        }
      }
    };

    initGrid();

    const onResize = () => {
      initGrid();
    };
    window.addEventListener('resize', onResize, { passive: true });

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
          mouseX = targetX;
          mouseY = targetY;
          prevMouseX = targetX;
          prevMouseY = targetY;
          if (glowSpotRef.current) glowSpotRef.current.style.opacity = '1';
        }
      } else if (isHovering) {
        isHovering = false;
        targetX = -2000;
        targetY = -2000;
        if (glowSpotRef.current) glowSpotRef.current.style.opacity = '0';
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetX = -2000;
      targetY = -2000;
      if (glowSpotRef.current) glowSpotRef.current.style.opacity = '0';
    };

    const onClick = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      pulses.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 540,
        strength: 1.0,
      });
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('click', onClick, { passive: true });

    const INFLUENCE_RADIUS = 360;

    const render = () => {
      if (isHovering) {
        mouseX += (targetX - mouseX) * 0.16;
        mouseY += (targetY - mouseY) * 0.16;

        const dX = mouseX - prevMouseX;
        const dY = mouseY - prevMouseY;
        mouseVelocity = Math.min(45, Math.hypot(dX, dY));
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        if (glowSpotRef.current) {
          glowSpotRef.current.style.transform = `translate3d(${mouseX - 260}px, ${mouseY - 260}px, 0)`;
        }

        if (hudBadgeRef.current) {
          const normX = Math.round(mouseX).toString().padStart(4, '0');
          const normY = Math.round(mouseY).toString().padStart(4, '0');
          const vel = mouseVelocity.toFixed(1);
          hudBadgeRef.current.textContent = `VECTOR FLUX · MAG [X:${normX} Y:${normY}] · VEL ${vel}PX · 72MM FIELD`;
        }
      } else {
        mouseVelocity *= 0.88;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update expanding magnetic shockwave pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += 16;
        p.strength *= 0.945;

        // Draw faint expanding sonar shockwave ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201, 229, 75, ${(p.strength * 0.22).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (p.radius > p.maxRadius || p.strength < 0.02) {
          pulses.splice(i, 1);
        }
      }

      // 2. Render all vector needles in 72px Swiss matrix
      for (let i = 0; i < needles.length; i++) {
        const n = needles[i];
        let targetAngle = 0;
        let targetBrightness = 0;
        let targetLength = 13;

        if (isHovering) {
          const dx = mouseX - n.x;
          const dy = mouseY - n.y;
          const dist = Math.hypot(dx, dy);

          if (dist < INFLUENCE_RADIUS) {
            const factor = Math.pow(1 - dist / INFLUENCE_RADIUS, 1.55);
            targetAngle = Math.atan2(dy, dx);
            targetBrightness = factor;
            targetLength = 13 + factor * 11;
          }
        }

        // Apply pulse wave deflection if wave passes over needle
        for (let j = 0; j < pulses.length; j++) {
          const p = pulses[j];
          const pDist = Math.hypot(p.x - n.x, p.y - n.y);
          const ringDist = Math.abs(pDist - p.radius);
          if (ringDist < 42) {
            const waveFactor = (1 - ringDist / 42) * p.strength;
            const waveAngle = Math.atan2(n.y - p.y, n.x - p.x);
            targetAngle = waveAngle + Math.sin(ringDist * 0.2) * 0.6;
            targetBrightness = Math.max(targetBrightness, waveFactor * 0.85);
            targetLength = Math.max(targetLength, 13 + waveFactor * 9);
          }
        }

        // Smooth angular interpolation with [-PI, PI] wrapping
        let angleDiff = targetAngle - n.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        n.angle += angleDiff * (0.12 + targetBrightness * 0.14);
        n.brightness += (targetBrightness - n.brightness) * 0.18;
        n.length += (targetLength - n.length) * 0.18;

        const cosA = Math.cos(n.angle);
        const sinA = Math.sin(n.angle);
        const halfL = n.length / 2;

        const tipX = n.x + cosA * halfL;
        const tipY = n.y + sinA * halfL;
        const tailX = n.x - cosA * (halfL * 0.6);
        const tailY = n.y - sinA * (halfL * 0.6);

        // Center pivot registration dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.brightness > 0.25 ? 1.5 : 1.1, 0, Math.PI * 2);
        if (n.brightness > 0.2) {
          ctx.fillStyle = `rgba(201, 229, 75, ${(0.35 + n.brightness * 0.65).toFixed(2)})`;
        } else {
          ctx.fillStyle = 'rgba(241, 239, 232, 0.14)';
        }
        ctx.fill();

        // Vector directional needle
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(tipX, tipY);

        if (n.brightness > 0.25) {
          // Close to cursor: Vibrant Acid Lime & Cobalt magnetic glow
          const grad = ctx.createLinearGradient(tailX, tailY, tipX, tipY);
          grad.addColorStop(0, 'rgba(107, 132, 255, 0.45)');
          grad.addColorStop(1, `rgba(201, 229, 75, ${(0.4 + n.brightness * 0.6).toFixed(2)})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
        } else {
          // Neutral resting state: faint Swiss architectural blueprint bone
          ctx.strokeStyle = 'rgba(241, 239, 232, 0.11)';
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();

        // Directional arrowhead / notch at the needle tip for illuminated vectors
        if (n.brightness > 0.35) {
          const arrowLen = 3.5;
          const leftAngle = n.angle + Math.PI * 0.82;
          const rightAngle = n.angle - Math.PI * 0.82;

          ctx.beginPath();
          ctx.moveTo(tipX + Math.cos(leftAngle) * arrowLen, tipY + Math.sin(leftAngle) * arrowLen);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX + Math.cos(rightAngle) * arrowLen, tipY + Math.sin(rightAngle) * arrowLen);
          ctx.strokeStyle = `rgba(201, 229, 75, ${(0.5 + n.brightness * 0.5).toFixed(2)})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
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
          {/* Subtle Ambient Magnetic Spotlight Following Cursor */}
          <div
            ref={glowSpotRef}
            className="absolute w-[520px] h-[520px] rounded-full pointer-events-none opacity-0 transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(circle, rgba(201, 229, 75, 0.11) 0%, rgba(107, 132, 255, 0.05) 38%, transparent 70%)',
              willChange: 'transform',
            }}
          />

          {/* High-Performance 60fps Vector Flow Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Bottom-Left Live Magnetic Flux Telemetry Badge */}
          <div className="absolute bottom-6 left-6 lg:left-12 flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#1A1B17]/90 border border-[#C9E54B]/30 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E] shadow-2xl backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9E54B] animate-pulse" />
            <span ref={hudBadgeRef} className="text-[#C9E54B]">
              VECTOR FLUX &middot; MAG [IDLE] &middot; 72MM SWISS RESOLUTION
            </span>
          </div>

          {/* Bottom-Right Specification Tag */}
          <div className="hidden sm:flex absolute bottom-6 right-6 lg:right-12 items-center gap-2 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E]/60">
            <span>DIRECTIONAL FLOW FIELD</span>
            <span className="text-[#6B84FF]">&middot;</span>
            <span>FIG. 01 VECTOR MATRIX</span>
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
