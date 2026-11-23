'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { CommunityCategory } from '@/types/workspace';

export function SpaceModal() {
  const {
    spaceModalOpen,
    setSpaceModalOpen,
    editingSpaceId,
    spaceForm,
    setSpaceForm,
    handleSaveSpace,
  } = useWorkspace();

  if (!spaceModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSpaceModalOpen(false);
      }}
    >
      <div className="et-animate-in max-w-lg w-full rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cobalt)] font-semibold">
              STUDENT COLLABORATION
            </div>
            <h2 className="font-et-sans font-black text-xl">
              {editingSpaceId ? 'Edit space' : 'Create space'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSpaceModalOpen(false)}
            className="w-8 h-8 rounded-sm border border-[var(--border)] font-et-mono"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSaveSpace} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['Project', 'Group', 'Event'] as const).map((k: CommunityCategory) => (
              <button
                key={k}
                type="button"
                onClick={() => setSpaceForm((f) => ({ ...f, kind: k }))}
                className={`py-2 rounded-sm font-et-mono text-xs font-bold uppercase border ${
                  spaceForm.kind === k
                    ? 'bg-[var(--lime)] text-[var(--lime-ink)] border-[var(--lime)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
                Title
              </label>
              <input
                type="text"
                value={spaceForm.title}
                onChange={(e) => setSpaceForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Project or group name"
                className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
                Tag
              </label>
              <input
                type="text"
                value={spaceForm.tag}
                onChange={(e) => setSpaceForm((f) => ({ ...f, tag: e.target.value }))}
                placeholder="tech, design, study..."
                className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={spaceForm.description}
              onChange={(e) => setSpaceForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What are you building or organizing?"
              className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em]"
          >
            {editingSpaceId ? 'Save changes →' : 'Create space →'}
          </button>
        </form>
      </div>
    </div>
  );
}
