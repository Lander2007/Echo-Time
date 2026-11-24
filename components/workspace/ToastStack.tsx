'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';

export function ToastStack() {
  const { toasts } = useWorkspace();

  if (!toasts.length) return null;

  return (
    <>
      {/* Mobile Toasts (Positioned below 52px top bar, sharp vermilion border) */}
      <div className="fixed top-[60px] left-3 right-3 z-[60] flex flex-col gap-2 pointer-events-none lg:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto px-4 py-3 rounded-[2px] border border-[#021F94]/30 border-l-4 border-l-[#D93829] bg-[#0B1026] text-[#F5F2F3] font-mono text-[11px] font-semibold leading-snug shadow-xl uppercase tracking-wider"
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Desktop Toasts (Strictly preserved at bottom-5 right-5) */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="et-toast pointer-events-auto px-4 py-3 rounded-sm border border-[var(--lime)] bg-[var(--bg-elevated)] text-[var(--ink)] font-et-mono text-[11px] leading-snug shadow-2xl"
          >
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
