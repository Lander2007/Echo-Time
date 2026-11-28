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
      <span className="sr-only">{label}</span>

      {/* Pure Centered Large Adaptive Hourglass Mark */}
      <div className="et-hourglass-loader-spin w-24 h-[124px] sm:w-28 sm:h-[145px] flex items-center justify-center">
        <HourglassMark
          width="100%"
          height="100%"
          strokeWidth={8.5}
          color="var(--et-loader-fg)"
          capFill="var(--et-loader-cap)"
        />
      </div>
    </div>
  );
}
