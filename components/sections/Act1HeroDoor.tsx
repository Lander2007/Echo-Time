import React, { useEffect, useRef, useState } from 'react';
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

const LEDGER_TRANSACTIONS = [
  { tx: 'ET-TX::0x9E21A4', action: 'MINT +1.50 ECHO', peer: 'MAYA CHEN (CS) ⇄ OMAR FAROOQ (ARCH)', status: 'ESCROW ATTESTED', color: 'acc' },
  { tx: 'PROOF::ZK-SNARK', action: 'DUAL SIGN-OFF', peer: '1.00 HR = 1.00 ECHO INVARIANT LOCKED', status: '0.00% TUITION FEE', color: 'pop' },
  { tx: 'VAULT::BLOCK#9021', action: 'SHA-256 TIMELOCK', peer: '7f83b1657ff1fc53b92dc18148a1d65dfc2d', status: 'ATOMIC FINALITY', color: 'ink' },
  { tx: 'STRESS::AUDIT', action: 'REPLAY RESISTANT', peer: 'DOUBLE-SPEND IMMUNITY CONFIRMED', status: '0 BARTER DEADLOCK', color: 'acc' },
  { tx: 'GUILD::TREASURY', action: 'POOL +11.50H', peer: 'CAPSTONE SHARED GUILD BUS ACTIVE', status: '5 CONTRIBUTORS', color: 'pop' },
  { tx: 'PEER::DISPUTE', action: '48H SAFEGUARD', peer: 'ED25519 DUAL-KEY TIMELOCK WINDOW', status: 'VAULT SECURED', color: 'ink' },
  { tx: 'CONSENSUS::EDU', action: 'VERIFIED PEER', peer: 'UC BERKELEY ⇄ MIT ⇄ STANFORD PASS', status: 'SYBIL RESISTANT', color: 'acc' },
  { tx: 'BALANCE::DELTA', action: 'ZERO-SUM LEDGER', peer: 'ALICE: 4.50H BAL ⇄ ESCROW: 1.50H HELD', status: 'NET ZERO DELTA', color: 'pop' },
  { tx: 'ET-TX::0x3B8820', action: 'MINT +2.00 ECHO', peer: 'ELENA VANCE (LATEX) ⇄ DAVID KIM (ME)', status: 'SETTLED & TORN', color: 'acc' },
  { tx: 'ORACLE::SYNC', action: 'EPOCH 2026.04', peer: 'DISTRIBUTED UNIVERSITY TIME QUORUM', status: 'GASLESS SYSTEM', color: 'ink' },
  { tx: 'CRYPTO::STARK', action: 'ATOMIC ATTEST', peer: 'TIME-STAMPED ROOT: a94f82c10e53a29b', status: 'STATE FINALIZED', color: 'pop' },
  { tx: 'LEDGER::STREAM', action: 'LIVE PEER MINT', peer: 'SARAH CHEN (QUANT) ⇄ LIAM ROSS (DES)', status: 'ATOMIC ESCROW', color: 'acc' },
];

export const Act1HeroDoor: React.FC<Act1HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const maskedLedgerRef = useRef<HTMLDivElement | null>(null);
  const hudCoordRef = useRef<HTMLSpanElement | null>(null);

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

    const pulses: PulseWave[] = [];

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
          if (reticleRef.current) reticleRef.current.style.opacity = '1';
          if (maskedLedgerRef.current) maskedLedgerRef.current.style.opacity = '1';
        }
      } else if (isHovering) {
        isHovering = false;
        targetX = -2000;
        targetY = -2000;
        if (reticleRef.current) reticleRef.current.style.opacity = '0';
        if (maskedLedgerRef.current) maskedLedgerRef.current.style.opacity = '0';
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      targetX = -2000;
      targetY = -2000;
      if (reticleRef.current) reticleRef.current.style.opacity = '0';
      if (maskedLedgerRef.current) maskedLedgerRef.current.style.opacity = '0';
    };

    const onClick = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      pulses.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 520,
        strength: 1.0,
      });
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('click', onClick, { passive: true });

    const LENS_RADIUS = 210;

    const render = () => {
      if (isHovering) {
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;

        // Position circular instrument reticle
        if (reticleRef.current) {
          reticleRef.current.style.transform = `translate3d(${currentX - LENS_RADIUS}px, ${currentY - LENS_RADIUS}px, 0)`;
        }

        // Update radial mask on the illuminated ledger stream
        if (maskedLedgerRef.current) {
          const maskVal = `radial-gradient(circle ${LENS_RADIUS}px at ${currentX}px ${currentY}px, black 0%, black ${LENS_RADIUS * 0.65}px, rgba(0,0,0,0.4) ${LENS_RADIUS * 0.88}px, transparent ${LENS_RADIUS}px)`;
          maskedLedgerRef.current.style.maskImage = maskVal;
          maskedLedgerRef.current.style.webkitMaskImage = maskVal;
        }

        // Live coordinate badge in reticle
        if (hudCoordRef.current) {
          const normX = Math.round(currentX).toString().padStart(4, '0');
          const normY = Math.round(currentY).toString().padStart(4, '0');
          hudCoordRef.current.textContent = `INSPECT [X:${normX} Y:${normY}] · ATTESTED`;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Render expanding cryptographic sonar pulses on canvas
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += 14;
        p.strength *= 0.942;

        // Draw precision concentric attestation wave
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201, 229, 75, ${(p.strength * 0.32).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Secondary subtle blue halo
        if (p.radius > 25) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius - 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(107, 132, 255, ${(p.strength * 0.18).toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        if (p.radius > p.maxRadius || p.strength < 0.02) {
          pulses.splice(i, 1);
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
            CONCEPT 2: CRYPTOGRAPHIC "X-RAY LEDGER" LENS OVERLAY
            =================================================================== */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
          {/* Layer A: Ambient Ghost Ledger Texture (Extremely Subtle Background Depth) */}
          <div className="absolute inset-0 p-6 sm:p-12 opacity-[0.055] font-swiss-mono text-[10px] leading-relaxed flex flex-col justify-between overflow-hidden">
            {[0, 1, 2, 3].map((setIdx) => (
              <div key={`ghost-set-${setIdx}`} className="space-y-2 whitespace-nowrap">
                {LEDGER_TRANSACTIONS.map((row, i) => (
                  <div key={`ghost-${setIdx}-${i}`} className="flex items-center gap-6">
                    <span className="text-[#989A8E]">{row.tx}</span>
                    <span className="text-[#F1EFE8]">{row.action}</span>
                    <span className="text-[#989A8E]">{row.peer}</span>
                    <span className="text-[#989A8E]">{row.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Layer B: Masked High-Vibrancy Ledger Stream (Revealed Under Lens) */}
          <div
            ref={maskedLedgerRef}
            className="absolute inset-0 p-6 sm:p-12 font-swiss-mono text-[10.5px] leading-relaxed flex flex-col justify-between overflow-hidden opacity-0 transition-opacity duration-300"
            style={{
              willChange: 'mask-image, -webkit-mask-image',
            }}
          >
            {[0, 1, 2, 3].map((setIdx) => (
              <div key={`lens-set-${setIdx}`} className="space-y-2 whitespace-nowrap">
                {LEDGER_TRANSACTIONS.map((row, i) => (
                  <div key={`lens-${setIdx}-${i}`} className="flex items-center gap-6">
                    <span className="text-[#C9E54B] font-semibold">{row.tx}</span>
                    <span className="text-[#6B84FF] font-medium">{row.action}</span>
                    <span className="text-[#F1EFE8]">{row.peer}</span>
                    <span className="text-[#C9E54B]/80 px-1.5 py-0.5 rounded-[2px] bg-[#C9E54B]/10 border border-[#C9E54B]/20">
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Layer C: Interactive 60fps Click Sonar Pulse Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Layer D: The Physical Circular Inspection Reticle Instrument */}
          <div
            ref={reticleRef}
            className="absolute top-0 left-0 w-[420px] h-[420px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300"
            style={{ willChange: 'transform' }}
          >
            {/* Soft Inner Green/Blue Flashlight Beam */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(201, 229, 75, 0.14) 0%, rgba(107, 132, 255, 0.06) 48%, transparent 72%)',
              }}
            />

            {/* Precision Swiss Lens Border */}
            <div className="absolute inset-0 rounded-full border border-[#C9E54B]/60 shadow-[0_0_24px_rgba(201,229,75,0.18)]" />

            {/* Counter-Rotating Dashed Orbit Ring */}
            <div
              className="absolute -inset-3 rounded-full border border-dashed border-[#6B84FF]/35 pointer-events-none"
              style={{ animation: 'spin 45s linear infinite' }}
            />

            {/* 4 Cardinal Swiss Crosshairs (+) on Reticle Rim */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[1px] bg-[#C9E54B]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-[1px] bg-[#C9E54B]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-[1px] bg-[#C9E54B]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-4 w-[1px] bg-[#C9E54B]" />

            {/* Center Precision Target Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-[1px] bg-[#C9E54B]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-[1px] bg-[#C9E54B]" />

            {/* Top Monospace Instrument Badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-sm bg-[#1A1B17]/95 border border-[#C9E54B]/40 font-swiss-mono text-[8.5px] uppercase tracking-[0.16em] text-[#C9E54B] shadow-xl whitespace-nowrap backdrop-blur-sm">
              <span>LENS::X-RAY_LEDGER &middot; 01 PORTAL</span>
            </div>

            {/* Bottom Monospace Telemetry Badge */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-sm bg-[#1A1B17]/95 border border-[#6B84FF]/40 font-swiss-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6B84FF] shadow-xl whitespace-nowrap backdrop-blur-sm">
              <span ref={hudCoordRef}>INSPECT [0000:0000] &middot; ATTESTED</span>
            </div>
          </div>

          {/* Bottom-Left Stationary Status Indicator */}
          <div className="absolute bottom-6 left-6 lg:left-12 flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#1A1B17]/90 border border-[#C9E54B]/30 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E] shadow-2xl backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9E54B] animate-pulse" />
            <span className="text-[#C9E54B]">
              ATOMIC X-RAY LENS &middot; HOVER TO INSPECT RUNNING LEDGER
            </span>
          </div>

          {/* Bottom-Right Specification Tag */}
          <div className="hidden sm:flex absolute bottom-6 right-6 lg:right-12 items-center gap-2 font-swiss-mono text-[9px] uppercase tracking-[0.16em] text-[#989A8E]/60">
            <span>DISTRIBUTED CONSENSUS</span>
            <span className="text-[#6B84FF]">&middot;</span>
            <span>FIG. 01 CRYPTO ATTESTATION</span>
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
