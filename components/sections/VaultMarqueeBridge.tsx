import React from 'react';

interface VaultMarqueeBridgeProps {
  bridgeBandRef: React.RefObject<HTMLDivElement | null>;
  marqueeTopRef: React.RefObject<HTMLDivElement | null>;
  marqueeBotRef?: React.RefObject<HTMLDivElement | null>;
}

export const VaultMarqueeBridge: React.FC<VaultMarqueeBridgeProps> = ({
  bridgeBandRef,
  marqueeTopRef,
}) => {
  return (
    <div ref={bridgeBandRef} className="dusk-bridge-band" aria-hidden="true">
      <div
        ref={marqueeTopRef}
        className="kinetic-track font-swiss-sans font-black uppercase text-4xl sm:text-6xl lg:text-7xl tracking-[-0.04em] text-ink"
      >
        {[0, 1].map((dup) => (
          <React.Fragment key={`mt-${dup}`}>
            <span className="mx-6">1.00 HR = 1.00 ECHO</span>
            <span className="mx-6 text-pop">/</span>
            <span className="mx-6 text-accent">ZERO TUITION FEES</span>
            <span className="mx-6 text-pop">/</span>
            <span className="mx-6">ATOMIC CREDIT ESCROW</span>
            <span className="mx-6 text-pop">/</span>
            <span className="mx-6 text-accent">.EDU VERIFIED NETWORK</span>
            <span className="mx-6 text-pop">/</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
