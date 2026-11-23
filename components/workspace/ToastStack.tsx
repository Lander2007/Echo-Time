'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';

export function ToastStack() {
  const { toasts } = useWorkspace();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="et-toast pointer-events-auto px-4 py-3 rounded-sm border border-[#C9E54B] bg-[#1A1B17] text-[#F1EFE8] font-et-mono text-[11px] leading-snug shadow-2xl"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
