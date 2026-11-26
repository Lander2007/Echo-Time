import React from 'react';
import { MarketplaceListing, EscrowReceipt } from '@/types/echo';
import { TactileAudioEngine } from '@/lib/audio';
import { CANONICAL_CONTENT } from '@/data/content';
import { IconArrowRight, IconClose } from '@/components/workspace/Icons';

interface AgreementDrawerProps {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedListing: MarketplaceListing;
  proposedHours: number;
  setProposedHours: React.Dispatch<React.SetStateAction<number>>;
  checkedDeliverables: boolean[];
  setCheckedDeliverables: React.Dispatch<React.SetStateAction<boolean[]>>;
  sessionNotes: string;
  setSessionNotes: React.Dispatch<React.SetStateAction<string>>;
  walletAvailable: number;
  walletLocked: number;
  escrowReceipt: EscrowReceipt | null;
  setEscrowReceipt: React.Dispatch<React.SetStateAction<EscrowReceipt | null>>;
  handleLockEscrowSubmit: (e: React.FormEvent) => void;
  getAudio: () => TactileAudioEngine;
}

export const AgreementDrawer: React.FC<AgreementDrawerProps> = ({
  drawerOpen,
  setDrawerOpen,
  selectedListing,
  proposedHours,
  setProposedHours,
  checkedDeliverables,
  setCheckedDeliverables,
  sessionNotes,
  setSessionNotes,
  walletAvailable,
  walletLocked,
  escrowReceipt,
  setEscrowReceipt,
  handleLockEscrowSubmit,
  getAudio,
}) => {
  const selectedDeliverableCount = checkedDeliverables.filter(Boolean).length;

  return (
      <div
        className={`drawer-backdrop fixed inset-0 flex justify-end ${drawerOpen ? 'open' : ''}`}
        style={{
          zIndex: 85,
          backgroundColor: 'rgba(11, 16, 38, 0.72)',
          backdropFilter: 'blur(5px)',
        }}
        aria-hidden={!drawerOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawerOpen(false);
        }}
      >
        <div
          className="drawer-panel w-full max-w-md h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l-4"
          style={{
            backgroundColor: '#F5F2F3',
            color: '#0B1026',
            borderColor: '#021F94',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <div>
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between gap-2 pb-4 border-b"
              style={{ borderColor: 'rgba(2, 31, 148, 0.16)' }}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="font-swiss-mono text-[10px] uppercase tracking-[0.16em] font-bold"
                  style={{ color: '#021F94' }}
                >
                  {CANONICAL_CONTENT.discover.agreementRoom.title}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-sm font-swiss-mono text-[10px] font-semibold tabular border"
                  style={{
                    backgroundColor: '#021F94',
                    borderColor: '#021F94',
                    color: '#F5F2F3',
                  }}
                >
                  {CANONICAL_CONTENT.discover.wallet.labels[0]}: {walletAvailable.toFixed(2)} ECHO
                </span>
              </div>
              <button
                type="button"
                data-cursor="CLOSE"
                aria-label="Close Agreement Room"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-sm border flex items-center justify-center hover:bg-[#021F94] hover:text-[#F5F2F3] transition-colors shrink-0"
                style={{ borderColor: '#021F94' }}
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Peer Summary */}
            <div
              className="mt-5 p-4 rounded border"
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(2, 31, 148, 0.18)' }}
            >
              <div
                className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: '#565C73' }}
              >
                <span>{selectedListing.category.toUpperCase()}</span>
                <span className="tabular font-semibold" style={{ color: '#021F94' }}>
                  {selectedListing.rating.toFixed(2)} VERIFIED
                </span>
              </div>
              <h3
                id="drawer-title"
                className="mt-1.5 font-swiss-sans font-extrabold text-xl tracking-tight leading-snug"
              >
                {selectedListing.title}
              </h3>
              <div
                className="mt-1 font-swiss-mono text-xs"
                style={{ color: '#565C73' }}
              >
                {selectedListing.peer} &middot; {selectedListing.meta}
              </div>
            </div>

            {/* Wallet Context */}
            <div className="mt-4 grid grid-cols-2 gap-3 font-swiss-mono text-xs">
              <div
                className="p-3 rounded border"
                style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(2, 31, 148, 0.16)' }}
              >
                <div className="text-[9px] uppercase" style={{ color: '#565C73' }}>
                  YOUR BALANCE
                </div>
                <div className="mt-1 font-semibold tabular">{walletAvailable.toFixed(2)} ECHO</div>
              </div>
              <div
                className="p-3 rounded border"
                style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(2, 31, 148, 0.16)' }}
              >
                <div className="text-[9px] uppercase" style={{ color: '#565C73' }}>
                  PARITY RATE
                </div>
                <div className="mt-1 font-semibold tabular" style={{ color: '#021F94' }}>
                  1.00 HR = 1.00 ECHO
                </div>
              </div>
            </div>

            {/* Agreement Form or Locked Receipt */}
            {!escrowReceipt ? (
              <form onSubmit={handleLockEscrowSubmit} className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="drawer-hours-range"
                      className="font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: '#565C73' }}
                    >
                      PROPOSED HOURS CAP
                    </label>
                    <span
                      className="font-swiss-mono font-bold text-lg tabular"
                      style={{ color: '#021F94' }}
                    >
                      {proposedHours.toFixed(2)} ECHO
                    </span>
                  </div>
                  <input
                    id="drawer-hours-range"
                    type="range"
                    min={0.5}
                    max={4.0}
                    step={0.5}
                    value={proposedHours}
                    onChange={(e) => setProposedHours(parseFloat(e.target.value))}
                    className="echo-range"
                  />
                  <div
                    className="flex justify-between font-swiss-mono text-[10px] mt-1 tabular"
                    style={{ color: '#565C73' }}
                  >
                    <span>0.5h</span>
                    <span>2.0h</span>
                    <span>4.0h</span>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded border font-swiss-mono text-[11px] flex items-center justify-between"
                  style={{ backgroundColor: '#021F94', borderColor: '#021F94', color: '#F5F2F3' }}
                >
                  <span className="tabular font-semibold">
                    Vault Lock: {proposedHours.toFixed(2)} ECHO
                  </span>
                  <span style={{ color: '#F5F2F3', fontWeight: 700 }}>Platform Fee: 0.00</span>
                </div>

                {/* Deliverable Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="block font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: '#565C73' }}
                    >
                      DELIVERABLE CHECKLIST
                    </span>
                    <span
                      className="font-swiss-mono text-[10px] tabular font-bold"
                      style={{ color: '#021F94' }}
                    >
                      {selectedDeliverableCount} / {selectedListing.deliverables.length} SELECTED
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedListing.deliverables.map((text, idx) => (
                      <label
                        key={text}
                        className="flex items-start gap-2.5 p-2.5 rounded border text-xs leading-snug cursor-pointer"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: 'rgba(2, 31, 148, 0.16)',
                          color: '#0B1026',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedDeliverables[idx])}
                          onChange={(e) => {
                            const next = [...checkedDeliverables];
                            next[idx] = e.target.checked;
                            setCheckedDeliverables(next);
                          }}
                          className="mt-0.5 accent-[#021F94]"
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="drawer-notes"
                    className="block font-swiss-mono text-[10px] uppercase tracking-[0.14em] mb-1.5"
                    style={{ color: '#565C73' }}
                  >
                    SESSION BRIEF &amp; DEADLINE
                  </label>
                  <textarea
                    id="drawer-notes"
                    rows={2}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="e.g., Live screen-share session before Thursday 18:00..."
                    className="w-full px-3.5 py-2.5 rounded border text-sm resize-none focus:outline-none focus:border-[#021F94] placeholder:text-[#565C73]/60"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'rgba(2, 31, 148, 0.18)',
                      color: '#0B1026',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  data-cursor="LOCK"
                  className="group w-full py-3.5 rounded font-swiss-mono text-xs font-semibold uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 transition-transform active:scale-95"
                  style={{
                    backgroundColor: '#021F94',
                    color: '#F5F2F3',
                  }}
                >
                  <span>Lock Atomic Escrow</span>
                  <IconArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </form>
            ) : (
              <div
                className="mt-6 p-6 rounded border"
                style={{ backgroundColor: '#061354', color: '#F5F2F3', borderColor: '#021F94' }}
              >
                <div
                  className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: '#B9C8FF' }}
                >
                  <span>ATOMIC ESCROW RECEIPT</span>
                  <span style={{ color: '#D93829' }}>ESCROW_LOCKED</span>
                </div>
                <h4
                  className="mt-3 font-swiss-sans font-black uppercase tracking-tight text-2xl"
                  style={{ color: '#F5F2F3' }}
                >
                  HOURS LOCKED IN VAULT
                </h4>
                <p
                  className="mt-2 font-swiss-mono text-xs leading-relaxed"
                  style={{ color: '#B9C8FF' }}
                >
                  {escrowReceipt.summary}
                </p>

                <div
                  className="mt-4 pt-3 border-t space-y-2 font-swiss-mono text-[10.5px] tabular"
                  style={{ borderColor: 'rgba(245, 242, 243, 0.16)', color: '#F5F2F3' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: '#B9C8FF' }}>HEX HASH</span>
                    <span style={{ color: '#D93829' }}>{escrowReceipt.hash}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: '#B9C8FF' }}>TIMESTAMP</span>
                    <span>{escrowReceipt.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-5 w-full py-3 rounded border font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: '#021F94', color: '#F5F2F3', backgroundColor: '#021F94' }}
                >
                  Return to Marketplace
                </button>
              </div>
            )}
          </div>

          <div
            className="pt-4 mt-5 border-t flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ borderColor: 'rgba(2, 31, 148, 0.16)', color: '#565C73' }}
          >
            <span>48H DISPUTE PROTECTION</span>
            <span>0% PLATFORM FEE</span>
          </div>
        </div>
      </div>

  );
};
