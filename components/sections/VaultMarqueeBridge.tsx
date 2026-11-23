import React from 'react';

interface VaultMarqueeBridgeProps {
  bridgeBandRef: React.RefObject<HTMLDivElement | null>;
  marqueeTopRef: React.RefObject<HTMLDivElement | null>;
  marqueeBotRef: React.RefObject<HTMLDivElement | null>;
}

export const VaultMarqueeBridge: React.FC<VaultMarqueeBridgeProps> = ({
  bridgeBandRef,
  marqueeTopRef,
  marqueeBotRef,
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
              <div
                ref={marqueeBotRef}
                className="mt-3 kinetic-track font-swiss-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-muted"
              >
                {[0, 1].map((dup) => (
                  <React.Fragment key={`mb-${dup}`}>
                    <span className="mx-8">ENTERING ATOMIC ESCROW LEDGER</span>
                    <span className="mx-8 text-pop">+</span>
                    <span className="mx-8">DUAL CRYPTOGRAPHIC SIGN-OFF</span>
                    <span className="mx-8 text-accent">+</span>
                    <span className="mx-8">48-HOUR DISPUTE PROTECTION</span>
                    <span className="mx-8 text-pop">+</span>
                    <span className="mx-8">ZERO-SUM CAMPUS MONETARY STABILITY</span>
                    <span className="mx-8 text-accent">+</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

  );
};
