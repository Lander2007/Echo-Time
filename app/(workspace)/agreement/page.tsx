'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { IconShield, IconClock, IconLock } from '@/components/workspace/Icons';
import { AGREEMENT_STEPS } from '@/lib/seed-workspace';
import { AgreementStage } from '@/types/workspace';

function AgreementContent() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');

  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    activeRoom,
    roomSwitcherOpen,
    setRoomSwitcherOpen,
    chatInput,
    setChatInput,
    editingGoal,
    setEditingGoal,
    handleSendChatMessage,
    handleUpdateRoomTerms,
    handleAdvanceAgreementStage,
    handleCancelExchange,
    pushToast,
  } = useWorkspace();

  useEffect(() => {
    if (roomIdParam && rooms.some((r) => r.id === roomIdParam)) {
      setActiveRoomId(roomIdParam);
    }
  }, [roomIdParam, rooms, setActiveRoomId]);

  if (!activeRoom) return null;

  const currentRoomTotal = activeRoom.durationHrs * activeRoom.creditsPerHr;

  return (
    <div className="et-animate-in space-y-6">
      {/* Top Header */}
      <div className="pb-5 border-b border-[var(--border-strong)] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
            PRIVATE EXCHANGE WORKSPACE
          </div>
          <h1 className="mt-1 font-et-sans font-black tracking-[-0.045em] text-3xl sm:text-5xl">
            Agreement room
          </h1>
          <div className="mt-1.5 font-et-mono text-xs text-[var(--muted)]">
            {activeRoom.title} &middot; {activeRoom.stage} &middot; with {activeRoom.peerName}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="px-3 py-1 rounded-sm font-et-mono text-[10.5px] font-bold uppercase tracking-[0.1em]"
            style={
              activeRoom.stage === 'Completed'
                ? { backgroundColor: '#C9E54B', color: '#1A1B17' }
                : {
                    backgroundColor: 'rgba(107, 132, 255, 0.16)',
                    color: 'var(--cobalt)',
                    border: '1px solid rgba(107, 132, 255, 0.4)',
                  }
            }
          >
            {activeRoom.stage}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] font-et-mono text-[10.5px] text-[var(--ink)]">
            <IconShield className="w-3.5 h-3.5 text-[var(--lime)]" />
            Mutual confirmation
          </span>
        </div>
      </div>

      {/* Switch Exchange Bar */}
      <div className="relative max-w-md">
        <button
          type="button"
          onClick={() => setRoomSwitcherOpen((o) => !o)}
          className="w-full px-4 py-3 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:border-[var(--lime)] flex items-center justify-between font-et-mono text-xs transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <span className="text-[var(--muted)] uppercase">Switch exchange:</span>
            <span className="font-bold text-[var(--ink)]">{activeRoom.title}</span>
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-[var(--bg-subtle)] text-[var(--lime)] text-[10px] tabular font-semibold">
            {rooms.length} rooms ▾
          </span>
        </button>

        {roomSwitcherOpen && (
          <div className="et-animate-in absolute left-0 right-0 top-14 z-30 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl divide-y divide-[var(--border)]">
            {rooms.map((rm) => (
              <button
                key={rm.id}
                type="button"
                onClick={() => {
                  setActiveRoomId(rm.id);
                  setRoomSwitcherOpen(false);
                  setEditingGoal(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[var(--bg-subtle)] transition-colors ${
                  rm.id === activeRoom.id ? 'bg-[var(--bg-subtle)]' : ''
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-[var(--ink)]">{rm.title}</div>
                  <div className="font-et-mono text-[10px] text-[var(--muted)]">
                    {rm.peerName} &middot; v{rm.termsVersion}
                  </div>
                </div>
                <span className="font-et-mono text-[9.5px] uppercase px-2 py-0.5 rounded-sm border border-[var(--border)] text-[var(--cobalt)]">
                  {rm.stage}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Agreement Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left 7 Cols: Conversation Thread */}
        <div className="xl:col-span-7 et-card rounded-sm flex flex-col min-h-[540px]">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                CONVERSATION
              </div>
              <h2 className="font-et-sans font-extrabold text-xl tracking-[-0.02em]">
                Talk it through
              </h2>
            </div>
            <span className="font-et-mono text-[11px] text-[var(--muted)] tabular">
              {activeRoom.messages.length} {activeRoom.messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto max-h-[380px]">
            {activeRoom.messages.map((m) => {
              if (m.sender === 'system') {
                return (
                  <div
                    key={m.id}
                    className="px-4 py-3 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5 text-xs text-[var(--ink)] leading-relaxed">
                      <IconClock className="w-4 h-4 text-[var(--cobalt)] shrink-0 mt-0.5" />
                      <span>{m.text}</span>
                    </div>
                    <span className="font-et-mono text-[10px] text-[var(--muted)] shrink-0 tabular">
                      {m.time}
                    </span>
                  </div>
                );
              }
              const isMe = m.sender === 'me';
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-sm text-sm leading-relaxed"
                    style={
                      isMe
                        ? { backgroundColor: '#C9E54B', color: '#1A1B17' }
                        : {
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--ink)',
                            border: '1px solid var(--border)',
                          }
                    }
                  >
                    <div className="font-et-mono text-[9.5px] uppercase opacity-75 mb-1">
                      {m.author} &middot; {m.time}
                    </div>
                    <div>{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/50 space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => pushToast('Attachment ready (up to 10MB per file).')}
                title="Attach deliverable file"
                className="w-10 h-10 rounded-sm border border-[var(--border-strong)] hover:border-[var(--lime)] flex items-center justify-center font-et-mono text-sm text-[var(--muted)] hover:text-[var(--ink)] shrink-0"
              >
                +
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Discuss details or negotiate..."
                className="flex-1 px-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-sm bg-[#C9E54B] text-[#1A1B17] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all shrink-0"
              >
                Send →
              </button>
            </div>
            <div className="font-et-mono text-[10px] text-[var(--muted)]">
              Up to 10MB per file &middot; 5 files &middot; 25MB per message
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Live Agreement Contract Sheet */}
        <div className="xl:col-span-5 et-card rounded-sm p-6 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cobalt)] font-semibold">
                  LIVE AGREEMENT
                </div>
                <h2 className="mt-0.5 font-et-sans font-black text-2xl tracking-[-0.03em] leading-tight">
                  Make the exchange clear.
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] font-et-mono text-[10px] uppercase text-[var(--lime)] font-semibold">
                {activeRoom.stage}
              </span>
            </div>

            {/* Goal Box (Inline Editable During Negotiation) */}
            <div className="p-4 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)]">
              <div className="flex items-center justify-between font-et-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                <span>GOAL</span>
                {activeRoom.stage === 'Negotiating' && (
                  <button
                    type="button"
                    onClick={() => setEditingGoal(!editingGoal)}
                    className="text-[var(--lime)] hover:underline"
                  >
                    {editingGoal ? 'Done' : 'Edit'}
                  </button>
                )}
              </div>
              {editingGoal ? (
                <input
                  type="text"
                  value={activeRoom.goal}
                  onChange={(e) => handleUpdateRoomTerms({ goal: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm border border-[var(--lime)] bg-[var(--bg-elevated)] text-sm font-semibold text-[var(--ink)] focus:outline-none"
                />
              ) : (
                <div className="font-et-sans font-bold text-base text-[var(--ink)] leading-snug">
                  {activeRoom.goal}
                </div>
              )}
            </div>

            {/* Format / Duration / Total Spec Strip */}
            <div className="grid grid-cols-3 gap-2.5 font-et-mono">
              <div className="p-3 rounded-sm border border-[var(--border)] bg-[var(--bg)]">
                <div className="text-[9px] uppercase text-[var(--muted)]">FORMAT</div>
                <div className="mt-1 text-xs font-bold text-[var(--ink)]">{activeRoom.format}</div>
              </div>
              <div className="p-3 rounded-sm border border-[var(--border)] bg-[var(--bg)]">
                <div className="text-[9px] uppercase text-[var(--muted)]">DURATION</div>
                <div className="mt-1 flex items-center justify-between text-xs font-bold tabular text-[var(--ink)]">
                  <span>{activeRoom.durationHrs} hrs</span>
                  {activeRoom.stage === 'Negotiating' && (
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRoomTerms({
                            durationHrs: Math.max(1, activeRoom.durationHrs - 1),
                          })
                        }
                        className="w-4 h-4 rounded-sm border border-[var(--border-strong)] text-[10px] leading-none"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRoomTerms({
                            durationHrs: Math.min(4, activeRoom.durationHrs + 1),
                          })
                        }
                        className="w-4 h-4 rounded-sm border border-[var(--border-strong)] text-[10px] leading-none"
                      >
                        +
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-sm border border-[var(--border)] bg-[var(--bg)]">
                <div className="text-[9px] uppercase text-[var(--muted)]">TOTAL</div>
                <div className="mt-1 text-xs font-bold tabular text-[var(--lime)]">
                  {currentRoomTotal} credits
                </div>
              </div>
            </div>

            {/* Terms Version */}
            <div className="flex items-center justify-between py-2.5 border-y border-[var(--border)] font-et-mono text-xs">
              <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                <IconLock className="w-3.5 h-3.5 text-[var(--cobalt)]" />
                Terms version
              </span>
              <span className="font-bold text-[var(--cobalt)] tabular">
                v{activeRoom.termsVersion}
              </span>
            </div>

            {/* 4-Stage Escrow Timeline */}
            <ol className="space-y-3">
              {AGREEMENT_STEPS.map((step, idx) => {
                const stageOrder: AgreementStage[] = [
                  'Negotiating',
                  'Confirmed & escrowed',
                  'Delivered',
                  'Completed',
                ];
                const currentIdx = stageOrder.indexOf(activeRoom.stage);
                const isDone = currentIdx > idx || activeRoom.stage === 'Completed';
                const isCurrent = currentIdx === idx && activeRoom.stage !== 'Cancelled';
                return (
                  <li key={step.num} className="flex items-center gap-3 font-et-mono text-xs">
                    <span
                      className="w-7 h-7 rounded-sm flex items-center justify-center text-[10.5px] font-bold tabular border"
                      style={
                        isDone
                          ? {
                              backgroundColor: '#C9E54B',
                              color: '#1A1B17',
                              borderColor: '#C9E54B',
                            }
                          : isCurrent
                          ? {
                              backgroundColor: 'rgba(107, 132, 255, 0.18)',
                              color: 'var(--cobalt)',
                              borderColor: 'var(--cobalt)',
                            }
                          : {
                              backgroundColor: 'var(--bg)',
                              color: 'var(--muted)',
                              borderColor: 'var(--border)',
                            }
                      }
                    >
                      {isDone ? '✓' : step.num}
                    </span>
                    <span
                      className={
                        isCurrent || isDone
                          ? 'font-semibold text-[var(--ink)]'
                          : 'text-[var(--muted)]'
                      }
                    >
                      {step.stage}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            {activeRoom.stage !== 'Completed' && activeRoom.stage !== 'Cancelled' && (
              <button
                type="button"
                onClick={handleAdvanceAgreementStage}
                className="w-full py-3 rounded-sm bg-[#C9E54B] text-[#1A1B17] font-et-mono text-xs font-bold uppercase tracking-[0.12em] hover:brightness-95 transition-all"
              >
                {activeRoom.stage === 'Negotiating'
                  ? 'Confirm terms & lock escrow →'
                  : activeRoom.stage === 'Confirmed & escrowed'
                  ? 'Mark exchange as delivered →'
                  : 'Mutual confirm & settle credits →'}
              </button>
            )}

            <button
              type="button"
              disabled={activeRoom.stage === 'Completed' || activeRoom.stage === 'Cancelled'}
              onClick={handleCancelExchange}
              className="w-full py-2.5 rounded-sm border border-[var(--border-strong)] font-et-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--cobalt)] hover:border-[var(--cobalt)] disabled:opacity-40 transition-colors"
            >
              Cancel exchange
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="p-8 font-et-mono text-sm text-[var(--muted)]">Loading agreement room...</div>}>
      <AgreementContent />
    </Suspense>
  );
}
