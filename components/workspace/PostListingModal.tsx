'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { ListingType, ListingFormat } from '@/types/workspace';
import { EXPLORE_CATEGORIES } from '@/lib/seed-workspace';

export function PostListingModal() {
  const { postModalOpen, setPostModalOpen, handleCreateListing } = useWorkspace();

  const [form, setForm] = useState({
    type: 'Offering' as ListingType,
    category: 'Programming',
    title: '',
    description: '',
    format: 'Online' as ListingFormat,
    creditsPerHr: 1,
  });

  if (!postModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateListing(form);
    setForm({
      type: 'Offering',
      category: 'Programming',
      title: '',
      description: '',
      format: 'Online',
      creditsPerHr: 1,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setPostModalOpen(false);
      }}
    >
      <div className="et-animate-in max-w-lg w-full rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cobalt)] font-semibold">
              EXPLORE MARKETPLACE
            </div>
            <h2 className="font-et-sans font-black text-xl">Post a Skill / Request</h2>
          </div>
          <button
            type="button"
            onClick={() => setPostModalOpen(false)}
            className="w-8 h-8 rounded-sm border border-[var(--border)] font-et-mono"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['Offering', 'Looking for'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`py-2 rounded-sm font-et-mono text-xs font-bold uppercase border ${
                  form.type === t
                    ? 'bg-[var(--lime)] text-[var(--lime-ink)] border-[var(--lime)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)]"
              >
                {EXPLORE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
                Credits / hr
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={form.creditsPerHr}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    creditsPerHr: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] tabular"
              />
            </div>
          </div>

          <div>
            <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Next.js App Router mentoring"
              className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block font-et-mono text-[10px] uppercase text-[var(--muted)] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Briefly describe what you will cover or need help with..."
              className="w-full px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-xs font-bold uppercase tracking-[0.12em]"
          >
            Publish listing →
          </button>
        </form>
      </div>
    </div>
  );
}
