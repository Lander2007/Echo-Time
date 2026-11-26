'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import {
  IconShield,
  IconClock,
  IconLock,
  IconPaperclip,
  IconSend,
  IconCheck,
  IconClose,
  IconArrowRight,
} from '@/components/workspace/Icons';
import { MobileArchitecturalDrawer } from '@/components/mobile/MobileArchitecturalDrawer';
import { AGREEMENT_STEPS } from '@/lib/seed-workspace';
import { AgreementStage } from '@/types/workspace';

function AgreementContent() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement>(null);

  const [mobileTab, setMobileTab] = useState<'chat' | 'contract'>('chat');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    activeRoom,
    roomSwitcherOpen,
    setRoomSwitcherOpen,
    chatInput,
    setChatInput,
    chatAttachment,
    setChatAttachment,
    editingGoal,
    setEditingGoal,
    handleSendChatMessage,
    handleUpdateRoomTerms,
    handleAdvanceAgreementStage,
    handleCancelExchange,
    pushToast,
  } = useWorkspace();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      pushToast('File is too large (maximum 8MB).');
      e.target.value = '';
      return;
    }

    const type: 'image' | 'audio' | 'file' = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('audio/')
      ? 'audio'
      : 'file';

    const size =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setChatAttachment({
        name: file.name,
        url,
        type,
        size,
      });
      pushToast(`Attached ${file.name} (${size})`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (roomIdParam && rooms.some((r) => r.id === roomIdParam)) {
      setActiveRoomId(roomIdParam);
    }
  }, [roomIdParam, rooms, setActiveRoomId]);

  useEffect(() => {
    if (mobileTab === 'chat') {
      mobileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoom?.messages?.length, mobileTab]);

  if (!activeRoom) return null;

  const currentRoomTotal = activeRoom.durationHrs * activeRoom.creditsPerHr;
  const isPendingAction =
    activeRoom.stage === 'Negotiating' || activeRoom.stage === 'Confirmed & escrowed';

  return (
    <div className="et-animate-in">
      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px THUMB-SWITCHED CHAT & CONTRACT)
          ==================================================================== */}
      <div className="lg:hidden space-y-3 select-none -mx-3.5 -mt-3">
        {/* Sticky Room Console Header */}
        <div className="sticky top-[52px] z-20 bg-[#061354] border-b-[1.5px] border-[#021F94] px-3.5 py-2.5 text-[#F5F2F3] shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#B9C8FF]">
                <span className="w-1.5 h-1.5 rounded-none bg-[#D93829] shrink-0" />
                <span className="truncate">{activeRoom.stage}</span>
                <span>·</span>
                <span className="tabular font-bold">v{activeRoom.termsVersion}</span>
              </div>
              <div className="font-sans font-bold text-sm text-white truncate mt-0.5">
                {activeRoom.title} <span className="font-normal text-[#B9C8FF]">({activeRoom.peerName})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRoomSwitcherOpen(true)}
              className="px-2.5 py-1 bg-[#021F94] border border-[#F5F2F3]/30 text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px] shrink-0 active:opacity-80"
            >
              SWITCH ({rooms.length}) ▾
            </button>
          </div>

          {/* Flush 2-Column Segmented Tab Switch */}
          <div className="grid grid-cols-2 divide-x divide-[#021F94]/25 bg-white border border-[#021F94] rounded-[2px] mt-2.5 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`py-2 text-center font-mono text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                mobileTab === 'chat'
                  ? 'bg-[#021F94] text-[#F5F2F3]'
                  : 'bg-white text-[#565C73] hover:text-[#0B1026]'
              }`}
            >
              01 · CHAT ({activeRoom.messages.length})
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('contract')}
              className={`py-2 text-center font-mono text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === 'contract'
                  ? 'bg-[#021F94] text-[#F5F2F3]'
                  : 'bg-white text-[#565C73] hover:text-[#0B1026]'
              }`}
            >
              <span>02 · CONTRACT</span>
              {isPendingAction && (
                <span className="w-1.5 h-1.5 rounded-none bg-[#D93829]" />
              )}
            </button>
          </div>
        </div>

        {/* Tab 01 · CHAT View */}
        {mobileTab === 'chat' && (
          <div className="flex flex-col px-3.5" style={{ minHeight: 'calc(100dvh - 210px)' }}>
            {/* Scrollable Messages Stream */}
            <div className="flex-1 space-y-3 pb-3 overflow-y-auto">
              {activeRoom.messages.map((m) => {
                if (m.sender === 'system') {
                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-white border border-[#021F94]/25 border-l-4 border-l-[#D93829] rounded-[2px] space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] text-[#D93829] font-bold uppercase tracking-wider">
                        <span>AUDIT LOG · PROTOCOL RECORD</span>
                        <span className="text-[#565C73] tabular">{m.time}</span>
                      </div>
                      <p className="text-xs text-[#0B1026] leading-relaxed font-sans">{m.text}</p>
                    </div>
                  );
                }

                const isMe = m.sender === 'me';
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[88%] p-3 rounded-[2px] text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#021F94] text-[#F5F2F3]'
                          : 'bg-white border border-[#021F94]/35 text-[#0B1026]'
                      }`}
                    >
                      <div
                        className={`font-mono text-[9px] uppercase tracking-wider mb-1 font-semibold ${
                          isMe ? 'text-[#B9C8FF]' : 'text-[#565C73]'
                        }`}
                      >
                        {m.author} · {m.time}
                      </div>

                      {m.text && <div className="break-words font-sans text-[13px]">{m.text}</div>}

                      {/* Attachments */}
                      {m.attachment && (
                        <div className="mt-2 pt-2 border-t border-current/15 space-y-1.5">
                          {m.attachment.type === 'image' && (
                            <div className="rounded-[2px] overflow-hidden border border-current/20">
                              <img
                                src={m.attachment.url}
                                alt={m.attachment.name}
                                onClick={() => setLightboxImg(m.attachment?.url || null)}
                                className="max-h-48 w-auto object-contain bg-black/10 cursor-pointer active:opacity-90"
                              />
                              <div className="px-2 py-1 text-[9.5px] font-mono flex items-center justify-between opacity-85">
                                <span className="truncate">{m.attachment.name}</span>
                                {m.attachment.size && <span className="tabular">{m.attachment.size}</span>}
                              </div>
                            </div>
                          )}

                          {m.attachment.type === 'audio' && (
                            <div className="p-2 bg-black/10 rounded-[2px] space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                <span>🎵</span>
                                <span className="truncate font-bold">{m.attachment.name}</span>
                                {m.attachment.size && (
                                  <span className="opacity-75 tabular ml-auto">{m.attachment.size}</span>
                                )}
                              </div>
                              <audio controls src={m.attachment.url} className="w-full h-8 mt-1" />
                            </div>
                          )}

                          {m.attachment.type === 'file' && (
                            <a
                              href={m.attachment.url}
                              download={m.attachment.name}
                              className="flex items-center gap-2 p-2 bg-black/10 rounded-[2px] font-mono text-[10.5px] hover:underline"
                            >
                              <span>📄</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold truncate">{m.attachment.name}</div>
                                {m.attachment.size && (
                                  <div className="opacity-75 text-[9.5px] tabular">{m.attachment.size}</div>
                                )}
                              </div>
                              <span className="font-bold uppercase text-[9.5px]">SAVE ↓</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={mobileMessagesEndRef} />
            </div>

            {/* Docked Message Composer */}
            <form
              onSubmit={handleSendChatMessage}
              className="sticky bottom-[58px] z-20 -mx-3.5 px-3.5 py-2.5 bg-[#F5F2F3] border-t-[1.5px] border-[#021F94] space-y-2 shadow-lg"
            >
              {/* Attachment Preview Banner */}
              {chatAttachment && (
                <div className="p-2 bg-white border border-[#021F94]/30 rounded-[2px] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#021F94] shrink-0">
                      <IconPaperclip className="w-3.5 h-3.5" />
                      <span>ATTACHED:</span>
                    </span>
                    <span className="font-sans font-bold truncate text-[#0B1026]">{chatAttachment.name}</span>
                    <span className="font-mono text-[10px] text-[#565C73] tabular">({chatAttachment.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatAttachment(null)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-[#D93829] font-bold uppercase hover:underline shrink-0"
                  >
                    <span>REMOVE</span>
                    <IconClose className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  ref={mobileFileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,.pdf,.zip,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mobileFileInputRef.current?.click()}
                  title="Attach file (<= 8MB)"
                  aria-label="Attach file"
                  className="w-10 h-10 rounded-[2px] border border-[#021F94]/40 bg-white flex items-center justify-center text-[#021F94] shrink-0 active:opacity-75"
                >
                  <IconPaperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={chatAttachment ? `Caption for ${chatAttachment.name}...` : 'Type message or terms...'}
                  className="flex-1 px-3 py-2 rounded-[2px] border border-[#021F94]/40 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#021F94] text-[#F5F2F3] font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] shrink-0 active:opacity-85"
                >
                  SEND
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 02 · CONTRACT View (Thermal Escrow Sheet) */}
        {mobileTab === 'contract' && (
          <div className="px-3.5 space-y-3.5">
            <div className="et-m-box p-4 space-y-4">
              {/* Solid Blue Top Printer Bar */}
              <div className="bg-[#021F94] -mx-4 -mt-4 px-4 py-2 text-[#F5F2F3] font-mono text-[10px] font-bold uppercase tracking-[0.14em] flex items-center justify-between">
                <span>ESCROW CONTRACT · TERMS v{activeRoom.termsVersion}</span>
                <span className="text-[#D93829] font-black">{activeRoom.stage}</span>
              </div>

              {/* Deliverable Goal Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[9.5px] uppercase text-[#565C73] font-bold tracking-wider">
                  <span>EXCHANGE GOAL & SCOPE</span>
                  {activeRoom.stage === 'Negotiating' && (
                    <button
                      type="button"
                      onClick={() => setEditingGoal(!editingGoal)}
                      className="text-[#021F94] font-bold underline"
                    >
                      {editingGoal ? 'SAVE' : 'EDIT'}
                    </button>
                  )}
                </div>
                {editingGoal ? (
                  <input
                    type="text"
                    value={activeRoom.goal}
                    onChange={(e) => handleUpdateRoomTerms({ goal: e.target.value })}
                    className="w-full p-2 border border-[#021F94] rounded-[2px] bg-white text-sm font-bold text-[#0B1026] focus:outline-none"
                  />
                ) : (
                  <p className="font-sans font-bold text-sm text-[#0B1026] leading-snug">
                    {activeRoom.goal}
                  </p>
                )}
              </div>

              {/* 3-Column Exposed Spec Grid */}
              <div className="grid grid-cols-3 divide-x divide-[#021F94]/20 border border-[#021F94]/30 bg-[#F5F2F3] rounded-[2px] text-center p-2 font-mono">
                <div>
                  <div className="text-[9px] text-[#565C73] uppercase">FORMAT</div>
                  <div className="text-xs font-bold text-[#0B1026] mt-0.5">{activeRoom.format}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#565C73] uppercase">DURATION</div>
                  <div className="text-xs font-bold text-[#0B1026] mt-0.5 flex items-center justify-center gap-1">
                    <span>{activeRoom.durationHrs}H</span>
                    {activeRoom.stage === 'Negotiating' && (
                      <span className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateRoomTerms({
                              durationHrs: Math.max(1, activeRoom.durationHrs - 1),
                            })
                          }
                          className="w-3.5 h-3.5 rounded-[2px] border border-[#021F94] text-[9px] leading-none"
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
                          className="w-3.5 h-3.5 rounded-[2px] border border-[#021F94] text-[9px] leading-none"
                        >
                          +
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#565C73] uppercase">TOTAL</div>
                  <div className="text-xs font-black text-[#021F94] mt-0.5 tabular">
                    {currentRoomTotal} ECHO
                  </div>
                </div>
              </div>

              {/* Vertical 4-Stage Audit Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#021F94]/18">
                <div className="font-mono text-[9.5px] uppercase font-bold text-[#565C73] tracking-wider mb-2">
                  PROTOCOL ESCROW STAGES
                </div>
                <div className="space-y-2 font-mono text-xs">
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
                      <div
                        key={step.num}
                        className="flex items-center gap-2.5 p-2 bg-[#F5F2F3]/60 rounded-[2px] border border-[#021F94]/15"
                      >
                        <span
                          className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-mono text-[10px] font-bold tabular ${
                            isDone
                              ? 'bg-[#021F94] text-[#F5F2F3]'
                              : isCurrent
                              ? 'bg-[#D93829] text-white'
                              : 'bg-white border border-[#021F94]/30 text-[#565C73]'
                          }`}
                        >
                          {isDone ? <IconCheck className="w-3.5 h-3.5" /> : step.num}
                        </span>
                        <span
                          className={`font-mono text-[11px] uppercase ${
                            isCurrent
                              ? 'font-bold text-[#0B1026]'
                              : isDone
                              ? 'text-[#021F94]'
                              : 'text-[#565C73]'
                          }`}
                        >
                          {step.stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Perforated Execution Footer */}
              <div className="et-m-perforated bg-[#F5F2F3] -mx-4 -mb-4 p-4 space-y-2">
                {activeRoom.stage !== 'Completed' && activeRoom.stage !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={handleAdvanceAgreementStage}
                    className="group w-full py-3 bg-[#021F94] text-[#F5F2F3] font-mono text-xs font-bold uppercase tracking-wider rounded-[2px] inline-flex items-center justify-center gap-2 active:opacity-85"
                  >
                    <span>
                      {activeRoom.stage === 'Negotiating'
                        ? `LOCK ${currentRoomTotal} ECHO IN ESCROW`
                        : activeRoom.stage === 'Confirmed & escrowed'
                        ? 'MARK DELIVERABLE READY'
                        : 'SIGN OFF & SETTLE CREDITS'}
                    </span>
                    <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                )}

                <button
                  type="button"
                  disabled={activeRoom.stage === 'Completed' || activeRoom.stage === 'Cancelled'}
                  onClick={handleCancelExchange}
                  className="w-full py-2.5 border border-[#D93829] text-[#D93829] font-mono text-xs font-bold uppercase tracking-wider rounded-[2px] text-center disabled:opacity-30 active:opacity-85"
                >
                  CANCEL & REFUND ESCROW
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Switcher Architectural Drawer */}
        <MobileArchitecturalDrawer
          isOpen={roomSwitcherOpen}
          onClose={() => setRoomSwitcherOpen(false)}
          title={`AGREEMENT ROOMS (${rooms.length})`}
        >
          <div className="divide-y divide-[#021F94]/18 border border-[#021F94]/30 bg-white rounded-[2px]">
            {rooms.map((rm) => (
              <button
                key={rm.id}
                type="button"
                onClick={() => {
                  setActiveRoomId(rm.id);
                  setRoomSwitcherOpen(false);
                  setEditingGoal(false);
                }}
                className={`w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors ${
                  rm.id === activeRoom.id ? 'bg-[#F5F2F3]' : ''
                }`}
              >
                <div>
                  <div className="font-sans font-bold text-sm text-[#0B1026]">{rm.title}</div>
                  <div className="font-mono text-[10px] text-[#565C73] mt-0.5">
                    {rm.peerName} · v{rm.termsVersion}
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 bg-[#021F94] text-[#F5F2F3] rounded-[2px]">
                  {rm.stage}
                </span>
              </button>
            ))}
          </div>
        </MobileArchitecturalDrawer>

        {/* Image Lightbox Modal */}
        {lightboxImg && (
          <div
            className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col items-center justify-center"
            onClick={() => setLightboxImg(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white font-mono text-sm px-3 py-1 border border-white/40 rounded-[2px]"
            >
              ESC ×
            </button>
            <img
              src={lightboxImg}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-full object-contain rounded"
            />
          </div>
        )}
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block space-y-6">
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
                  ? { backgroundColor: 'var(--lime)', color: 'var(--lime-ink)' }
                  : activeRoom.stage === 'Cancelled'
                  ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--muted)' }
                  : {
                      backgroundColor: 'rgba(107, 132, 255, 0.16)',
                      color: 'var(--cobalt)',
                      border: '1px solid rgba(107, 132, 255, 0.35)',
                    }
              }
            >
              {activeRoom.stage}
            </span>

            <button
              type="button"
              onClick={() => setRoomSwitcherOpen(!roomSwitcherOpen)}
              className="px-3.5 py-1.5 rounded-sm border border-[var(--border-strong)] hover:border-[var(--lime)] font-et-mono text-xs font-semibold uppercase tracking-[0.08em] bg-[var(--bg-elevated)] text-[var(--ink)] transition-colors"
            >
              Switch room ({rooms.length}) &darr;
            </button>
          </div>
        </div>

        {/* Room Switcher Dropdown */}
        {roomSwitcherOpen && (
          <div className="et-animate-in p-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl divide-y divide-[var(--border)] max-w-md">
            <div className="px-3 py-2 font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Your exchange rooms
            </div>
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
                          ? { backgroundColor: 'var(--lime)', color: 'var(--lime-ink)' }
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
                      {m.text && <div className="break-words">{m.text}</div>}

                      {/* Attached Image / Audio / File Render */}
                      {m.attachment && (
                        <div className="mt-2.5 pt-2 border-t border-black/15 dark:border-white/15 space-y-1.5">
                          {m.attachment.type === 'image' && (
                            <div className="rounded overflow-hidden border border-black/15 dark:border-white/15 max-w-sm">
                              <a
                                href={m.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Click to view full image"
                              >
                                <img
                                  src={m.attachment.url}
                                  alt={m.attachment.name}
                                  className="max-h-60 w-auto object-contain bg-black/5 hover:opacity-95 transition-opacity cursor-pointer"
                                />
                              </a>
                              <div className="px-2 py-1 text-[10px] font-et-mono opacity-80 flex items-center justify-between">
                                <span className="truncate">{m.attachment.name}</span>
                                {m.attachment.size && (
                                  <span className="tabular shrink-0 ml-2">{m.attachment.size}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {m.attachment.type === 'audio' && (
                            <div className="rounded-sm p-2 bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 space-y-1 min-w-[240px]">
                              <div className="flex items-center gap-2 text-xs font-et-mono">
                                <span>🎵</span>
                                <span className="font-semibold truncate max-w-[180px]">{m.attachment.name}</span>
                                {m.attachment.size && (
                                  <span className="opacity-75 text-[10px] ml-auto tabular">
                                    {m.attachment.size}
                                  </span>
                                )}
                              </div>
                              <audio controls src={m.attachment.url} className="w-full h-8 mt-1" />
                            </div>
                          )}

                          {m.attachment.type === 'file' && (
                            <a
                              href={m.attachment.url}
                              download={m.attachment.name}
                              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-sm border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-et-mono transition-colors"
                            >
                              <span className="text-base">📄</span>
                              <div className="flex flex-col text-left">
                                <span className="font-semibold truncate max-w-[180px]">{m.attachment.name}</span>
                                {m.attachment.size && (
                                  <span className="text-[10px] opacity-75 tabular">{m.attachment.size}</span>
                                )}
                              </div>
                              <span className="ml-2 text-xs font-bold uppercase underline">Save ↓</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Composer */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/50 space-y-2.5"
            >
              {/* Attachment preview if user selected a file */}
              {chatAttachment && (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-[var(--bg-subtle)] border border-[var(--lime)]/50 et-animate-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {chatAttachment.type === 'image' && (
                      <img
                        src={chatAttachment.url}
                        alt={chatAttachment.name}
                        className="w-10 h-10 object-cover rounded-sm border border-[var(--border)] shrink-0"
                      />
                    )}
                    {chatAttachment.type === 'audio' && (
                      <div className="w-10 h-10 rounded-sm bg-[var(--lime)]/10 text-[var(--lime)] flex items-center justify-center font-et-mono text-lg shrink-0">
                        🎵
                      </div>
                    )}
                    {chatAttachment.type === 'file' && (
                      <div className="w-10 h-10 rounded-sm bg-[var(--cobalt)]/10 text-[var(--cobalt)] flex items-center justify-center font-et-mono text-lg shrink-0">
                        📄
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-[var(--ink)]">
                        {chatAttachment.name}
                      </div>
                      <div className="font-et-mono text-[10px] text-[var(--muted)]">
                        {chatAttachment.type.toUpperCase()} &middot; {chatAttachment.size}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setChatAttachment(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-et-mono text-[var(--muted)] hover:text-red-500 transition-colors"
                    title="Remove attachment"
                  >
                    <IconClose className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,.pdf,.zip,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file (image, audio, document)"
                  aria-label="Attach file"
                  className="w-10 h-10 rounded-sm border border-[var(--border-strong)] hover:border-[var(--lime)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] shrink-0 transition-colors"
                >
                  <IconPaperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={chatAttachment ? `Add caption for ${chatAttachment.name}...` : 'Discuss details or negotiate...'}
                  className="flex-1 px-4 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
                />
                <button
                  type="submit"
                  className="group px-5 py-2.5 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] inline-flex items-center gap-2 hover:brightness-95 transition-all shrink-0"
                >
                  <span>Send</span>
                  <IconSend className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between font-et-mono text-[10px] text-[var(--muted)]">
                <span>Supports images, audio notes, deliverables & documents</span>
                <span>Max 10MB per file</span>
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
                                backgroundColor: 'var(--lime)',
                                color: 'var(--lime-ink)',
                                borderColor: 'var(--lime)',
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
                        {isDone ? <IconCheck className="w-3.5 h-3.5" /> : step.num}
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
                  className="group w-full py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 hover:brightness-95 transition-all"
                >
                  <span>
                    {activeRoom.stage === 'Negotiating'
                      ? 'Confirm terms & lock escrow'
                      : activeRoom.stage === 'Confirmed & escrowed'
                      ? 'Mark exchange as delivered'
                      : 'Mutual confirm & settle credits'}
                  </span>
                  <IconArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
