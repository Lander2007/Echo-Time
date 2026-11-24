'use client';

import React, { useEffect } from 'react';

interface MobileArchitecturalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export function MobileArchitecturalDrawer({
  isOpen,
  onClose,
  title,
  badge,
  children,
}: MobileArchitecturalDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1026]/55 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] flex flex-col bg-[#F5F2F3] border-t-2 border-[#021F94] shadow-2xl et-m-safe-bottom animate-in slide-in-from-bottom duration-200">
        {/* Header Strip */}
        <div className="bg-[#021F94] px-4 py-2.5 text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-[0.14em] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-none bg-[#D93829] shrink-0" />
            <span className="truncate">{title}</span>
            {badge && (
              <span className="px-1.5 py-0.2 bg-[#F5F2F3] text-[#021F94] rounded-[2px] text-[9px] tabular font-bold shrink-0">
                {badge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 border border-[#F5F2F3]/40 hover:bg-[#F5F2F3]/20 text-[#F5F2F3] rounded-[2px] font-mono text-[10px] uppercase font-bold active:opacity-80 transition-opacity shrink-0"
          >
            ESC ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
