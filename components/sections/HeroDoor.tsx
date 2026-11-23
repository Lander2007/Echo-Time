import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { SLAT_INDICES } from '@/data/echoData';
import { CANONICAL_CONTENT } from '@/data/content';
import { TactileAudioEngine } from '@/lib/audio';

interface HeroDoorProps {
  heroCameraRigRef: React.RefObject<HTMLDivElement | null>;
  heroImpactVignetteRef: React.RefObject<HTMLDivElement | null>;
  doorImpactFrameRef: React.RefObject<HTMLDivElement | null>;
  latchPulseRef: React.RefObject<HTMLDivElement | null>;
  scrollProgressRef: React.MutableRefObject<number>;
  getAudio?: () => TactileAudioEngine;
  onUnlocked?: () => void;
}

interface SpringState {
  v: number;
  target: number;
  vel: number;
  stiffness: number;
  damping: number;
}

export const HeroDoor: React.FC<HeroDoorProps> = ({
  heroCameraRigRef,
  heroImpactVignetteRef,
  doorImpactFrameRef,
  latchPulseRef,
  scrollProgressRef,
  getAudio,
  onUnlocked,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const doorOuterRef = useRef<HTMLDivElement | null>(null);
  const lightLeakAuraRef = useRef<HTMLDivElement | null>(null);
  const lightLeakSeamRef = useRef<HTMLDivElement | null>(null);
  const doorLeftRef = useRef<HTMLDivElement | null>(null);
  const doorRightRef = useRef<HTMLDivElement | null>(null);
  const latchWrapRef = useRef<HTMLDivElement | null>(null);
  const latchLeverRef = useRef<HTMLDivElement | null>(null);
  const latchRingCircleRef = useRef<SVGCircleElement | null>(null);
  const fxLayerRef = useRef<HTMLDivElement | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const isUnlockedRef = useRef(false);
  isUnlockedRef.current = isUnlocked;

  const isHoveringLatchRef = useRef(false);
  const isDraggingLatchRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const latchAngleRef = useRef(0);
  const lastDetentRef = useRef(0);
  const knockTimesRef = useRef<number[]>([]);
  const knockPeekActiveRef = useRef(false);

  // Springs configuration
  const springsRef = useRef<{
    left: SpringState;
    right: SpringState;
    tiltX: SpringState;
    tiltY: SpringState;
    slat: SpringState;
  }>({
    left: { v: 0, target: 0, vel: 0, stiffness: 0.14, damping: 0.82 },
    right: { v: 0, target: 0, vel: 0, stiffness: 0.14, damping: 0.82 },
    tiltX: { v: 0, target: 0, vel: 0, stiffness: 0.16, damping: 0.78 },
    tiltY: { v: 0, target: 0, vel: 0, stiffness: 0.16, damping: 0.78 },
    slat: { v: 0, target: 0, vel: 0, stiffness: 0.18, damping: 0.8 },
  });

  // ---------------------------------------------------------------------------
  // Minimalist Background Ambient Dot Matrix Canvas
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

    const dots: { x: number; y: number }[] = [];
    const SPACING = 56;

    const initGrid = () => {
      dots.length = 0;
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: offsetX + c * SPACING, y: offsetY + r * SPACING });
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

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);

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

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Master Unlock Action
  // ---------------------------------------------------------------------------
  const executeUnlock = useCallback(() => {
    if (isUnlockedRef.current) return;
    setIsUnlocked(true);
    getAudio?.().bolt();

    const sp = springsRef.current;
    sp.left.target = 114;
    sp.right.target = 114;
    sp.left.vel = 18;
    sp.right.vel = 18;
    sp.tiltX.target = 0;
    sp.tiltY.target = 0;

    // Bolt shockwave in FX layer
    if (fxLayerRef.current) {
      const ring = document.createElement('div');
      ring.className =
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-[#6B84FF] pointer-events-none';
      fxLayerRef.current.appendChild(ring);
      gsap.fromTo(
        ring,
        { scale: 0.5, opacity: 1 },
        {
          scale: 3.4,
          opacity: 0,
          duration: 0.52,
          ease: 'power3.out',
          onComplete: () => ring.remove(),
        }
      );
    }

    // Camera rig recoil
    if (heroCameraRigRef.current) {
      gsap.fromTo(
        heroCameraRigRef.current,
        { y: -7 },
        { y: 0, duration: 0.34, ease: 'elastic.out(1.25, 0.3)' }
      );
    }

    // Latch lever swing
    if (latchLeverRef.current) {
      gsap.to(latchLeverRef.current, {
        rotation: -90,
        duration: 0.22,
        ease: 'power2.inOut',
      });
    }

    // Latch wrap fade
    if (latchWrapRef.current) {
      gsap.to(latchWrapRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.18,
        delay: 0.08,
      });
    }

    // Trigger smooth transition into Act II
    if (onUnlocked) {
      onUnlocked();
    }
  }, [getAudio, heroCameraRigRef, onUnlocked]);

  // ---------------------------------------------------------------------------
  // Leaf Knock Recoil + 3-Knock Easter Egg
  // ---------------------------------------------------------------------------
  const handleLeafKnock = useCallback(
    (leafSide: 'left' | 'right', clientX: number, clientY: number) => {
      if (isUnlockedRef.current) return;
      getAudio?.().knock();

      const sp = springsRef.current;
      if (leafSide === 'left') {
        sp.left.vel += 15.5;
      } else {
        sp.right.vel += 15.5;
      }

      // Camera micro-shake
      if (heroCameraRigRef.current) {
        gsap.fromTo(
          heroCameraRigRef.current,
          { y: 3 },
          { y: 0, duration: 0.18, ease: 'power2.out' }
        );
      }

      // Spawn expanding knock ripple at pointer coordinates
      if (fxLayerRef.current && doorOuterRef.current) {
        const rect = doorOuterRef.current.getBoundingClientRect();
        const rx = clientX - rect.left;
        const ry = clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className =
          'absolute rounded-full border border-[#C9E54B] pointer-events-none';
        ripple.style.left = `${rx}px`;
        ripple.style.top = `${ry}px`;
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '24px';
        ripple.style.height = '24px';
        fxLayerRef.current.appendChild(ripple);

        gsap.fromTo(
          ripple,
          { scale: 0.4, opacity: 0.9 },
          {
            scale: 2.8,
            opacity: 0,
            duration: 0.42,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
          }
        );
      }

      // 3-Knock Easter Egg Tracking
      const now = Date.now();
      knockTimesRef.current.push(now);
      knockTimesRef.current = knockTimesRef.current.filter((t) => now - t < 1500);

      if (knockTimesRef.current.length >= 3) {
        knockTimesRef.current = [];
        knockPeekActiveRef.current = true;
        sp.left.target = 44;
        sp.right.target = 44;
        sp.left.vel = 12;
        sp.right.vel = 12;
        getAudio?.().shutter();

        if (lightLeakAuraRef.current) {
          gsap.to(lightLeakAuraRef.current, { opacity: 0.96, duration: 0.3 });
        }

        setTimeout(() => {
          knockPeekActiveRef.current = false;
          if (!isUnlockedRef.current) {
            sp.left.target = 0;
            sp.right.target = 0;
          }
        }, 1900);
      }
    },
    [getAudio, heroCameraRigRef]
  );

  // ---------------------------------------------------------------------------
  // Single-Loop Spring Physics + ScrollTrigger Handoff via gsap.ticker
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const doorOuter = doorOuterRef.current;
    const doorLeft = doorLeftRef.current;
    const doorRight = doorRightRef.current;
    const latchWrap = latchWrapRef.current;
    const lightLeakAura = lightLeakAuraRef.current;
    const lightLeakSeam = lightLeakSeamRef.current;

    if (!doorOuter || !doorLeft || !doorRight || !latchWrap) return;

    const tick = () => {
      const p = scrollProgressRef.current; // 0..1 from ScrollTrigger
      const interactWeight = Math.max(0, 1 - p / 0.14); // Cleanly attenuates interaction as scroll starts
      const scrollDoorOpen = gsap.utils.clamp(0, 1, (p - 0.14) / 0.44); // 0..1 across phase 2

      const sp = springsRef.current;

      // Integrate Left Spring
      const fLeft = (sp.left.target - sp.left.v) * sp.left.stiffness;
      sp.left.vel = (sp.left.vel + fLeft) * sp.left.damping;
      sp.left.v += sp.left.vel;

      // Integrate Right Spring
      const fRight = (sp.right.target - sp.right.v) * sp.right.stiffness;
      sp.right.vel = (sp.right.vel + fRight) * sp.right.damping;
      sp.right.v += sp.right.vel;

      // Integrate Frame Tilt Springs
      const fTiltX = (sp.tiltX.target - sp.tiltX.v) * sp.tiltX.stiffness;
      sp.tiltX.vel = (sp.tiltX.vel + fTiltX) * sp.tiltX.damping;
      sp.tiltX.v += sp.tiltX.vel;

      const fTiltY = (sp.tiltY.target - sp.tiltY.v) * sp.tiltY.stiffness;
      sp.tiltY.vel = (sp.tiltY.vel + fTiltY) * sp.tiltY.damping;
      sp.tiltY.v += sp.tiltY.vel;

      // Integrate Slat Tilt Spring
      const fSlat = (sp.slat.target - sp.slat.v) * sp.slat.stiffness;
      sp.slat.vel = (sp.slat.vel + fSlat) * sp.slat.damping;
      sp.slat.v += sp.slat.vel;

      // Combined Door Angles: spring peek attenuated by scroll progress + scroll opening curve
      const finalLeftDeg = sp.left.v * interactWeight - scrollDoorOpen * 114;
      const finalRightDeg = sp.right.v * interactWeight + scrollDoorOpen * 114;

      // 1. Write Door Leaf Transforms
      doorLeft.style.transform = `rotateY(${finalLeftDeg.toFixed(2)}deg)`;
      doorRight.style.transform = `rotateY(${finalRightDeg.toFixed(2)}deg)`;

      // 2. Write Outer Frame 3D Tilt
      if (interactWeight > 0.01) {
        doorOuter.style.transform = `rotateX(${sp.tiltX.v.toFixed(2)}deg) rotateY(${sp.tiltY.v.toFixed(2)}deg)`;
      }

      // 3. Update Louver Slat Rotations
      const slats = doorOuter.querySelectorAll<HTMLElement>('.swiss-slat');
      slats.forEach((slat) => {
        slat.style.transform = `rotateX(${sp.slat.v.toFixed(2)}deg)`;
      });

      // 4. Dynamic Latch Z-Tracking (Zero Latch Clipping)
      const maxOpenDeg = Math.max(Math.abs(finalLeftDeg), Math.abs(finalRightDeg));
      const leafWidth = (doorOuter.clientWidth - 24) / 2 || 170;
      const clampedPeekRad = (Math.min(50, maxOpenDeg) * Math.PI) / 180;
      const latchZ = 18 + Math.sin(clampedPeekRad) * leafWidth;
      const latchScale = Math.max(0.01, 1 - scrollDoorOpen * 1.8);
      const latchOpacity = Math.max(0, 1 - scrollDoorOpen * 2.2);

      latchWrap.style.transform = `translate(-50%, -50%) translateZ(${latchZ.toFixed(1)}px) scale(${latchScale.toFixed(3)})`;
      latchWrap.style.opacity = `${latchOpacity.toFixed(2)}`;

      // 5. Volumetric Light Leak Aura & Center Seam
      const leakIntensity = Math.min(1, Math.max(0, (maxOpenDeg - 4) / 36));
      if (lightLeakAura && !knockPeekActiveRef.current) {
        lightLeakAura.style.opacity = `${(leakIntensity * 0.85 * interactWeight).toFixed(3)}`;
      }
      if (lightLeakSeam) {
        lightLeakSeam.style.opacity = `${(leakIntensity * interactWeight).toFixed(3)}`;
        lightLeakSeam.style.width = `${Math.min(12, Math.max(2, maxOpenDeg * 0.35)).toFixed(1)}px`;
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
    };
  }, [scrollProgressRef]);

  // ---------------------------------------------------------------------------
  // Pointer Events: Hover Peek & Drag-to-Unlock
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const doorOuter = doorOuterRef.current;
    const latchWrap = latchWrapRef.current;
    if (!doorOuter || !latchWrap) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (scrollProgressRef.current > 0.05 || isUnlockedRef.current) return;

      const rect = doorOuter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const normX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 0.6)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.6)));

      const sp = springsRef.current;

      // A. If Dragging the Latch
      if (isDraggingLatchRef.current) {
        const pullDist = Math.hypot(
          e.clientX - dragStartRef.current.x,
          e.clientY - dragStartRef.current.y
        );
        const progressDeg = Math.min(90, Math.max(0, (pullDist / 78) * 90));
        latchAngleRef.current = progressDeg;

        // Haptic detent sound every 22 degrees
        const currentDetent = Math.floor(progressDeg / 22);
        if (currentDetent !== lastDetentRef.current) {
          lastDetentRef.current = currentDetent;
          getAudio?.().click();
        }

        // Rotate latch lever
        if (latchLeverRef.current) {
          latchLeverRef.current.style.transform = `rotate(${-progressDeg}deg)`;
        }

        // Update SVG circular progress ring
        if (latchRingCircleRef.current) {
          const dashOffset = 113 * (1 - progressDeg / 90);
          latchRingCircleRef.current.style.strokeDashoffset = `${dashOffset}`;
        }

        // Trigger unlock if past threshold
        if (progressDeg >= 82) {
          isDraggingLatchRef.current = false;
          executeUnlock();
        }
        return;
      }

      // B. Hover Peek Mode (when not dragging)
      if (!knockPeekActiveRef.current) {
        if (isHoveringLatchRef.current) {
          // Settles door to crisp 6-deg crack and levels tilt for effortless grab
          sp.tiltX.target = 0;
          sp.tiltY.target = 0;
          sp.left.target = 6;
          sp.right.target = 6;
        } else {
          // 3D Frame Tilt
          sp.tiltX.target = -normY * 6;
          sp.tiltY.target = normX * 8;

          // Asymmetric Leaf Peek: hovered leaf opens 5° wider than opposite
          const basePeek = 10 + (1 - Math.abs(normX)) * 8;
          if (normX < 0) {
            sp.left.target = basePeek + 5;
            sp.right.target = basePeek;
          } else {
            sp.right.target = basePeek + 5;
            sp.left.target = basePeek;
          }

          // Louver slat tilt along X-axis
          sp.slat.target = normY * 48;
        }
      }
    };

    const handlePointerLeave = () => {
      if (isUnlockedRef.current || isDraggingLatchRef.current) return;
      isHoveringLatchRef.current = false;

      const sp = springsRef.current;
      if (!knockPeekActiveRef.current) {
        sp.tiltX.target = 0;
        sp.tiltY.target = 0;
        sp.left.target = 0;
        sp.right.target = 0;
        sp.slat.target = 0;
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingLatchRef.current) return;
      isDraggingLatchRef.current = false;

      // Spring latch back to 0 if not unlocked
      if (latchAngleRef.current < 82 && !isUnlockedRef.current) {
        latchAngleRef.current = 0;
        lastDetentRef.current = 0;
        if (latchLeverRef.current) {
          gsap.to(latchLeverRef.current, {
            rotation: 0,
            duration: 0.28,
            ease: 'elastic.out(1.2, 0.4)',
          });
        }
        if (latchRingCircleRef.current) {
          gsap.to(latchRingCircleRef.current, {
            strokeDashoffset: 113,
            duration: 0.28,
          });
        }
      }
    };

    // Latch specific listeners (e.stopPropagation prevents leaf knock)
    const onLatchPointerEnter = () => {
      isHoveringLatchRef.current = true;
    };
    const onLatchPointerLeave = () => {
      isHoveringLatchRef.current = false;
    };
    const onLatchPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      if (isUnlockedRef.current) return;
      isDraggingLatchRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLatchClick = (e: MouseEvent) => {
      e.stopPropagation();
      executeUnlock();
    };

    doorOuter.addEventListener('pointermove', handlePointerMove, { passive: true });
    doorOuter.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerup', handlePointerUp);

    latchWrap.addEventListener('pointerenter', onLatchPointerEnter);
    latchWrap.addEventListener('pointerleave', onLatchPointerLeave);
    latchWrap.addEventListener('pointerdown', onLatchPointerDown);
    latchWrap.addEventListener('click', onLatchClick);

    return () => {
      doorOuter.removeEventListener('pointermove', handlePointerMove);
      doorOuter.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerup', handlePointerUp);

      latchWrap.removeEventListener('pointerenter', onLatchPointerEnter);
      latchWrap.removeEventListener('pointerleave', onLatchPointerLeave);
      latchWrap.removeEventListener('pointerdown', onLatchPointerDown);
      latchWrap.removeEventListener('click', onLatchClick);
    };
  }, [executeUnlock, getAudio, scrollProgressRef]);

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
        id="hero-camera-rig"
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
        <div className="hero-stagger relative z-20 max-w-[1400px] w-full mx-auto px-5 sm:px-10 flex flex-col items-center justify-center">
          {/* 3D Perspective Stage Wrapper (perspective: 1500px) */}
          <div
            id="atelier-portal-stage"
            className="door-stage-perspective swiss-portal-stage relative flex items-center justify-center mx-auto"
            style={{ perspective: '1500px' }}
          >
            {/* Ambient Volumetric Glow (.light-leak-aura): Sibling OUTSIDE .door-outer-frame at z-index: 0 */}
            <div
              ref={lightLeakAuraRef}
              className="light-leak-aura pointer-events-none absolute inset-[-55px] rounded-full opacity-0 blur-3xl z-0"
              style={{
                background:
                  'radial-gradient(circle, rgba(201, 229, 75, 0.42) 0%, rgba(201, 229, 75, 0.12) 50%, transparent 75%)',
                willChange: 'opacity',
              }}
              aria-hidden="true"
            />

            {/* 3D Door Outer Casing (.door-outer-frame) */}
            <div
              ref={doorOuterRef}
              id="atelier-window-outer"
              className="door-outer-frame swiss-door-outer relative z-10 select-none"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              {/* Dynamic Door Impact Frame & Latch Pulse Ring */}
              <div ref={doorImpactFrameRef} className="door-impact-frame" aria-hidden="true" />
              <div ref={latchPulseRef} className="latch-pulse-ring" aria-hidden="true" />

              {/* Swiss Signal Corner Registration Ticks */}
              <span className="door-corner-tick tick-tl" aria-hidden="true" />
              <span className="door-corner-tick tick-tr" aria-hidden="true" />
              <span className="door-corner-tick tick-bl" aria-hidden="true" />
              <span className="door-corner-tick tick-br" aria-hidden="true" />

              {/* Interior Daylight Poster (.door-aperture): translateZ(0px) */}
              <div
                className="swiss-door-aperture"
                style={{ transform: 'translateZ(0px)', transformStyle: 'preserve-3d' }}
              >
                <div className="door-daylight-poster flex flex-col items-center justify-center text-center p-6 sm:p-8">
                  <div id="door-sunbeam" className="door-sunbeam" aria-hidden="true" />

                  {/* Verbatim Approved Content from echotime-gdoud7zw.manus.space */}
                  <div className="relative z-10 my-auto py-4">
                    <div className="font-swiss-mono text-[9px] uppercase tracking-[0.2em] text-[#1E3AE0] font-semibold mb-2">
                      {CANONICAL_CONTENT.hero.eyebrow}
                    </div>
                    <div
                      className="font-swiss-sans font-black uppercase tracking-[-0.045em] text-3xl sm:text-4xl leading-[0.92]"
                      style={{ color: '#1A1B17' }}
                    >
                      {CANONICAL_CONTENT.hero.titleLine1}
                      <br />
                      {CANONICAL_CONTENT.hero.titleLine2}
                    </div>
                    <p className="mt-3 font-swiss-mono text-[9.5px] leading-relaxed max-w-[220px] mx-auto text-[#46493D]">
                      {CANONICAL_CONTENT.hero.note}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Light Seam (.light-leak-seam): translateZ(3px) */}
              <div
                ref={lightLeakSeamRef}
                className="light-leak-seam pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-[#C9E54B] opacity-0 blur-[1.5px] z-10"
                style={{ transform: 'translateZ(3px)', willChange: 'opacity, width' }}
                aria-hidden="true"
              />

              {/* Shutter Plane (.shutter-plane): translateZ(6px) */}
              <div
                className="shutter-plane"
                style={{
                  transform: 'translateZ(6px)',
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none',
                }}
              >
                {/* Left Door Leaf (.door-leaf): Double-Sided */}
                <div
                  ref={doorLeftRef}
                  id="shutter-left"
                  className="door-leaf shutter-door shutter-door-left"
                  style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    pointerEvents: isUnlocked ? 'none' : 'auto',
                  }}
                  onClick={(e) => handleLeafKnock('left', e.clientX, e.clientY)}
                  role="button"
                  tabIndex={0}
                  aria-label="Knock left door leaf"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLeafKnock('left', 0, 0);
                    }
                  }}
                >
                  <span className="swiss-hinge hinge-lt" aria-hidden="true" />
                  <span className="swiss-hinge hinge-lb" aria-hidden="true" />

                  {/* Leaf Front: Outer Face with Louvers */}
                  <div
                    className="leaf-front absolute inset-0 p-2 flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                  >
                    {/* Recessed Louver Backlight */}
                    <div
                      className="louver-backlight pointer-events-none absolute inset-0 bg-[#C9E54B]/20 blur-sm opacity-0 transition-opacity duration-200"
                      aria-hidden="true"
                    />

                    <div className="flex items-center justify-between font-swiss-mono text-[9px] tracking-[0.14em] text-[#989A8E]">
                      <span>L—01</span>
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#C9E54B]" />
                    </div>

                    <div className="swiss-louver-grid m-0 h-full" aria-hidden="true">
                      {SLAT_INDICES.map((i) => (
                        <div key={`slat-l-${i}`} data-idx={i} className="swiss-slat" />
                      ))}
                    </div>

                    <div className="font-swiss-mono text-[8.5px] uppercase tracking-[0.16em] text-[#989A8E]">
                      ECHO.SYS
                    </div>
                  </div>

                  {/* Leaf Back: Clean Dark Steel Interior Face (Zero Mirrored Text Past 90°) */}
                  <div
                    className="leaf-back absolute inset-0 bg-[#1F201B] border border-[rgba(241,239,232,0.18)]"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-full p-3 flex flex-col justify-between opacity-35">
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#989A8E]" />
                      <span className="font-swiss-mono text-[8px] text-[#989A8E] tracking-[0.16em]">
                        ECHO STEEL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Door Leaf (.door-leaf): Double-Sided */}
                <div
                  ref={doorRightRef}
                  id="shutter-right"
                  className="door-leaf shutter-door shutter-door-right"
                  style={{
                    transformOrigin: 'right center',
                    transformStyle: 'preserve-3d',
                    pointerEvents: isUnlocked ? 'none' : 'auto',
                  }}
                  onClick={(e) => handleLeafKnock('right', e.clientX, e.clientY)}
                  role="button"
                  tabIndex={0}
                  aria-label="Knock right door leaf"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLeafKnock('right', 0, 0);
                    }
                  }}
                >
                  <span className="swiss-hinge hinge-rt" aria-hidden="true" />
                  <span className="swiss-hinge hinge-rb" aria-hidden="true" />

                  {/* Leaf Front: Outer Face with Louvers */}
                  <div
                    className="leaf-front absolute inset-0 p-2 flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className="louver-backlight pointer-events-none absolute inset-0 bg-[#C9E54B]/20 blur-sm opacity-0 transition-opacity duration-200"
                      aria-hidden="true"
                    />

                    <div className="flex items-center justify-between font-swiss-mono text-[9px] tracking-[0.14em] text-[#989A8E]">
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#6B84FF]" />
                      <span>R—02</span>
                    </div>

                    <div className="swiss-louver-grid m-0 h-full" aria-hidden="true">
                      {SLAT_INDICES.map((i) => (
                        <div key={`slat-r-${i}`} data-idx={i} className="swiss-slat" />
                      ))}
                    </div>

                    <div className="font-swiss-mono text-[8.5px] uppercase tracking-[0.16em] text-right text-[#989A8E]">
                      1:1 PARITY
                    </div>
                  </div>

                  {/* Leaf Back: Clean Dark Steel Interior Face (Zero Mirrored Text Past 90°) */}
                  <div
                    className="leaf-back absolute inset-0 bg-[#1F201B] border border-[rgba(241,239,232,0.18)]"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-full p-3 flex flex-col justify-between items-end opacity-35">
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#6B84FF]" />
                      <span className="font-swiss-mono text-[8px] text-[#989A8E] tracking-[0.16em]">
                        ECHO STEEL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Central Latch Wrap: Dynamic Z-Tracking Ahead of Peeking Leaves */}
                <div
                  ref={latchWrapRef}
                  id="shutter-latch-wrap"
                  className="shutter-latch-wrap"
                  style={{
                    pointerEvents: isUnlocked ? 'none' : 'auto',
                    willChange: 'transform, opacity',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Twist or click to unlock door"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      executeUnlock();
                    }
                  }}
                >
                  <div className="swiss-latch-plate relative cursor-grab active:cursor-grabbing">
                    {/* SVG Progress Ring (0° → 90°) */}
                    <svg
                      className="absolute inset-[-4px] w-[52px] h-[52px] pointer-events-none -rotate-90"
                      viewBox="0 0 44 44"
                      aria-hidden="true"
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="rgba(201, 229, 75, 0.2)"
                        strokeWidth="1.5"
                      />
                      <circle
                        ref={latchRingCircleRef}
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#C9E54B"
                        strokeWidth="2"
                        strokeDasharray="113"
                        strokeDashoffset="113"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Rotating Mechanical Lever Bar */}
                    <div ref={latchLeverRef} id="shutter-latch-lever" className="shutter-latch-lever" />
                  </div>
                </div>
              </div>

              {/* FX Layer (.fx-layer): translateZ(44px) for Knock Ripples & Bolt Shockwaves */}
              <div
                ref={fxLayerRef}
                className="fx-layer pointer-events-none absolute inset-0 z-40"
                style={{ transform: 'translateZ(44px)', pointerEvents: 'none' }}
                aria-hidden="true"
              />

              {/* Architectural Steel Threshold Sill */}
              <div className="swiss-door-threshold" aria-hidden="true" />
            </div>
          </div>

          {/* Verbatim Approved Hero Content: Description, CTAs, Note & Recent Transactions */}
          <div className="mt-8 text-center max-w-xl mx-auto flex flex-col items-center gap-3.5 z-20">
            <p className="font-swiss-sans text-xs sm:text-sm text-[#989A8E] leading-relaxed max-w-lg">
              {CANONICAL_CONTENT.hero.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                data-cursor="START"
                onClick={executeUnlock}
                className="px-5 py-2.5 rounded bg-[#C9E54B] text-[#1A1B17] font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-[#d8f060] transition-colors"
              >
                {CANONICAL_CONTENT.hero.primaryCta}
              </button>
              <a
                href="#act-marketplace"
                data-cursor="EXPLORE"
                className="px-5 py-2.5 rounded border border-[#989A8E]/40 text-[#F1EFE8] font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-[#C9E54B] hover:text-[#C9E54B] transition-colors"
              >
                {CANONICAL_CONTENT.hero.secondaryCta}
              </a>
            </div>
            {/* Live Recent Transactions Proof */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 font-swiss-mono text-[10px] text-[#989A8E]">
              {CANONICAL_CONTENT.hero.recentTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#23251F] border border-[rgba(241,239,232,0.1)]"
                >
                  <span className="w-4 h-4 rounded-full bg-[#C9E54B]/20 text-[#C9E54B] font-bold text-[9px] flex items-center justify-center">
                    {tx.avatar}
                  </span>
                  <span>{tx.text}</span>
                  <span className={tx.amount.startsWith('+') ? 'text-[#C9E54B] font-semibold' : 'text-[#6B84FF] font-semibold'}>
                    {tx.amount}
                  </span>
                  <span className="text-[#989A8E]/60">{tx.unit}</span>
                </div>
              ))}
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
