'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import {
  CHAPTERS,
  NAV_LINKS,
  CIRCUITS,
  LISTINGS,
  STRESS_SCENARIOS,
  PASS_PRESETS,
} from '@/data/echoData';

import {
  CategoryFilter,
  EscrowReceipt,
  MarketplaceListing,
  PassPreset,
  ToastItem,
} from '@/types/echo';

import { TactileAudioEngine } from '@/lib/audio';
import { computePassSerial } from '@/lib/serial';

import { Preloader } from '@/components/Preloader';
import { CustomCursor } from '@/components/CustomCursor';
import { ChapterRail } from '@/components/ChapterRail';
import { Navbar } from '@/components/Navbar';
import { AgreementDrawer } from '@/components/AgreementDrawer';
import { ToastStack } from '@/components/ToastStack';

import { HeroDoor } from '@/components/sections/HeroDoor';
import { Act2Guillotine } from '@/components/sections/Act2Guillotine';
import { Act3Patchboard } from '@/components/sections/Act3Patchboard';
import { Act4Marketplace } from '@/components/sections/Act4Marketplace';
import { VaultMarqueeBridge } from '@/components/sections/VaultMarqueeBridge';
import { Act5AuditTape } from '@/components/sections/Act5AuditTape';
import { Act6StressTest } from '@/components/sections/Act6StressTest';
import { Act7PassStudio } from '@/components/sections/Act7PassStudio';
import { Act8EchoFinale } from '@/components/sections/Act8EchoFinale';
import { FooterColophon } from '@/components/sections/FooterColophon';

export default function EchoTimeLandingPage() {
  /* --------------------------------------------------------------------------
     CORE ENGINE REFS (Lenis, Audio, DOM Elements for 60fps Imperative Updates)
     -------------------------------------------------------------------------- */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const audioRef = useRef<TactileAudioEngine | null>(null);
  const scrollVelocityRef = useRef<number>(0);

  // Preloader refs
  const preloaderRef = useRef<HTMLDivElement | null>(null);
  const preloaderBarRef = useRef<HTMLDivElement | null>(null);
  const preloaderCounterRef = useRef<HTMLSpanElement | null>(null);

  // Cursor & Navbar refs
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const cursorLabelRef = useRef<HTMLSpanElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const navContainerRef = useRef<HTMLElement | null>(null);
  const navIndicatorRef = useRef<HTMLDivElement | null>(null);

  // Act I Hero & Mechanical Shake refs
  const heroCameraRigRef = useRef<HTMLDivElement | null>(null);
  const latchPulseRef = useRef<HTMLDivElement | null>(null);
  const doorImpactFrameRef = useRef<HTMLDivElement | null>(null);
  const heroImpactVignetteRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<number>(0);

  // Act II Guillotine refs (60fps zero-rerender blade scrubbing)
  const guillotineStageRef = useRef<HTMLDivElement | null>(null);
  const guillotineParityRef = useRef<HTMLDivElement | null>(null);
  const guillotineBladeRef = useRef<HTMLDivElement | null>(null);
  const guillotinePctRef = useRef<HTMLSpanElement | null>(null);
  const bladePctRef = useRef<number>(12);
  const isDraggingBladeRef = useRef<boolean>(false);
  const userOverrodeBladeRef = useRef<boolean>(false);

  // Act III Patchboard refs
  const patchGridRef = useRef<HTMLDivElement | null>(null);
  const patchSvgRef = useRef<SVGSVGElement | null>(null);

  // Act IV SBB Marketplace refs
  const filterShellRef = useRef<HTMLDivElement | null>(null);
  const filterPillRef = useRef<HTMLDivElement | null>(null);
  const marketBoardRef = useRef<HTMLDivElement | null>(null);
  const flapTimersRef = useRef<number[]>([]);

  // Rising Vault & Kinetic Marquee refs
  const vaultChamberRef = useRef<HTMLDivElement | null>(null);
  const bridgeBandRef = useRef<HTMLDivElement | null>(null);
  const marqueeTopRef = useRef<HTMLDivElement | null>(null);
  const marqueeBotRef = useRef<HTMLDivElement | null>(null);

  // Act V Audit Tape refs
  const tapePaperRef = useRef<HTMLDivElement | null>(null);
  const tapeFeedPctRef = useRef<HTMLSpanElement | null>(null);
  const tapeFeedBarRef = useRef<HTMLDivElement | null>(null);
  const tapeBalBRef = useRef<HTMLDivElement | null>(null);
  const tapeVaultHoldRef = useRef<HTMLSpanElement | null>(null);
  const tapePinTriggerRef = useRef<ScrollTrigger | null>(null);

  // Act VI Stress-Test SVG refs
  const stressCurvePathRef = useRef<SVGPathElement | null>(null);
  const stressPulseDotRef = useRef<SVGCircleElement | null>(null);

  // Act VII Founding Pass refs
  const passCardRef = useRef<HTMLDivElement | null>(null);
  const passSpecularRef = useRef<HTMLDivElement | null>(null);
  const passCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Act VIII Interactive Liquid Distortion Finale refs
  const finaleSectionRef = useRef<HTMLElement | null>(null);
  const finaleWordWrapRef = useRef<HTMLDivElement | null>(null);
  const finaleTurbRef = useRef<SVGFETurbulenceElement | null>(null);
  const finaleDispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const finaleStateRef = useRef({
    rafId: 0,
    hovering: false,
    currentScale: 0,
    targetScale: 0,
    velocityBoost: 0,
    phase: 0,
    lastX: 0,
    lastY: 0,
    magX: 0,
    magY: 0,
    targetMagX: 0,
    targetMagY: 0,
  });

  /* --------------------------------------------------------------------------
     REACT UI STATE
     -------------------------------------------------------------------------- */
  const [chromeTheme, setChromeTheme] = useState<'dark' | 'light'>('dark');
  const [activeNavId, setActiveNavId] = useState<string>('act-thesis');
  const [activeChapterId, setActiveChapterId] = useState<string>('act-hero');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Shared Live Demo Wallet State
  const [walletAvailable, setWalletAvailable] = useState<number>(4.5);
  const [walletLocked, setWalletLocked] = useState<number>(0.0);

  // Act III Patchboard + Guild Bus State
  const [activeCircuitIdx, setActiveCircuitIdx] = useState<number>(0);
  const [guildHours, setGuildHours] = useState<number>(11.5);
  const [guildContributors, setGuildContributors] = useState<number>(5);
  const [userPledgedGuild, setUserPledgedGuild] = useState<boolean>(false);

  // Act IV SBB Marketplace & Agreement Room Drawer State
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'rating' | 'hours-asc' | 'hours-desc'>('rating');
  const [expandedRowId, setExpandedRowId] = useState<string | null>('mk-1');
  const [boardClock, setBoardClock] = useState<string>('LOCAL BOARD · SYNCED');

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing>(LISTINGS[0]);
  const [proposedHours, setProposedHours] = useState<number>(1.5);
  const [checkedDeliverables, setCheckedDeliverables] = useState<boolean[]>([true, true, true]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [escrowReceipt, setEscrowReceipt] = useState<EscrowReceipt | null>(null);

  // Act V Audit Tape State
  const [tapeStage, setTapeStage] = useState<number>(0);
  const [isTapeTorn, setIsTapeTorn] = useState<boolean>(false);

  // Act VI Stress-Test Console State
  const [stressIdx, setStressIdx] = useState<number>(0);
  const [visibleLogCount, setVisibleLogCount] = useState<number>(0);

  // Act VII Founding Pass Studio State
  const [studentName, setStudentName] = useState<string>('Maya Chen');
  const [university, setUniversity] = useState<string>('UC Berkeley — Computer Science');
  const [primaryCraft, setPrimaryCraft] = useState<string>('Next.js & TypeScript Audits');
  const [sealStampKey, setSealStampKey] = useState<number>(0);

  /* --------------------------------------------------------------------------
     HELPERS: AUDIO, TOASTS, SMOOTH SCROLL, WALLET LOCK
     -------------------------------------------------------------------------- */
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new TactileAudioEngine();
    }
    return audioRef.current;
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const scrollToTarget = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el as HTMLElement, { offset: 0, duration: 1.05 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const lockWalletHours = useCallback(
    (hours: number): boolean => {
      if (walletAvailable - hours < -1.0) return false;
      setWalletAvailable((prev) => Number((prev - hours).toFixed(2)));
      setWalletLocked((prev) => Number((prev + hours).toFixed(2)));
      return true;
    },
    [walletAvailable]
  );

  /* --------------------------------------------------------------------------
     NAVBAR SLIDING PILL POSITIONER
     -------------------------------------------------------------------------- */
  const moveNavIndicator = useCallback((sectionId: string) => {
    const nav = navContainerRef.current;
    const indicator = navIndicatorRef.current;
    if (!nav || !indicator) return;
    const target = nav.querySelector<HTMLElement>(`[data-section="${sectionId}"]`);
    if (!target) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = target.getBoundingClientRect();
    if (elRect.width === 0) return;
    indicator.style.width = `${elRect.width}px`;
    indicator.style.transform = `translate3d(${elRect.left - navRect.left - 3}px, 0, 0)`;
  }, []);

  useEffect(() => {
    moveNavIndicator(activeNavId);
  }, [activeNavId, moveNavIndicator]);

  useEffect(() => {
    document.body.classList.toggle('cursor-is-light', chromeTheme === 'light');
  }, [chromeTheme]);

  /* --------------------------------------------------------------------------
     ACT II GUILLOTINE BLADE CONTROLLER (60FPS IMPERATIVE DOM UPDATES)
     -------------------------------------------------------------------------- */
  const setBladePercent = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    bladePctRef.current = clamped;
    if (guillotineParityRef.current) {
      guillotineParityRef.current.style.clipPath = `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)`;
    }
    if (guillotineBladeRef.current) {
      guillotineBladeRef.current.style.left = `${clamped.toFixed(2)}%`;
      guillotineBladeRef.current.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }
    if (guillotinePctRef.current) {
      guillotinePctRef.current.textContent = `CUT: ${String(Math.round(clamped)).padStart(2, '0')}%`;
    }
  }, []);

  const animateBladeTo = useCallback(
    (targetPct: number) => {
      userOverrodeBladeRef.current = true;
      const g = gsap;
      if (!g) {
        setBladePercent(targetPct);
        return;
      }
      const proxy = { v: bladePctRef.current };
      g.to(proxy, {
        v: targetPct,
        duration: 0.58,
        ease: 'power3.out',
        onUpdate: () => setBladePercent(proxy.v),
      });
    },
    [setBladePercent]
  );

  const updateBladeFromPointer = useCallback(
    (clientX: number) => {
      const stage = guillotineStageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
      userOverrodeBladeRef.current = true;
      setBladePercent(pct);
    },
    [setBladePercent]
  );

  /* --------------------------------------------------------------------------
     ACT III PATCHBOARD SVG BEZIER CABLE RENDERER
     -------------------------------------------------------------------------- */
  const drawPatchCables = useCallback((circuitIndex: number) => {
    const grid = patchGridRef.current;
    const svg = patchSvgRef.current;
    if (!grid || !svg || typeof window === 'undefined' || window.innerWidth < 1024) return;
    const gridRect = grid.getBoundingClientRect();
    if (gridRect.width === 0) return;

    svg.setAttribute('viewBox', `0 0 ${gridRect.width} ${gridRect.height}`);
    let paths = '';

    CIRCUITS.forEach((c, idx) => {
      const sockIn = grid.querySelector(`[data-jack-in="${c.inIdx}"]`);
      const sockOut = grid.querySelector(`[data-jack-out="${c.outIdx}"]`);
      if (!sockIn || !sockOut) return;

      const r1 = sockIn.getBoundingClientRect();
      const r2 = sockOut.getBoundingClientRect();
      const x1 = r1.left + r1.width / 2 - gridRect.left;
      const y1 = r1.top + r1.height / 2 - gridRect.top;
      const x2 = r2.left + r2.width / 2 - gridRect.left;
      const y2 = r2.top + r2.height / 2 - gridRect.top;

      const cpSpan = Math.max(80, (x2 - x1) * 0.42);
      const sag = idx === circuitIndex ? 22 : 8;
      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + cpSpan).toFixed(1)} ${(y1 + sag).toFixed(1)}, ${(x2 - cpSpan).toFixed(1)} ${(y2 + sag).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      if (idx === circuitIndex) {
        paths += `<path d="${d}" fill="none" stroke="rgba(2,31,148,0.22)" stroke-width="6.5" stroke-linecap="round" />`;
        paths += `<path d="${d}" fill="none" stroke="#021F94" stroke-width="3.2" stroke-linecap="round" />`;
        paths += `<path d="${d}" fill="none" stroke="#D93829" stroke-width="2" stroke-linecap="round" class="patch-wire-active" />`;
        paths += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.5" fill="#D93829" stroke="#021F94" stroke-width="1.8" />`;
        paths += `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.5" fill="#D93829" stroke="#021F94" stroke-width="1.8" />`;
      } else {
        paths += `<path d="${d}" fill="none" stroke="rgba(2,31,148,0.18)" stroke-width="1.4" stroke-dasharray="4 6" />`;
      }
    });

    svg.innerHTML = paths;
  }, []);

  useEffect(() => {
    drawPatchCables(activeCircuitIdx);
    const onResize = () => drawPatchCables(activeCircuitIdx);
    window.addEventListener('resize', onResize, { passive: true });
    const t = window.setTimeout(() => drawPatchCables(activeCircuitIdx), 180);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, [activeCircuitIdx, drawPatchCables]);

  /* --------------------------------------------------------------------------
     ACT IV SBB MARKETPLACE: FILTERED LISTINGS, CLOCK, SLIDING PILL & FLAP FX
     -------------------------------------------------------------------------- */
  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = LISTINGS.filter((item) => {
      const catMatch = activeCategory === 'All' || item.category === activeCategory;
      const textMatch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.peer.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.hall.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
    return list.slice().sort((a, b) => {
      if (sortMode === 'hours-asc') return a.hours - b.hours;
      if (sortMode === 'hours-desc') return b.hours - a.hours;
      return b.rating - a.rating;
    });
  }, [activeCategory, searchQuery, sortMode]);

  const triggerFlapScramble = useCallback(() => {
    const board = marketBoardRef.current;
    if (!board) return;
    flapTimersRef.current.forEach((id) => window.clearInterval(id));
    flapTimersRef.current = [];

    const cells = Array.from(board.querySelectorAll<HTMLElement>('[data-flap-text]'));
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

    cells.forEach((cell, idx) => {
      const finalText = cell.getAttribute('data-flap-text') || '';
      let ticks = 0;
      const maxTicks = 4 + (idx % 4);
      cell.classList.add('is-flipping');

      const timer = window.setInterval(() => {
        ticks += 1;
        if (ticks >= maxTicks) {
          window.clearInterval(timer);
          cell.textContent = finalText;
          cell.classList.remove('is-flipping');
        } else {
          cell.textContent = finalText
            .split('')
            .map((ch) =>
              ch === ' ' || ch === ':' || ch === '.'
                ? ch
                : charset[Math.floor(Math.random() * charset.length)]
            )
            .join('');
        }
      }, 38);
      flapTimersRef.current.push(timer);
    });

    getAudio().flap();
  }, [getAudio]);

  // Live Swiss Station Clock (client-only to guarantee SSR hydration parity)
  useEffect(() => {
    const tickClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setBoardClock(`BOARD TIME · ${hh}:${mm}:${ss}`);
    };
    tickClock();
    const id = window.setInterval(tickClock, 1000);
    return () => {
      window.clearInterval(id);
      flapTimersRef.current.forEach((t) => window.clearInterval(t));
    };
  }, []);

  // Sliding Category Filter Pill
  const moveFilterPill = useCallback((cat: CategoryFilter) => {
    const shell = filterShellRef.current;
    const pill = filterPillRef.current;
    if (!shell || !pill) return;
    const btn = shell.querySelector<HTMLElement>(`[data-category="${cat}"]`);
    if (!btn) return;
    const shellRect = shell.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    pill.style.width = `${btnRect.width}px`;
    pill.style.height = `${btnRect.height}px`;
    pill.style.transform = `translate3d(${btnRect.left - shellRect.left - 4}px, ${btnRect.top - shellRect.top - 4}px, 0)`;
  }, []);

  useEffect(() => {
    moveFilterPill(activeCategory);
    const onResize = () => moveFilterPill(activeCategory);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [activeCategory, moveFilterPill]);

  // Refresh ScrollTrigger positions whenever Marketplace height changes
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeCategory, searchQuery, sortMode, expandedRowId]);

  /* --------------------------------------------------------------------------
     ACT V AUDIT TAPE PROGRESS HELPER
     -------------------------------------------------------------------------- */
  const applyTapeProgress = useCallback((progress: number) => {
    const p = Math.max(0, Math.min(1, progress));
    const pct = Math.round(25 + p * 75);
    if (tapeFeedPctRef.current) tapeFeedPctRef.current.textContent = `${pct}%`;
    if (tapeFeedBarRef.current) tapeFeedBarRef.current.style.width = `${pct}%`;
    if (tapePaperRef.current) {
      const offset = -64 * (1 - p);
      tapePaperRef.current.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
    const nextStage = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    setTapeStage((prev) => (prev === nextStage ? prev : nextStage));
  }, []);

  /* --------------------------------------------------------------------------
     ACT VI STRESS-TEST TERMINAL STREAM & SVG CURVE ANIMATION
     -------------------------------------------------------------------------- */
  const activeStressScenario = STRESS_SCENARIOS[stressIdx] || STRESS_SCENARIOS[0];

  useEffect(() => {
    const pathEl = stressCurvePathRef.current;
    const dotEl = stressPulseDotRef.current;
    const g = gsap;
    if (pathEl && g) {
      const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 620;
      g.fromTo(
        pathEl,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.72, ease: 'power3.out' }
      );
    }
    if (dotEl && g) {
      g.to(dotEl, {
        attr: { cx: activeStressScenario.dot.cx, cy: activeStressScenario.dot.cy },
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    setVisibleLogCount(0);
    const timers: number[] = [];
    activeStressScenario.logs.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        setVisibleLogCount(idx + 1);
      }, (idx + 1) * 165);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [stressIdx, activeStressScenario]);

  /* --------------------------------------------------------------------------
     MASTER CHOREOGRAPHY EFFECT (LENIS + GSAP SCROLLTRIGGER + CURSOR + SHAKE)
     Uses gsap.context() + named ticker removals for 100% React Strict Mode safety
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const finaleState = finaleStateRef.current;
    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let loadedGsap: typeof gsap | null = null;
    let lenis: Lenis | null = null;
    let onLenisRaf: ((time: number) => void) | null = null;
    let onShakeTick: (() => void) | null = null;
    let onMarqueeTick: (() => void) | null = null;
    let cursorRafId = 0;
    let resizeTimer: number | null = null;

    // 1. Scroll Progress Bar removed per user request

    // 2. Global Pointer Listeners for Act II Blade Dragging
    const onGlobalPointerMove = (e: PointerEvent) => {
      if (!isDraggingBladeRef.current) return;
      updateBladeFromPointer(e.clientX);
    };
    const onGlobalPointerUp = () => {
      isDraggingBladeRef.current = false;
    };
    window.addEventListener('pointermove', onGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', onGlobalPointerUp);

    // 3. Custom Magnetic Swiss Cursor & Magnetic CTAs
    const cleanupCursorFns: Array<() => void> = [];
    const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (isFinePointer && cursorRingRef.current && cursorDotRef.current) {
      const ring = cursorRingRef.current;
      const dot = cursorDotRef.current;
      const label = cursorLabelRef.current;
      document.body.classList.add('custom-cursor-ready');

      let mouseX = -140;
      let mouseY = -140;
      let ringX = -140;
      let ringY = -140;

      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate3d(${mouseX - 2.5}px, ${mouseY - 2.5}px, 0)`;
      };
      const onMouseOver = (e: MouseEvent) => {
        const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor]');
        if (target) {
          if (label) label.textContent = target.getAttribute('data-cursor') || '';
          ring.classList.add('is-labeled');
          dot.classList.add('is-hidden');
        }
      };
      const onMouseOut = (e: MouseEvent) => {
        const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor]');
        const next = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-cursor]');
        if (target && !next) {
          ring.classList.remove('is-labeled');
          dot.classList.remove('is-hidden');
        }
      };
      const onDocLeave = () => {
        ring.style.opacity = '0';
        dot.style.opacity = '0';
      };
      const onDocEnter = () => {
        ring.style.opacity = '';
        dot.style.opacity = '';
      };

      const renderCursor = () => {
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        const halfW = ring.offsetWidth / 2;
        const halfH = ring.offsetHeight / 2;
        ring.style.transform = `translate3d(${ringX - halfW}px, ${ringY - halfH}px, 0)`;
        cursorRafId = window.requestAnimationFrame(renderCursor);
      };
      cursorRafId = window.requestAnimationFrame(renderCursor);

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mouseout', onMouseOut);
      document.addEventListener('mouseleave', onDocLeave);
      document.addEventListener('mouseenter', onDocEnter);

      cleanupCursorFns.push(() => {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mouseout', onMouseOut);
        document.removeEventListener('mouseleave', onDocLeave);
        document.removeEventListener('mouseenter', onDocEnter);
        document.body.classList.remove('custom-cursor-ready');
      });

      const magnetics = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'));
      magnetics.forEach((el) => {
        const onMagMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.16;
          const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        };
        const onMagLeave = () => {
          el.style.transform = 'translate3d(0, 0, 0)';
        };
        el.addEventListener('mousemove', onMagMove);
        el.addEventListener('mouseleave', onMagLeave);
        cleanupCursorFns.push(() => {
          el.removeEventListener('mousemove', onMagMove);
          el.removeEventListener('mouseleave', onMagLeave);
        });
      });
    }

    // 4. Resize & Font-Ready Refresh
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 160);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Safety fallback so preloader never blocks if offline
    const fallbackPreloaderTimer = window.setTimeout(() => {
      if (preloaderRef.current && !gsap) {
        preloaderRef.current.style.display = 'none';
      }
    }, 2200);

    // 5. Initialize GSAP + ScrollTrigger + Lenis and Run All 7 Acts
    gsap.registerPlugin(ScrollTrigger);
    loadedGsap = gsap;

      // Initialize Lenis Smooth Scroll
      if (Lenis) {
        try {
          lenis = new Lenis({
            lerp: 0.095,
            smoothWheel: true,
            touchMultiplier: 1.4,
          });
          lenisRef.current = lenis;

          lenis.on('scroll', (e: { velocity?: number }) => {
            scrollVelocityRef.current = e.velocity || 0;
            ScrollTrigger.update();
          });

          onLenisRaf = (time: number) => {
            lenis?.raf(time * 1000);
          };
          gsap.ticker.add(onLenisRaf);
          gsap.ticker.lagSmoothing(0);
        } catch (err) {
          console.warn('Lenis fallback:', err);
        }
      }

      ctx = gsap.context(() => {
        // Preloader Curtain (Fast 00 -> 100 Swiss reveal)
        if (preloaderRef.current) {
          lenis?.stop();
          const prog = { val: 0 };
          gsap.to(prog, {
            val: 100,
            duration: 0.75,
            ease: 'power3.inOut',
            onUpdate: () => {
              const v = Math.round(prog.val);
              if (preloaderCounterRef.current) {
                preloaderCounterRef.current.textContent = String(v).padStart(2, '0');
              }
              if (preloaderBarRef.current) {
                preloaderBarRef.current.style.width = `${v}%`;
              }
            },
            onComplete: () => {
              if (!preloaderRef.current) return;
              gsap.to(preloaderRef.current, {
                yPercent: -100,
                duration: 0.68,
                ease: 'power4.inOut',
                onComplete: () => {
                  if (preloaderRef.current) preloaderRef.current.style.display = 'none';
                  lenis?.start();
                },
              });
            },
          });
        }

        // ACT I — Hero Entrance + 3D Swiss Opening Door + Mechanical Screen Shake
        gsap.fromTo(
          '.hero-stagger',
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.45,
            clearProps: 'transform,opacity',
          }
        );

        const cameraRig = heroCameraRigRef.current;
        const reducedMotion =
          window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let impactAmp = 0;
        let impactPunch = 0;
        let rumbleAmp = 0;
        let shakeClock = 0;
        let isRigNeutral = true;

        const triggerCameraImpact = (power = 10, punch = 0.015) => {
          if (reducedMotion || !cameraRig) return;
          impactAmp = Math.max(impactAmp, power);
          impactPunch = Math.max(impactPunch, punch);
        };

        const fireLatchShockwave = () => {
          if (!latchPulseRef.current || reducedMotion) return;
          gsap.fromTo(
            latchPulseRef.current,
            { scale: 0.45, opacity: 0.95, rotation: 0 },
            {
              scale: 2.6,
              opacity: 0,
              rotation: 45,
              duration: 0.46,
              ease: 'power3.out',
              overwrite: 'auto',
            }
          );
        };

        const fireDoorSlamShockwave = () => {
          if (reducedMotion) return;
          if (doorImpactFrameRef.current) {
            gsap.fromTo(
              doorImpactFrameRef.current,
              { scale: 1, opacity: 0.95 },
              { scale: 1.26, opacity: 0, duration: 0.52, ease: 'power3.out', overwrite: 'auto' }
            );
          }
          if (heroImpactVignetteRef.current) {
            gsap.fromTo(
              heroImpactVignetteRef.current,
              { opacity: 0.85 },
              { opacity: 0, duration: 0.44, ease: 'power2.out', overwrite: 'auto' }
            );
          }
        };

        if (cameraRig && !reducedMotion) {
          onShakeTick = () => {
            const totalAmp = impactAmp + rumbleAmp;
            if (totalAmp > 0.08 || impactPunch > 0.0005) {
              isRigNeutral = false;
              shakeClock += 0.58;
              const sx =
                (Math.sin(shakeClock * 3.7) * 0.65 + Math.cos(shakeClock * 8.3) * 0.35) * totalAmp;
              const sy =
                (Math.cos(shakeClock * 4.9) * 0.65 + Math.sin(shakeClock * 9.7) * 0.35) *
                totalAmp *
                0.82;
              const srot = Math.sin(shakeClock * 5.3) * totalAmp * 0.065;
              const sscale = 1 + impactPunch;

              cameraRig.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) rotate(${srot.toFixed(3)}deg) scale(${sscale.toFixed(4)})`;

              impactAmp *= 0.86;
              impactPunch *= 0.82;
              rumbleAmp *= 0.84;
            } else if (!isRigNeutral) {
              isRigNeutral = true;
              impactAmp = 0;
              impactPunch = 0;
              rumbleAmp = 0;
              cameraRig.style.transform = 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)';
            }
          };
          gsap.ticker.add(onShakeTick);
        }

        let latchFired = false;
        let slamFired = false;
        let wasOpened = false;
        let prevProgress = 0;

        const portalTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#act-hero',
            start: 'top top',
            end: '+=180%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onLeaveBack: () => {
              gsap.set('#hero-monument-watermark', {
                opacity: 1,
                scale: 1,
                overwrite: 'auto',
              });
              gsap.set('.swiss-slat', {
                rotateX: 0,
                overwrite: 'auto',
              });
            },
            onUpdate: (self: ScrollTrigger) => {
              const p = self.progress;
              scrollProgressRef.current = p;
              if (p <= 0.04) {
                gsap.set('#hero-monument-watermark', {
                  opacity: 1,
                  scale: 1,
                  overwrite: 'auto',
                });
                gsap.set('.swiss-slat', {
                  rotateX: 0,
                  overwrite: 'auto',
                });
              }
              const delta = Math.abs(p - prevProgress);

              if (p > 0.13 && !latchFired) {
                latchFired = true;
                wasOpened = true;
                getAudio().shutter();
                triggerCameraImpact(8.5, 0.012);
                fireLatchShockwave();
              } else if (p < 0.05) {
                if (wasOpened) {
                  wasOpened = false;
                  triggerCameraImpact(6.5, 0.008);
                  getAudio().doorSlam();
                }
                latchFired = false;
              }

              if (p >= 0.14 && p <= 0.54 && delta > 0.0006 && !reducedMotion) {
                rumbleAmp = Math.min(6.2, rumbleAmp + delta * 240);
              }

              if (p > 0.5 && !slamFired) {
                slamFired = true;
                getAudio().doorSlam();
                triggerCameraImpact(14.5, 0.02);
                fireDoorSlamShockwave();
              } else if (p < 0.38) {
                slamFired = false;
              }

              prevProgress = p;
              setChromeTheme(p >= 0.78 ? 'light' : 'dark');
            },
          },
        });

        portalTl
          .to('.swiss-slat', { rotateX: -80, duration: 0.14, ease: 'power2.inOut', stagger: 0.005 }, 0)
          .to('#shutter-latch-lever', { rotation: -90, duration: 0.14, ease: 'power2.inOut' }, 0)
          .to(
            '#shutter-latch-wrap',
            { opacity: 0, scale: 0.55, duration: 0.12, ease: 'power1.in' },
            0.12
          )
          .to(
            '#hero-monument-watermark',
            { opacity: 0, scale: 1.06, duration: 0.36, ease: 'power2.in' },
            0.14
          )
          .to('#door-sunbeam', { x: '85%', duration: 0.44, ease: 'power1.inOut' }, 0.18)
          .to('#atelier-window-outer', { scale: 3.4, y: 34, duration: 0.48, ease: 'power2.in' }, 0.48)
          .to('#hero-parchment-wash', { opacity: 1, duration: 0.32, ease: 'power1.inOut' }, 0.64);

        // ACT II — Parity Guillotine Scroll Cutaway & Stat Counters
        document.querySelectorAll<HTMLElement>('#act-thesis .stat-counter').forEach((el) => {
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: '#act-thesis',
            start: 'top 70%',
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 1.0,
                ease: 'power3.out',
                onUpdate: () => {
                  el.textContent = `${obj.val.toFixed(decimals)}${suffix}`;
                },
              });
            },
          });
        });

        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
          ScrollTrigger.create({
            trigger: '#act-thesis',
            start: 'top top',
            end: '+=115%',
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            onUpdate: (self: ScrollTrigger) => {
              if (!isDraggingBladeRef.current) {
                userOverrodeBladeRef.current = false;
                setBladePercent(self.progress * 100);
              }
            },
          });

          // ACT V — Pinned Thermal Audit Tape Feed
          tapePinTriggerRef.current = ScrollTrigger.create({
            trigger: '#act-escrow',
            start: 'top top',
            end: '+=135%',
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self: ScrollTrigger) => applyTapeProgress(self.progress),
          });

          return () => {
            tapePinTriggerRef.current = null;
          };
        });

        mm.add('(max-width: 1023px)', () => {
          ScrollTrigger.create({
            trigger: '#act-thesis',
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: 0.5,
            onUpdate: (self: ScrollTrigger) => {
              if (!isDraggingBladeRef.current && !userOverrodeBladeRef.current) {
                setBladePercent(self.progress * 100);
              }
            },
          });

          ScrollTrigger.create({
            trigger: '#act-escrow',
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.5,
            onUpdate: (self: ScrollTrigger) => applyTapeProgress(self.progress),
          });
        });

        // ACT III — Scroll-Linked Auto-Patching
        ScrollTrigger.create({
          trigger: '#act-workflow',
          start: 'top 65%',
          end: 'bottom 35%',
          onUpdate: (self: ScrollTrigger) => {
            const idx = Math.min(3, Math.floor(self.progress * 4));
            setActiveCircuitIdx((prev) => (prev === idx ? prev : idx));
          },
        });

        // Rising Carbon Vault Slab (border-radius only so fixed pins stay intact)
        if (vaultChamberRef.current) {
          gsap.fromTo(
            vaultChamberRef.current,
            { borderTopLeftRadius: '24px', borderTopRightRadius: '24px' },
            {
              borderTopLeftRadius: '0px',
              borderTopRightRadius: '0px',
              ease: 'none',
              scrollTrigger: {
                trigger: vaultChamberRef.current,
                start: 'top 95%',
                end: 'top 14%',
                scrub: 0.5,
              },
            }
          );

          ScrollTrigger.create({
            trigger: vaultChamberRef.current,
            start: 'top 70px',
            end: 'bottom top',
            onEnter: () => setChromeTheme('dark'),
            onLeaveBack: () => setChromeTheme('light'),
          });
        }

        // Act VIII Acid Lime Finale Chrome Theme Sync
        if (finaleSectionRef.current) {
          ScrollTrigger.create({
            trigger: finaleSectionRef.current,
            start: 'top 70px',
            end: 'bottom 70px',
            onEnter: () => setChromeTheme('light'),
            onLeave: () => setChromeTheme('dark'),
            onEnterBack: () => setChromeTheme('light'),
            onLeaveBack: () => setChromeTheme('dark'),
          });
        }

        // Velocity-Reactive Kinetic Marquee (runs only when visible on screen)
        if (marqueeTopRef.current && bridgeBandRef.current) {
          const topTrack = marqueeTopRef.current;
          let xTop = 0;
          let smoothVel = 0;
          let isBridgeVisible = false;

          ScrollTrigger.create({
            trigger: bridgeBandRef.current,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self: ScrollTrigger) => {
              isBridgeVisible = self.isActive;
            },
          });

          onMarqueeTick = () => {
            if (!isBridgeVisible) return;
            smoothVel += (scrollVelocityRef.current - smoothVel) * 0.08;
            scrollVelocityRef.current *= 0.92;
            const boost = Math.max(-14, Math.min(14, smoothVel * 0.22));

            xTop -= 0.5 + Math.abs(boost) * 0.32;

            const halfTop = topTrack.scrollWidth / 2 || 1200;
            if (xTop <= -halfTop) xTop += halfTop;

            const skew = Math.max(-4, Math.min(4, smoothVel * 0.06));
            topTrack.style.transform = `translate3d(${xTop.toFixed(1)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
          };
          gsap.ticker.add(onMarqueeTick);
        }

        // Section Reveal Headings (excluding pinned/dual-layer acts)
        document.querySelectorAll<HTMLElement>('section h2').forEach((heading) => {
          if (heading.closest('#act-thesis, #act-workflow, #act-escrow')) return;
          gsap.from(heading, {
            y: 26,
            opacity: 0,
            duration: 0.72,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: heading,
              start: 'top 92%',
              once: true,
            },
          });
        });

        // Chapter Index & Navbar Active Section Observers
        CHAPTERS.forEach((chapter) => {
          ScrollTrigger.create({
            trigger: `#${chapter.id}`,
            start: 'top 52%',
            end: 'bottom 52%',
            onEnter: () => {
              setActiveChapterId(chapter.id);
              if (chapter.id !== 'act-hero') setActiveNavId(chapter.id);
            },
            onEnterBack: () => {
              setActiveChapterId(chapter.id);
              if (chapter.id !== 'act-hero') setActiveNavId(chapter.id);
            },
          });
        });

        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, rootRef);

      if (document.fonts && document.fonts.ready) {
        void document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      }

    return () => {
      cancelled = true;
      // fallback timer removed
      ctx?.revert();
      if (loadedGsap) {
        if (onLenisRaf) loadedGsap.ticker.remove(onLenisRaf);
        if (onShakeTick) loadedGsap.ticker.remove(onShakeTick);
        if (onMarqueeTick) loadedGsap.ticker.remove(onMarqueeTick);
      }
      if (lenis) {
        lenis.start();
        lenis.destroy();
        lenisRef.current = null;
      }
      if (cursorRafId) window.cancelAnimationFrame(cursorRafId);
      if (finaleState.rafId) {
        window.cancelAnimationFrame(finaleState.rafId);
        finaleState.rafId = 0;
      }
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('resize', onResize);
      cleanupCursorFns.forEach((fn) => fn());
    };
  }, [applyTapeProgress, getAudio, setBladePercent, updateBladeFromPointer]);

  /* --------------------------------------------------------------------------
     INTERACTIVE EVENT HANDLERS
     -------------------------------------------------------------------------- */

  // Agreement Drawer Escape Key & Lenis Pause
  useEffect(() => {
    if (drawerOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const handleToggleSound = () => {
    const enabled = getAudio().toggle();
    setSoundEnabled(enabled);
    showToast(enabled ? 'Tactile UI audio enabled' : 'Tactile UI audio muted');
  };

  const handleGuildPledge = () => {
    if (guildHours >= 16.0) {
      showToast('Solar Telemetry Guild treasury is fully funded (16.0 ECHO).');
      return;
    }
    if (!lockWalletHours(0.5)) {
      showToast('Credit floor reached (-1.00 ECHO limit).');
      return;
    }
    setGuildHours((prev) => Math.min(16.0, Number((prev + 0.5).toFixed(1))));
    if (!userPledgedGuild) {
      setGuildContributors((prev) => prev + 1);
      setUserPledgedGuild(true);
    }
    getAudio().lock();
    showToast('Pledged +0.50 ECHO into Solar Telemetry Capstone Guild.');
  };

  const handleOpenAgreementRoom = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setProposedHours(listing.hours);
    setCheckedDeliverables(listing.deliverables.map(() => true));
    setSessionNotes('');
    setEscrowReceipt(null);
    setDrawerOpen(true);
    getAudio().click();
  };

  const handleLockEscrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkedCount = checkedDeliverables.filter(Boolean).length;
    if (checkedCount === 0) {
      showToast('Select at least one objective deliverable before locking escrow.');
      return;
    }
    if (!lockWalletHours(proposedHours)) {
      showToast('Exceeds -1.00 ECHO bounded overdraft credit line.');
      return;
    }

    const seed = `${selectedListing.id}-${proposedHours}-${Date.now()}`;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const hex = (h >>> 0).toString(16).padStart(8, '0');
    const nowUtc = new Date().toISOString().split('T')[1].slice(0, 8) + ' UTC';

    setEscrowReceipt({
      summary: `${proposedHours.toFixed(2)} ECHO reserved in atomic vault for "${selectedListing.title}" with ${selectedListing.peer} (${checkedCount} verified deliverables).`,
      hash: `0x${hex.slice(0, 4)}...${hex.slice(4, 8)} (LOCKED)`,
      time: nowUtc,
    });
    getAudio().lock();
    showToast(`Locked ${proposedHours.toFixed(2)} ECHO in atomic escrow with ${selectedListing.peer}.`);
  };

  const handleTearAndSettle = () => {
    if (isTapeTorn) return;
    setIsTapeTorn(true);
    getAudio().tear();
    applyTapeProgress(1);

    const g = gsap;
    if (g) {
      const proxy = { provider: 5.0, vault: 1.5 };
      g.to(proxy, {
        provider: 6.5,
        vault: 0.0,
        duration: 0.72,
        ease: 'power3.out',
        onUpdate: () => {
          if (tapeBalBRef.current)
            tapeBalBRef.current.textContent = `${proxy.provider.toFixed(2)} ECHO`;
          if (tapeVaultHoldRef.current)
            tapeVaultHoldRef.current.textContent = `${proxy.vault.toFixed(2)} ECHO`;
        },
      });
    } else {
      if (tapeBalBRef.current) tapeBalBRef.current.textContent = '6.50 ECHO';
      if (tapeVaultHoldRef.current) tapeVaultHoldRef.current.textContent = '0.00 ECHO';
    }
    showToast('Receipt torn! 1.50 ECHO atomically settled to Maya Chen.');
  };

  const handleResetTape = () => {
    setIsTapeTorn(false);
    getAudio().click();
    if (tapeBalBRef.current) tapeBalBRef.current.textContent = '5.00 ECHO';
    if (tapeVaultHoldRef.current) tapeVaultHoldRef.current.textContent = '1.50 ECHO';
    applyTapeProgress(0);
  };

  const handleJumpTapeStage = (idx: number) => {
    getAudio().flap();
    const frac = idx === 0 ? 0.1 : idx === 1 ? 0.55 : 1.0;
    const pin = tapePinTriggerRef.current;
    if (pin) {
      const targetY = pin.start + (pin.end - pin.start) * frac;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetY, { duration: 0.7 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    } else {
      applyTapeProgress(frac);
    }
  };

  const fireSwissBurst = useCallback(() => {
    const canvas = passCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const colors = ['#021F94', '#D93829', '#F5F2F3', '#6B84FF'];
    const particles = Array.from({ length: 38 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.4 + Math.random() * 5.0;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.1,
        size: 2.5 + Math.random() * 3.0,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.vx *= 0.98;
        p.alpha -= 0.022;
        if (p.alpha > 0) {
          alive = true;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      ctx.globalAlpha = 1;
      if (alive) window.requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, rect.width, rect.height);
    };
    window.requestAnimationFrame(tick);
  }, []);

  const handlePassCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = passCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 15;
    const rotX = (0.5 - py) * 13;
    card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    if (passSpecularRef.current) {
      passSpecularRef.current.style.transform = `translate3d(${((px - 0.5) * 44).toFixed(1)}%, ${((py - 0.5) * 44).toFixed(1)}%, 0)`;
    }
  };

  const handlePassCardLeave = () => {
    if (passCardRef.current) {
      passCardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const displayStudentName = studentName.trim() || 'Founding Student';
  const displayUniversity = university.trim() || 'Accredited .edu Campus';
  const displayCraft = (primaryCraft.trim() || 'Peer Mentorship').toUpperCase();
  const passSerial = useMemo(
    () => computePassSerial(displayStudentName, displayUniversity),
    [displayStudentName, displayUniversity]
  );

  const handleMintPass = (e: React.FormEvent) => {
    e.preventDefault();
    setSealStampKey((k) => k + 1);
    fireSwissBurst();
    getAudio().stamp();
    showToast(`Founding Pass minted (${passSerial}) with +2.00 ECHO grant.`);
  };

  /* --------------------------------------------------------------------------
     ACT VIII — INTERACTIVE LIQUID TURBULENCE DISTORTION ENGINE (60FPS)
     -------------------------------------------------------------------------- */
  const startFinaleDistortionLoop = useCallback(() => {
    const st = finaleStateRef.current;
    if (st.rafId) return;

    const tick = () => {
      const turb = finaleTurbRef.current;
      const disp = finaleDispRef.current;
      const wrap = finaleWordWrapRef.current;

      // Decay velocity spike and smoothly ease displacement scale + magnetic offset
      st.velocityBoost *= 0.88;
      const goalScale = st.hovering ? st.targetScale + st.velocityBoost : 0;
      st.currentScale += (goalScale - st.currentScale) * (st.hovering ? 0.14 : 0.09);

      st.magX += (st.targetMagX - st.magX) * 0.12;
      st.magY += (st.targetMagY - st.magY) * 0.12;

      // Animate organic horizontal liquid wave phase while active
      if (st.currentScale > 0.15) {
        st.phase += 0.055 + st.velocityBoost * 0.004;
        const freqX = (0.011 + Math.sin(st.phase * 0.8) * 0.0035).toFixed(4);
        const freqY = (0.072 + Math.cos(st.phase * 1.15) * 0.016).toFixed(4);
        turb?.setAttribute('baseFrequency', `${freqX} ${freqY}`);
        disp?.setAttribute('scale', st.currentScale.toFixed(2));
      } else {
        disp?.setAttribute('scale', '0');
      }

      if (wrap) {
        wrap.style.transform = `translate3d(${st.magX.toFixed(2)}px, ${st.magY.toFixed(2)}px, 0)`;
      }

      const settled =
        !st.hovering &&
        st.currentScale <= 0.15 &&
        Math.abs(st.magX) < 0.1 &&
        Math.abs(st.magY) < 0.1;

      if (settled) {
        st.currentScale = 0;
        st.magX = 0;
        st.magY = 0;
        disp?.setAttribute('scale', '0');
        if (wrap) wrap.style.transform = 'translate3d(0px, 0px, 0)';
        st.rafId = 0;
        return;
      }

      st.rafId = window.requestAnimationFrame(tick);
    };

    st.rafId = window.requestAnimationFrame(tick);
  }, []);

  const handleFinalePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = finaleStateRef.current;
    st.hovering = true;
    st.targetScale = 26;
    st.velocityBoost = Math.max(st.velocityBoost, 10);
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    startFinaleDistortionLoop();
  };

  const handleFinalePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = finaleStateRef.current;
    const wrap = finaleWordWrapRef.current;
    if (!st.hovering) {
      st.hovering = true;
      st.targetScale = 26;
    }
    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;
    const speed = Math.hypot(dx, dy);
    st.velocityBoost = Math.min(24, st.velocityBoost + speed * 0.32);
    st.lastX = e.clientX;
    st.lastY = e.clientY;

    if (wrap) {
      const rect = wrap.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      st.targetMagX = Math.max(-14, Math.min(14, nx * 12));
      st.targetMagY = Math.max(-10, Math.min(10, ny * 9));
    }
    startFinaleDistortionLoop();
  };

  const handleFinalePointerLeave = () => {
    const st = finaleStateRef.current;
    st.hovering = false;
    st.targetScale = 0;
    st.targetMagX = 0;
    st.targetMagY = 0;
    startFinaleDistortionLoop();
  };

  const handleFinalePulseClick = () => {
    const st = finaleStateRef.current;
    st.velocityBoost = 34;
    st.phase += 1.4;
    getAudio().shutter();
    startFinaleDistortionLoop();
  };

  const activeCircuit = CIRCUITS[activeCircuitIdx] || CIRCUITS[0];
  const tapeStatusLabels = ['ESCROW LOCKED', 'PROOF VERIFIED', 'DUAL SIGNED'];
  const selectedDeliverableCount = checkedDeliverables.filter(Boolean).length;


  return (
    <div ref={rootRef} className="relative font-swiss-sans">
      <Preloader
        preloaderRef={preloaderRef}
        preloaderBarRef={preloaderBarRef}
        preloaderCounterRef={preloaderCounterRef}
      />

      <CustomCursor
        cursorRingRef={cursorRingRef}
        cursorLabelRef={cursorLabelRef}
        cursorDotRef={cursorDotRef}
      />

      <ChapterRail
        chromeTheme={chromeTheme}
        activeChapterId={activeChapterId}
        onJump={(id) => {
          getAudio().click();
          scrollToTarget(`#${id}`);
        }}
      />

      <Navbar
        chromeTheme={chromeTheme}
        activeNavId={activeNavId}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNavClick={(id) => {
          setActiveNavId(id);
          scrollToTarget(`#${id}`);
        }}
        onGetPassClick={() => {
          scrollToTarget('#act-pass');
        }}
        onHomeClick={() => {
          scrollToTarget('#act-hero');
        }}
        navContainerRef={navContainerRef}
        navIndicatorRef={navIndicatorRef}
        onMoveIndicator={moveNavIndicator}
      />

      <main className="relative z-10">
        <HeroDoor
          heroCameraRigRef={heroCameraRigRef}
          heroImpactVignetteRef={heroImpactVignetteRef}
          doorImpactFrameRef={doorImpactFrameRef}
          latchPulseRef={latchPulseRef}
          scrollProgressRef={scrollProgressRef}
          getAudio={getAudio}
          onUnlocked={() => scrollToTarget('#act-thesis')}
        />

        <div id="light-world" className="theme-light swiss-grid-light bg-theme text-ink">
          <Act2Guillotine
            guillotineStageRef={guillotineStageRef}
            guillotineParityRef={guillotineParityRef}
            guillotineBladeRef={guillotineBladeRef}
            guillotinePctRef={guillotinePctRef}
            isDraggingBladeRef={isDraggingBladeRef}
            bladePctRef={bladePctRef}
            animateBladeTo={animateBladeTo}
            updateBladeFromPointer={updateBladeFromPointer}
            getAudio={getAudio}
          />

          <Act3Patchboard
            patchGridRef={patchGridRef}
            patchSvgRef={patchSvgRef}
            activeCircuitIdx={activeCircuitIdx}
            setActiveCircuitIdx={setActiveCircuitIdx}
            guildHours={guildHours}
            guildContributors={guildContributors}
            userPledgedGuild={userPledgedGuild}
            handleGuildPledge={handleGuildPledge}
            getAudio={getAudio}
          />

          <Act4Marketplace
            walletAvailable={walletAvailable}
            walletLocked={walletLocked}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filterShellRef={filterShellRef}
            filterPillRef={filterPillRef}
            moveFilterPill={moveFilterPill}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortMode={sortMode}
            setSortMode={setSortMode}
            marketBoardRef={marketBoardRef}
            boardClock={boardClock}
            triggerFlapScramble={triggerFlapScramble}
            filteredListings={filteredListings}
            expandedRowId={expandedRowId}
            setExpandedRowId={setExpandedRowId}
            handleOpenAgreementRoom={handleOpenAgreementRoom}
            getAudio={getAudio}
          />
        </div>

        <div
          ref={vaultChamberRef}
          id="dark-vault-chamber"
          className="theme-dark swiss-grid-dark vault-chamber-shell"
        >
            <VaultMarqueeBridge
              bridgeBandRef={bridgeBandRef}
              marqueeTopRef={marqueeTopRef}
              marqueeBotRef={marqueeBotRef}
            />

            <Act5AuditTape
              walletAvailable={walletAvailable}
              walletLocked={walletLocked}
              tapePaperRef={tapePaperRef}
              tapeFeedPctRef={tapeFeedPctRef}
              tapeFeedBarRef={tapeFeedBarRef}
              tapeBalBRef={tapeBalBRef}
              tapeVaultHoldRef={tapeVaultHoldRef}
              tapeStage={tapeStage}
              isTapeTorn={isTapeTorn}
              handleTearAndSettle={handleTearAndSettle}
              handleResetTape={handleResetTape}
              handleJumpTapeStage={handleJumpTapeStage}
            />

            <Act6StressTest
              stressIdx={stressIdx}
              setStressIdx={setStressIdx}
              getAudio={getAudio}
            />

            <Act7PassStudio
              studentName={studentName}
              setStudentName={setStudentName}
              university={university}
              setUniversity={setUniversity}
              primaryCraft={primaryCraft}
              setPrimaryCraft={setPrimaryCraft}
              passCardRef={passCardRef}
              passSpecularRef={passSpecularRef}
              passCanvasRef={passCanvasRef}
              handlePassCardMove={handlePassCardMove}
              handlePassCardLeave={handlePassCardLeave}
              handleMintPass={handleMintPass}
              sealStampKey={sealStampKey}
              passSerial={passSerial}
              getAudio={getAudio}
            />

            <Act8EchoFinale
              finaleSectionRef={finaleSectionRef}
              finaleWordWrapRef={finaleWordWrapRef}
              finaleTurbRef={finaleTurbRef}
              finaleDispRef={finaleDispRef}
              handleFinalePointerEnter={handleFinalePointerEnter}
              handleFinalePointerMove={handleFinalePointerMove}
              handleFinalePointerLeave={handleFinalePointerLeave}
              handleFinalePulseClick={handleFinalePulseClick}
              scrollToTarget={scrollToTarget}
              getAudio={getAudio}
            />

            <FooterColophon
              scrollToTarget={scrollToTarget}
              getAudio={getAudio}
            />
          </div>
      </main>

      <AgreementDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedListing={selectedListing}
        proposedHours={proposedHours}
        setProposedHours={setProposedHours}
        checkedDeliverables={checkedDeliverables}
        setCheckedDeliverables={setCheckedDeliverables}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        walletAvailable={walletAvailable}
        walletLocked={walletLocked}
        escrowReceipt={escrowReceipt}
        setEscrowReceipt={setEscrowReceipt}
        handleLockEscrowSubmit={handleLockEscrowSubmit}
        getAudio={getAudio}
      />

      <ToastStack
        toasts={toasts}
        setToasts={setToasts}
        getAudio={getAudio}
      />
    </div>
  );
}
