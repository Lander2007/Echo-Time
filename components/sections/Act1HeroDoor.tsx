import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { SLAT_INDICES } from '@/data/echoData';
import { TactileAudioEngine } from '@/lib/audio';

interface Act1HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
  getAudio?: () => TactileAudioEngine;
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
  getAudio,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const doorOuterRef = useRef<HTMLDivElement | null>(null);
  const doorGlareRef = useRef<HTMLDivElement | null>(null);
  const posterInnerRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const isHoveringDoorRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Minimalist Background Dot Matrix + Ambient Spotlight
  // ---------------------------------------------------------------------------
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
    const SPACING = 56;

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

      if (isHovering) {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
      }

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

  // ---------------------------------------------------------------------------
  // Master Door State Transitions: Open & Close
  // ---------------------------------------------------------------------------
  const openDoor = useCallback(() => {
    setIsOpen(true);
    getAudio?.().shutter();

    // 1. Latch unlocks and disappears
    gsap.to('#shutter-latch-lever', {
      rotation: -90,
      duration: 0.18,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
    gsap.to('#shutter-latch-wrap', {
      opacity: 0,
      scale: 0.5,
      duration: 0.14,
      delay: 0.06,
      ease: 'power1.in',
      overwrite: 'auto',
    });

    // 2. Dual leaves swing open wide with elastic momentum
    gsap.to('#shutter-left', {
      rotateY: -108,
      duration: 0.58,
      ease: 'back.out(1.35)',
      overwrite: 'auto',
    });
    gsap.to('#shutter-right', {
      rotateY: 108,
      duration: 0.58,
      ease: 'back.out(1.35)',
      overwrite: 'auto',
    });

    // 3. Sunbeam reveals daylight
    gsap.to('#door-sunbeam', {
      opacity: 1,
      x: '75%',
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // 4. Latch shockwave ring pulse
    if (latchPulseRef.current) {
      gsap.fromTo(
        latchPulseRef.current,
        { scale: 0.45, opacity: 0.95, rotation: 0 },
        {
          scale: 2.8,
          opacity: 0,
          rotation: 45,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        }
      );
    }

    // 5. Tactile screen recoil
    if (heroCameraRigRef.current) {
      gsap.fromTo(
        heroCameraRigRef.current,
        { y: 6 },
        { y: 0, duration: 0.35, ease: 'elastic.out(1.2, 0.3)', overwrite: 'auto' }
      );
    }
  }, [getAudio, heroCameraRigRef, latchPulseRef]);

  const closeDoor = useCallback(() => {
    setIsOpen(false);
    getAudio?.().doorSlam();

    // 1. Shutters slam shut
    gsap.to(['#shutter-left', '#shutter-right'], {
      rotateY: 0,
      duration: 0.36,
      ease: 'power3.in',
      overwrite: 'auto',
    });

    // 2. Latch bar snaps back into place
    gsap.to('#shutter-latch-wrap', {
      opacity: 1,
      scale: 1,
      duration: 0.22,
      delay: 0.24,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    gsap.to('#shutter-latch-lever', {
      rotation: 0,
      duration: 0.22,
      delay: 0.26,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // 3. Sunbeam dims
    gsap.to('#door-sunbeam', {
      opacity: 0,
      x: '0%',
      duration: 0.28,
      overwrite: 'auto',
    });

    // 4. Door impact frame flash
    if (doorImpactFrameRef.current) {
      gsap.fromTo(
        doorImpactFrameRef.current,
        { scale: 1, opacity: 0.95 },
        { scale: 1.25, opacity: 0, duration: 0.44, ease: 'power3.out', overwrite: 'auto' }
      );
    }

    // 5. Impact vignette flash
    if (heroImpactVignetteRef.current) {
      gsap.fromTo(
        heroImpactVignetteRef.current,
        { opacity: 0.7 },
        { opacity: 0, duration: 0.36, ease: 'power2.out', overwrite: 'auto' }
      );
    }

    // 6. Mechanical camera recoil
    if (heroCameraRigRef.current) {
      gsap.fromTo(
        heroCameraRigRef.current,
        { y: -7 },
        { y: 0, duration: 0.32, ease: 'elastic.out(1.25, 0.28)', overwrite: 'auto' }
      );
    }
  }, [doorImpactFrameRef, getAudio, heroCameraRigRef, heroImpactVignetteRef]);

  // Toggle open/closed
  const toggleDoor = useCallback(() => {
    if (isOpenRef.current) {
      closeDoor();
    } else {
      openDoor();
    }
  }, [closeDoor, openDoor]);

  // ---------------------------------------------------------------------------
  // 3D Parallax Tilt & Tactile Peek on Pointer Move / Hover
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const doorEl = doorOuterRef.current;
    if (!doorEl) return;

    // Reset interaction when scrolling down so ScrollTrigger is unimpeded
    const handleScroll = () => {
      if (window.scrollY > 30 && isOpenRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handlePointerMove = (e: PointerEvent) => {
      if (window.scrollY > 30) return;
      const rect = doorEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width * 1.4)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height * 1.4)));

      // 3D Perspective Tilt on Door Casing
      gsap.to(doorEl, {
        rotateY: normX * 13,
        rotateX: -normY * 11,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Layer Parallax Depth: inner daylight poster recedes slightly
      if (posterInnerRef.current) {
        gsap.to(posterInnerRef.current, {
          x: -normX * 8,
          y: -normY * 8,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      // Specular Glare Tracking
      if (doorGlareRef.current) {
        const glareX = 50 + normX * 40;
        const glareY = 50 + normY * 40;
        doorGlareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(201, 229, 75, 0.16) 0%, rgba(241, 239, 232, 0.05) 45%, transparent 75%)`;
      }

      // Real-time Drag tracking
      if (isDraggingRef.current && !isOpenRef.current) {
        const delta = e.clientX - dragStartXRef.current;
        dragDeltaXRef.current = delta;
        const dragProgress = Math.min(1, Math.max(0, Math.abs(delta) / 140));
        const angle = dragProgress * 105;

        gsap.to('#shutter-left', {
          rotateY: -angle,
          duration: 0.1,
          overwrite: 'auto',
        });
        gsap.to('#shutter-right', {
          rotateY: angle,
          duration: 0.1,
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-lever', {
          rotation: -dragProgress * 90,
          duration: 0.1,
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-wrap', {
          opacity: 1 - dragProgress * 1.5,
          scale: 1 - dragProgress * 0.4,
          duration: 0.1,
          overwrite: 'auto',
        });
        gsap.to('#door-sunbeam', {
          opacity: dragProgress,
          x: `${dragProgress * 75}%`,
          duration: 0.1,
          overwrite: 'auto',
        });
      }
    };

    const handlePointerEnter = () => {
      if (window.scrollY > 30) return;
      isHoveringDoorRef.current = true;
      if (doorGlareRef.current) doorGlareRef.current.style.opacity = '1';

      // Tactile spring peek when resting closed
      if (!isOpenRef.current && !isDraggingRef.current) {
        getAudio?.().click();
        gsap.to('#shutter-left', {
          rotateY: -14,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#shutter-right', {
          rotateY: 14,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-lever', {
          rotation: -18,
          duration: 0.24,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#door-sunbeam', {
          opacity: 0.75,
          x: '25%',
          duration: 0.32,
          overwrite: 'auto',
        });
      }
    };

    const handlePointerLeave = () => {
      isHoveringDoorRef.current = false;
      if (doorGlareRef.current) doorGlareRef.current.style.opacity = '0';

      // Return 3D tilt to neutral
      gsap.to(doorEl, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      if (posterInnerRef.current) {
        gsap.to(posterInnerRef.current, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }

      // If closed, snap leaves flush shut
      if (!isOpenRef.current && !isDraggingRef.current) {
        gsap.to(['#shutter-left', '#shutter-right'], {
          rotateY: 0,
          duration: 0.42,
          ease: 'elastic.out(1.15, 0.45)',
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-lever', {
          rotation: 0,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#door-sunbeam', {
          opacity: 0,
          x: '0%',
          duration: 0.28,
          overwrite: 'auto',
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (window.scrollY > 30) return;
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragDeltaXRef.current = 0;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // If dragged past threshold (50px), finish opening
      if (Math.abs(dragDeltaXRef.current) > 50) {
        openDoor();
      } else if (!isOpenRef.current) {
        // Snap back shut
        gsap.to(['#shutter-left', '#shutter-right'], {
          rotateY: 0,
          duration: 0.35,
          ease: 'elastic.out(1.1, 0.4)',
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-lever', {
          rotation: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#shutter-latch-wrap', {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to('#door-sunbeam', {
          opacity: 0,
          x: '0%',
          duration: 0.25,
          overwrite: 'auto',
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    doorEl.addEventListener('pointerenter', handlePointerEnter);
    doorEl.addEventListener('pointerleave', handlePointerLeave);
    doorEl.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      doorEl.removeEventListener('pointerenter', handlePointerEnter);
      doorEl.removeEventListener('pointerleave', handlePointerLeave);
      doorEl.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openDoor, getAudio]);

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

        {/* Elevated Swiss Poster Stage — Centered Hyper-Interactive 3D Door Portal */}
        <div className="hero-stagger relative z-20 max-w-[1400px] w-full mx-auto px-5 sm:px-10 flex flex-col items-center justify-center">
          {/* Centerpiece: Elevated 3D Swiss Architectural Dual-Leaf Opening Door */}
          <div id="atelier-portal-stage" className="swiss-portal-stage mx-auto">
            <div
              ref={doorOuterRef}
              id="atelier-window-outer"
              className="swiss-door-outer cursor-pointer select-none transition-shadow duration-300 hover:shadow-[0_40px_90px_rgba(0,0,0,0.85)]"
              onClick={toggleDoor}
              role="button"
              tabIndex={0}
              aria-label={isOpen ? 'Click to lock door' : 'Click to unlock door'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDoor();
                }
              }}
            >
              {/* Dynamic Specular Sheen Glare */}
              <div
                ref={doorGlareRef}
                className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 transition-opacity duration-300 z-30"
                style={{ mixBlendMode: 'screen' }}
                aria-hidden="true"
              />

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
                <div
                  ref={posterInnerRef}
                  className="door-daylight-poster flex flex-col items-center justify-center text-center p-6 sm:p-8"
                >
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

          {/* Minimalist Tactile Interaction Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 font-swiss-mono text-[9.5px] uppercase tracking-[0.22em] text-[#989A8E]/60 select-none">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                isOpen ? 'bg-[#6B84FF]' : 'bg-[#C9E54B] animate-pulse'
              }`}
            />
            <span>{isOpen ? 'CLICK TO SLAM LOCK' : 'HOVER TO PEEL · CLICK TO UNLOCK'}</span>
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
