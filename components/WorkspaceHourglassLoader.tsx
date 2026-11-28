'use client';

import React from 'react';
import { HourglassMark } from '@/components/HourglassMark';

interface WorkspaceHourglassLoaderProps {
  visible: boolean;
  label?: string;
}

export function WorkspaceHourglassLoader({
  visible,
  label = 'SYNCING WORKSPACE',
}: WorkspaceHourglassLoaderProps) {
  return (
    <div
      className={`et-ws-loader ${visible ? 'is-visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      {/* Swiss Architectural Center Frame */}
      <div className="relative flex flex-col items-center px-8 py-7 bg-white border border-[#021F94]/30 rounded-[2px]">
        {/* Subtle Corner Registration Ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-[#021F94]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-[#D93829]"
        />

        {/* Rotating Navbar Hourglass Mark */}
        <div className="et-hourglass-loader-spin w-12 h-[62px] flex items-center justify-center">
          <HourglassMark
            width={44}
            height={58}
            strokeWidth={10}
            color="#021F94"
            capFill="#FFFFFF"
          />
        </div>

        {/* 2px Swiss Hairline Sweep */}
        <div className="mt-5 w-36 h-[2px] bg-[#021F94]/15 overflow-hidden">
          <div className="et-loader-bar-fill" />
        </div>

        {/* Clean Monospace Destination Label */}
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B1026]">
          <span className="w-1.5 h-1.5 bg-[#D93829] inline-block" aria-hidden="true" />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}
