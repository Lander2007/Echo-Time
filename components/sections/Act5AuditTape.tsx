import React from 'react';

interface Act5AuditTapeProps {
  walletAvailable: number;
  walletLocked: number;
  tapePaperRef: React.RefObject<HTMLDivElement | null>;
  tapeFeedPctRef: React.RefObject<HTMLSpanElement | null>;
  tapeFeedBarRef: React.RefObject<HTMLDivElement | null>;
  tapeBalBRef: React.RefObject<HTMLDivElement | null>;
  tapeVaultHoldRef: React.RefObject<HTMLSpanElement | null>;
  tapeStage: number;
  isTapeTorn: boolean;
  handleTearAndSettle: () => void;
  handleResetTape: () => void;
  handleJumpTapeStage: (idx: number) => void;
}

export const Act5AuditTape: React.FC<Act5AuditTapeProps> = ({
  walletAvailable,
  walletLocked,
  tapePaperRef,
  tapeFeedPctRef,
  tapeFeedBarRef,
  tapeBalBRef,
  tapeVaultHoldRef,
  tapeStage,
  isTapeTorn,
  handleTearAndSettle,
  handleResetTape,
  handleJumpTapeStage,
}) => {
  const tapeStatusLabels = ['ESCROW LOCKED', 'PROOF VERIFIED', 'DUAL SIGNED'];

  return (
            <section
              id="act-escrow"
              className="relative min-h-screen pt-24 pb-16 lg:py-0 flex items-center"
              style={{ overflowX: 'clip' }}
            >
              <div className="max-w-[1380px] w-full mx-auto px-5 sm:px-10 py-6 lg:pt-20 lg:pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-strong">
                  <div>
                    <div className="flex items-center gap-3 font-swiss-mono text-[11px] uppercase tracking-[0.16em] text-pop font-semibold mb-2">
                      <span className="text-xl font-bold text-accent">05</span>
                      <span>LIVE ESCROW AUDIT TAPE &mdash; ATOMIC THERMAL LEDGER</span>
                    </div>
                    <h2 className="font-swiss-sans font-black uppercase tracking-[-0.045em] leading-[0.92] text-3xl sm:text-5xl text-ink">
                      PRINT THE PROOF.{' '}
                      <span className="text-accent">TEAR TO SETTLE.</span>
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                    {['01 LOCK', '02 PROOF', '03 SIGN-OFF'].map((label, idx) => {
                      const active = tapeStage === idx;
                      return (
                        <button
                          key={label}
                          type="button"
                          data-cursor="FEED"
                          onClick={() => handleJumpTapeStage(idx)}
                          className={`px-3 py-1.5 rounded-sm border font-semibold transition-all ${
                            active
                              ? 'bg-accent text-accent-ink border-accent'
                              : 'border-theme text-ink hover:border-accent'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      data-cursor="RESET"
                      onClick={handleResetTape}
                      className="px-3 py-1.5 rounded-sm border border-theme text-muted hover:text-ink hover:border-strong transition-colors"
                    >
                      Reprint
                    </button>
                  </div>
                </div>

                {/* 3-Column Live Settlement Stage */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Left: Requester Wallet */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="rounded p-5 border border-strong bg-surface">
                      <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                        <span>REQUESTER</span>
                        <span className="text-pop font-semibold">SENDER</span>
                      </div>
                      <div className="mt-2 font-swiss-sans font-extrabold text-xl text-ink">
                        Devon Brooks
                      </div>
                      <div className="font-swiss-mono text-[10.5px] text-muted">
                        Mechanical Eng. &middot; .edu
                      </div>
                      <div className="mt-4 font-swiss-mono font-semibold text-3xl tabular text-ink">
                        3.00 ECHO
                      </div>
                      <div className="mt-1 font-swiss-mono text-[10.5px] text-accent tabular">
                        -1.50 reserved in vault
                      </div>
                    </div>

                    <div className="rounded p-4 border border-theme bg-surface font-swiss-mono text-[10.5px] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted">VAULT HOLD</span>
                        <span
                          ref={tapeVaultHoldRef}
                          className="tabular font-semibold text-accent"
                        >
                          1.50 ECHO
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">PRINT FEED</span>
                        <span ref={tapeFeedPctRef} className="tabular text-ink">
                          25%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-theme rounded-sm overflow-hidden">
                        <div
                          ref={tapeFeedBarRef}
                          className="h-full bg-pop transition-all duration-150"
                          style={{ width: '25%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Center: Swiss Thermal Ledger Printer & Audit Paper */}
                  <div className="lg:col-span-6">
                    <div className="printer-head-chassis p-4 sm:p-5">
                      <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.15em] mb-3">
                        <span className="text-ink font-semibold">
                          ECHO.SYS &middot; THERMAL ESCROW UNIT #05
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-pop font-semibold">
                          <span
                            className={`w-2 h-2 rounded-sm bg-pop ${
                              isTapeTorn ? '' : 'animate-pulse'
                            }`}
                          />
                          {isTapeTorn ? 'SETTLED' : tapeStatusLabels[tapeStage]}
                        </span>
                      </div>
                      <div className="printer-feed-slot rounded-sm" />
                    </div>

                    <div className="audit-tape-viewport -mt-1">
                      <div ref={tapePaperRef} className="audit-tape-paper">
                        <div
                          className="px-5 py-3 border-b border-dashed flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.14em]"
                          style={{
                            borderColor: 'rgba(26, 27, 23, 0.25)',
                            color: '#46493D',
                          }}
                        >
                          <span>CONTRACT #ET-7841</span>
                          <span style={{ color: '#1E3AE0', fontWeight: 600 }}>
                            1.00 HR = 1.00 ECHO
                          </span>
                        </div>

                        {/* Line 01 */}
                        <div
                          className={`tape-entry ${tapeStage >= 0 ? 'is-printed' : ''} ${
                            tapeStage === 0 && !isTapeTorn ? 'is-current' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                            <span className="font-bold" style={{ color: '#1E3AE0' }}>
                              [01] VAULT_LOCKED
                            </span>
                            <span className="tabular" style={{ color: '#46493D' }}>
                              14:00:04 UTC
                            </span>
                          </div>
                          <div className="mt-1 font-swiss-mono text-xs font-semibold">
                            DEVON BROOKS &rarr; VAULT:{' '}
                            <span
                              className="px-1.5 py-0.5 rounded-sm"
                              style={{ backgroundColor: '#C9E54B', color: '#1A1B17' }}
                            >
                              1.50 ECHO
                            </span>
                          </div>
                          <div
                            className="mt-0.5 font-swiss-mono text-[10.5px]"
                            style={{ color: '#46493D' }}
                          >
                            Double-spend guard armed. Zero platform fee deducted.
                          </div>
                        </div>

                        {/* Line 02 */}
                        <div
                          className={`tape-entry ${tapeStage >= 1 ? 'is-printed' : ''} ${
                            tapeStage === 1 && !isTapeTorn ? 'is-current' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                            <span className="font-bold" style={{ color: '#1A1B17' }}>
                              [02] ARTIFACT_VERIFIED
                            </span>
                            <span className="tabular" style={{ color: '#46493D' }}>
                              15:24:19 UTC
                            </span>
                          </div>
                          <div className="mt-1 font-swiss-mono text-xs font-semibold">
                            PR #402 COMMIT{' '}
                            <span className="px-1.5 py-0.5 rounded-sm bg-[#1A1B17] text-[#F1EFE8] text-[10px]">
                              8f2a9c
                            </span>{' '}
                            LOGGED
                          </div>
                          <div
                            className="mt-0.5 font-swiss-mono text-[10.5px]"
                            style={{ color: '#46493D' }}
                          >
                            Deliverables 3/3 checked inside Agreement Room #AG-4089.
                          </div>
                        </div>

                        {/* Line 03 */}
                        <div
                          className={`tape-entry ${tapeStage >= 2 ? 'is-printed' : ''} ${
                            tapeStage === 2 && !isTapeTorn ? 'is-current' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-swiss-mono text-[10px] uppercase tracking-[0.12em]">
                            <span className="font-bold" style={{ color: '#1E3AE0' }}>
                              [03] DUAL_SIGNOFF_READY
                            </span>
                            <span className="tabular" style={{ color: '#46493D' }}>
                              15:31:02 UTC
                            </span>
                          </div>
                          <div className="mt-1 font-swiss-mono text-xs font-semibold">
                            DEVON [SIGNED] + MAYA [SIGNED] &rarr; READY TO RELEASE
                          </div>
                          <div
                            className="mt-0.5 font-swiss-mono text-[10.5px]"
                            style={{ color: '#46493D' }}
                          >
                            Awaiting final tear confirmation to release 1.50 ECHO.
                          </div>
                        </div>

                        {/* Interactive Perforated Tear-Off Settlement Stub */}
                        <div className={`tear-perforation-bar ${isTapeTorn ? 'is-torn' : ''}`}>
                          <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] mb-2.5">
                            <span
                              className="font-bold"
                              style={{ color: isTapeTorn ? '#C9E54B' : '#1E3AE0' }}
                            >
                              &#9986; PERFORATED SETTLEMENT STUB
                            </span>
                            <span className="tabular">
                              {isTapeTorn ? 'SHA-256 · 0xf3a9...77e0' : 'PENDING TEAR'}
                            </span>
                          </div>

                          <button
                            type="button"
                            data-cursor="TEAR"
                            onClick={handleTearAndSettle}
                            className="tear-progress-track w-full flex items-center justify-center font-swiss-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: isTapeTorn ? '#F1EFE8' : '#1A1B17' }}
                          >
                            <span
                              className="tear-progress-fill"
                              style={{ width: isTapeTorn ? '100%' : '0%' }}
                            />
                            <span className="relative z-10">
                              {isTapeTorn
                                ? 'SETTLED · 1.50 ECHO RELEASED TO MAYA CHEN'
                                : '✂ CLICK TO TEAR RECEIPT & RELEASE 1.50 ECHO'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Provider Wallet */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="rounded p-5 border border-strong bg-surface">
                      <div className="flex items-center justify-between font-swiss-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                        <span>PROVIDER</span>
                        <span
                          className={`font-semibold ${isTapeTorn ? 'text-accent' : 'text-muted'}`}
                        >
                          {isTapeTorn ? 'CREDITED' : 'WAITING'}
                        </span>
                      </div>
                      <div className="mt-2 font-swiss-sans font-extrabold text-xl text-ink">
                        Maya Chen
                      </div>
                      <div className="font-swiss-mono text-[10.5px] text-muted">
                        Computer Science &middot; .edu
                      </div>
                      <div
                        ref={tapeBalBRef}
                        className="mt-4 font-swiss-mono font-semibold text-3xl tabular text-ink"
                      >
                        5.00 ECHO
                      </div>
                      <div
                        className={`mt-1 font-swiss-mono text-[10.5px] tabular ${
                          isTapeTorn ? 'text-accent' : 'text-muted'
                        }`}
                      >
                        {isTapeTorn ? '+1.50 ECHO released from vault' : 'Awaiting tear release'}
                      </div>
                    </div>

                    <div className="rounded p-4 border border-theme bg-surface font-swiss-mono text-[10.5px] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted">STREAK COUNTER</span>
                        <span className="tabular text-accent font-semibold">
                          {isTapeTorn ? '12' : '11'} WEEKS
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">FINAL LEDGER HASH</span>
                        <span className="tabular text-pop">
                          {isTapeTorn ? '0xf3a9...77e0' : '0x91e4...a37c'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

  );
};
