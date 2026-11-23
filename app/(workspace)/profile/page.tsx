'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceProvider';

export default function ProfilePage() {
  const {
    profileFullName,
    profileUsername,
    setProfileUsername,
    profileUniversity,
    setProfileUniversity,
    profileBio,
    setProfileBio,
    profileAvailability,
    setProfileAvailability,
    hasProfilePhoto,
    setHasProfilePhoto,
    offeredSkills,
    newSkillInput,
    setNewSkillInput,
    handleAddOfferedSkill,
    handleRemoveOfferedSkill,
    userInitials,
    profileChecklist,
    profileCompletionPct,
    completedExchanges,
    spaces,
    pushToast,
  } = useWorkspace();

  return (
    <div className="et-animate-in max-w-[1160px] mx-auto space-y-7">
      {/* Hero Profile Banner */}
      <div className="relative rounded-sm border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <span className="et-tick-tl" />
        <span className="et-tick-tr" />
        <span className="et-tick-bl" />
        <span className="et-tick-br" />

        <div className="lg:col-span-6">
          <div className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
            YOUR STUDENT PROFILE
          </div>
          <h1 className="mt-1.5 font-et-sans font-black tracking-[-0.045em] leading-[0.94] text-4xl sm:text-5xl">
            Make your next step visible.
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)] max-w-md">
            Keep the skills, work, and availability that shape your exchanges in one place.
          </p>
        </div>

        <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-sm border border-[var(--border)] bg-[var(--bg)]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setHasProfilePhoto((v) => !v);
                pushToast(!hasProfilePhoto ? 'Profile photo badge activated.' : 'Profile photo reset.');
              }}
              title="Toggle profile photo state"
              className="relative w-14 h-14 rounded-sm font-et-mono font-black text-lg flex items-center justify-center shrink-0 border transition-transform hover:scale-105"
              style={
                hasProfilePhoto
                  ? { backgroundColor: 'var(--lime)', color: 'var(--lime-ink)', borderColor: 'var(--lime-ink)' }
                  : {
                      backgroundColor: 'var(--cobalt)',
                      color: '#F1EFE8',
                      borderColor: 'var(--cobalt)',
                    }
              }
            >
              {userInitials}
            </button>
            <div>
              <div className="font-et-mono text-[9.5px] uppercase text-[var(--muted)]">
                Full name
              </div>
              <div className="font-et-sans font-extrabold text-lg">{profileFullName}</div>
              <div className="font-et-mono text-[11px] text-[var(--muted)]">
                @{profileUsername} &middot; {profileUniversity.trim() || 'University not added'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => pushToast('Profile changes saved.')}
            className="px-4 py-2.5 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[11px] font-bold uppercase tracking-[0.11em] hover:brightness-95 shrink-0"
          >
            Save changes
          </button>
        </div>
      </div>

      {/* 2-Column Profile Details + Signal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Profile Form */}
        <div className="lg:col-span-8 et-card rounded-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div>
              <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cobalt)] font-semibold">
                PROFILE DETAILS
              </div>
              <h2 className="mt-0.5 font-et-sans font-extrabold text-xl">About you</h2>
            </div>
            <span className="px-2.5 py-1 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] font-et-mono text-[10px] font-bold tracking-[0.1em] text-[var(--lime)]">
              STUDENT_FREE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lime)]"
              />
            </div>
            <div>
              <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                University
              </label>
              <input
                type="text"
                value={profileUniversity}
                onChange={(e) => setProfileUniversity(e.target.value)}
                placeholder="University"
                className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
              Bio
            </label>
            <textarea
              rows={4}
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              placeholder="What do you enjoy helping with?"
              className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)] resize-none"
            />
          </div>

          <div>
            <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
              Availability
            </label>
            <select
              value={profileAvailability}
              onChange={(e) => setProfileAvailability(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lime)]"
            >
              <option value="Weekends">Weekends</option>
              <option value="Weekday evenings">Weekday evenings</option>
              <option value="Flexible">Flexible</option>
              <option value="Mornings">Mornings</option>
            </select>
          </div>

          {/* Interactive Skills Offered */}
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2.5">
              Skills you offer ({offeredSkills.length}/3 for profile signal)
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {offeredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[11px] font-bold"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => handleRemoveOfferedSkill(sk)}
                    aria-label={`Remove ${sk}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddOfferedSkill} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add a skill (e.g. Next.js, C#, Data analysis)"
                className="flex-1 px-3 py-2 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--lime)]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-sm border border-[var(--border-strong)] hover:border-[var(--lime)] font-et-mono text-[11px] uppercase font-semibold"
              >
                + Add
              </button>
            </form>
          </div>
        </div>

        {/* Right 4 Cols: Profile Signal & Counters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="et-card rounded-sm p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cobalt)] font-semibold">
                  PROFILE SIGNAL
                </div>
                <div className="mt-0.5 font-et-sans font-extrabold text-lg">
                  Profile completion
                </div>
              </div>
              <span className="font-et-mono font-bold text-2xl tabular text-[var(--lime)]">
                {profileCompletionPct}%
              </span>
            </div>

            <div className="w-full h-2 rounded-sm bg-[var(--bg)] overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[var(--lime)] transition-all duration-500"
                style={{ width: `${profileCompletionPct}%` }}
              />
            </div>

            <ul className="space-y-2.5 pt-1 font-et-mono text-xs">
              {profileChecklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
                    style={
                      item.done
                        ? { backgroundColor: 'var(--lime)', color: 'var(--lime-ink)' }
                        : {
                            border: '1px solid var(--border-strong)',
                            color: 'var(--muted)',
                          }
                    }
                  >
                    {item.done ? '✓' : ''}
                  </span>
                  <span
                    className={
                      item.done ? 'font-semibold text-[var(--ink)]' : 'text-[var(--muted)]'
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="et-card rounded-sm p-5">
              <div className="font-et-sans font-black text-3xl tabular text-[var(--ink)]">
                {completedExchanges}
              </div>
              <div className="mt-1 font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                EXCHANGES
              </div>
            </div>
            <div className="et-card rounded-sm p-5">
              <div className="font-et-sans font-black text-3xl tabular text-[var(--lime)]">
                {spaces.length}
              </div>
              <div className="mt-1 font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                PROJECTS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
