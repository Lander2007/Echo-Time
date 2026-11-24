'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { TactileAudioEngine } from '@/lib/audio';
import { HourglassMark } from '@/components/HourglassMark';

interface FooterColophonProps {
  scrollToTarget?: (target: string) => void;
  getAudio?: () => TactileAudioEngine;
}

export const FooterColophon: React.FC<FooterColophonProps> = ({
  scrollToTarget,
  getAudio,
}) => {
  const footerRef = useRef<HTMLElement | null>(null);
  const baseMarkRef = useRef<HTMLDivElement | null>(null);
  const spotMarkRef = useRef<HTMLDivElement | null>(null);

  const handlePointerEnter = () => {
    footerRef.current?.classList.add('is-pointer-active');
  };

  const handlePointerLeave = () => {
    footerRef.current?.classList.remove('is-pointer-active');
    const restTransform = 'translate3d(0, -50%, 0) rotate(-6deg)';
    if (baseMarkRef.current) baseMarkRef.current.style.transform = restTransform;
    if (spotMarkRef.current) spotMarkRef.current.style.transform = restTransform;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = footerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update radial spotlight mask coordinates directly on DOM (zero React re-renders)
    el.style.setProperty('--fx', `${x.toFixed(1)}px`);
    el.style.setProperty('--fy', `${y.toFixed(1)}px`);

    // Subtle synchronized parallax on both watermark layers
    const nx = x / rect.width - 0.5;
    const ny = y / rect.height - 0.5;
    const tx = (-nx * 14).toFixed(1);
    const ty = (-ny * 10).toFixed(1);
    const rot = (-6 + nx * 2.5).toFixed(2);
    const nextTransform = `translate3d(${tx}px, calc(-50% + ${ty}px), 0) rotate(${rot}deg)`;

    if (baseMarkRef.current) baseMarkRef.current.style.transform = nextTransform;
    if (spotMarkRef.current) spotMarkRef.current.style.transform = nextTransform;
  };

  const handleBackToTop = () => {
    getAudio?.().click();
    if (scrollToTarget) {
      scrollToTarget('#act-hero');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('#') && scrollToTarget) {
      e.preventDefault();
      getAudio?.().click();
      scrollToTarget(href);
    }
  };

  return (
    <footer
      ref={footerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      className="et-footer-shell border-t border-[#021F94]/16"
    >
      {/* Layer 1: Subtle Base Architectural Line-Art Hourglass */}
      <div className="et-footer-wm-layer" aria-hidden="true">
        <div
          ref={baseMarkRef}
          className="et-footer-wm-node"
          style={{ opacity: 0.08 }}
        >
          <HourglassMark
            variant="lineart"
            color="#021F94"
            capFill="#F5F2F3"
            strokeWidth={4.8}
            animateStream
          />
        </div>
      </div>

      {/* Layer 2: Cursor Spotlight Sand-Filled Reveal */}
      <div className="et-footer-wm-spotlight" aria-hidden="true">
        <div
          ref={spotMarkRef}
          className="et-footer-wm-node"
          style={{ opacity: 0.28 }}
        >
          <HourglassMark
            variant="filled"
            color="#021F94"
            capFill="#F5F2F3"
            strokeWidth={5.6}
            animateStream
          />
        </div>
      </div>

      {/* Foreground Crisp Footer Content (z-10) */}
      <div className="relative z-10 max-w-[1380px] mx-auto px-6 sm:px-10 pt-14 pb-9">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="et-logo-trigger group inline-flex items-center gap-2.5 focus:outline-none"
            >
              <HourglassMark
                variant="filled"
                color="#021F94"
                capFill="#F5F2F3"
                strokeWidth={10.5}
                width={22}
                height={28}
                flipOnHover
              />
              <span className="inline-flex items-baseline gap-1.5 leading-none">
                <span className="font-black uppercase tracking-[-0.048em] text-base text-[#0B1026]">
                  ECHO
                </span>
                <span className="font-mono font-semibold uppercase tracking-[0.1em] text-xs text-[#021F94]">
                  TIME
                </span>
              </span>
            </Link>

            <p className="text-[13px] text-[#565C73] leading-relaxed max-w-[290px]">
              A place for students to share skills, find support, and grow together.
            </p>

            <p className="font-mono text-[11.5px] text-[#565C73]">
              Student skill-exchange platform.
            </p>
          </div>

          {/* PLATFORM */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#565C73]">
              PLATFORM
            </div>
            <ul className="space-y-2.5 text-[13.5px] font-medium text-[#0B1026]">
              <li>
                <Link
                  href="#act-marketplace"
                  onClick={(e) => handleLinkClick('#act-marketplace', e)}
                  className="hover:text-[#021F94] transition-colors"
                >
                  Explore skills
                </Link>
              </li>
              <li>
                <Link
                  href="#act-architecture"
                  onClick={(e) => handleLinkClick('#act-architecture', e)}
                  className="hover:text-[#021F94] transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/login?mode=signup"
                  className="hover:text-[#021F94] transition-colors"
                >
                  Create an account
                </Link>
              </li>
            </ul>
          </div>

          {/* LEARN */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#565C73]">
              LEARN
            </div>
            <ul className="space-y-2.5 text-[13.5px] font-medium text-[#0B1026]">
              <li>
                <Link
                  href="#act-thesis"
                  onClick={(e) => handleLinkClick('#act-thesis', e)}
                  className="hover:text-[#021F94] transition-colors"
                >
                  Why Echo Time
                </Link>
              </li>
              <li>
                <Link
                  href="#act-marketplace"
                  onClick={(e) => handleLinkClick('#act-marketplace', e)}
                  className="hover:text-[#021F94] transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="#act-faq"
                  onClick={(e) => handleLinkClick('#act-faq', e)}
                  className="hover:text-[#021F94] transition-colors"
                >
                  Questions &amp; answers
                </Link>
              </li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#565C73]">
              RESOURCES
            </div>
            <p className="text-[13px] text-[#565C73] leading-relaxed max-w-[220px]">
              Follow the Echo Time story on social media.
            </p>
          </div>
        </div>

        {/* Hairline Bottom Bar */}
        <div className="pt-6 border-t border-[#021F94]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px] text-[#565C73]">
          <span>&copy; 2026 Echo Time. All rights reserved.</span>
          <button
            type="button"
            onClick={handleBackToTop}
            className="inline-flex items-center gap-1 hover:text-[#021F94] transition-colors self-start sm:self-auto"
          >
            <span>Back to top &uarr;</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
