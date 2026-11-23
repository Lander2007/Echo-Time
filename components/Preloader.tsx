import React from 'react';

interface PreloaderProps {
  preloaderRef: React.RefObject<HTMLDivElement | null>;
  preloaderBarRef: React.RefObject<HTMLDivElement | null>;
  preloaderCounterRef: React.RefObject<HTMLSpanElement | null>;
}

export const Preloader: React.FC<PreloaderProps> = ({
  preloaderRef,
  preloaderBarRef,
  preloaderCounterRef,
}) => {
  return (
      <div ref={preloaderRef} className="et-preloader" aria-hidden="true">
        <div
          className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: '#565C73' }}
        >
          <span>ECHO TIME &middot; SWISS GRID LEDGER</span>
          <span style={{ color: '#021F94' }}>SYS. 1.00 HR = 1.00 ECHO</span>
        </div>
        <div className="my-auto max-w-2xl">
          <div
            className="font-swiss-mono text-[11px] uppercase tracking-[0.18em] mb-3"
            style={{ color: '#021F94' }}
          >
            INITIALIZING CAMPUS TIME BANK
          </div>
          <div
            className="font-swiss-sans font-black tracking-[-0.045em] leading-[0.94] text-4xl sm:text-6xl uppercase"
            style={{ color: '#0B1026' }}
          >
            TRADE HOURS,
            <br />
            <span style={{ color: '#021F94' }}>NOT TUITION.</span>
          </div>
          <div
            className="mt-7 w-full h-[2px] overflow-hidden"
            style={{ backgroundColor: 'rgba(2, 31, 148, 0.16)' }}
          >
            <div ref={preloaderBarRef} className="h-full w-0" style={{ backgroundColor: '#021F94' }} />
          </div>
        </div>
        <div
          className="flex items-end justify-between border-t pt-4"
          style={{ borderColor: 'rgba(2, 31, 148, 0.16)' }}
        >
          <span
            className="font-swiss-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: '#565C73' }}
          >
            ATOMIC ESCROW PROTOCOL &middot; .EDU VERIFIED
          </span>
          <span
            ref={preloaderCounterRef}
            className="font-swiss-mono font-semibold text-4xl sm:text-5xl tabular leading-none"
            style={{ color: '#021F94' }}
          >
            00
          </span>
        </div>
      </div>

  );
};
