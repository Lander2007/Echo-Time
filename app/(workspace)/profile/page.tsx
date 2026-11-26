'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { UserAvatar } from '@/components/UserAvatar';
import { IconArrowRight, IconCheck, IconClose, IconPlus } from '@/components/workspace/Icons';

export default function ProfilePage() {
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    avatarUrl,
    authProvider,
    avatarSaving,
    handleUploadAvatar,
    handleRemoveAvatar,
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
    handleLogout,
    pushToast,
  } = useWorkspace();

  const [savingProfile, setSavingProfile] = useState(false);

  const onAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await handleUploadAvatar(file);
  };

  const saveProfileChanges = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileFullName,
          username: profileUsername,
          university: profileUniversity,
          bio: profileBio,
          availability: profileAvailability,
          offeredSkills,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast('Profile changes saved to database.');
      } else {
        pushToast(data?.error || 'Could not save profile changes.');
      }
    } catch {
      pushToast('Could not save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="et-animate-in">
      {/* Shared Hidden File Input for Desktop & Mobile Photo Upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onAvatarFileSelected}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* ====================================================================
          1. MOBILE LAYOUT (< 1024px SWISS EDITORIAL PROFILE)
          ==================================================================== */}
      <div className="lg:hidden space-y-4 select-none">
        {/* Identity Header Sheet */}
        <div className="et-m-box relative p-4 space-y-3">
          <span className="et-m-tick-tl" />
          <span className="et-m-tick-br" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving}
              title="Upload or change profile photo"
              className="shrink-0 active:opacity-80 disabled:opacity-50"
            >
              <UserAvatar
                src={avatarUrl}
                initials={userInitials}
                alt={profileFullName || 'Student Profile'}
                className="w-12 h-12 text-base"
              />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#565C73] uppercase font-bold">
                <span>STUDENT PROFILE</span>
                <span>·</span>
                <span className="text-[#021F94]">{authProvider}</span>
              </div>
              <h1 className="font-sans font-black text-lg text-[#0B1026] truncate leading-tight">
                {profileFullName}
              </h1>
              <div className="font-mono text-[10px] text-[#565C73] truncate">
                @{profileUsername} · {profileUniversity || 'University'}
              </div>
            </div>

            <Link
              href="/subscription"
              className="group inline-flex items-center gap-1 px-2 py-1 bg-[#F5F2F3] border border-[#021F94]/30 text-[#021F94] font-mono text-[9.5px] font-bold uppercase rounded-[2px] shrink-0 active:opacity-80"
            >
              <span>PLANS</span>
              <IconArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="pt-2.5 border-t border-[#021F94]/18 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving}
              className="border border-[#021F94] text-[#021F94] bg-white font-mono text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-[2px] active:opacity-80 disabled:opacity-50"
            >
              {avatarSaving ? 'SAVING...' : 'CHANGE PHOTO'}
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarSaving}
                className="text-[#D93829] font-mono text-[10px] font-bold uppercase px-2 py-1.5 active:opacity-80 disabled:opacity-50"
              >
                REMOVE
              </button>
            )}
          </div>
        </div>

        {/* Live Profile Signal Box */}
        <div className="bg-white border border-[#021F94]/30 rounded-[2px] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-[#565C73] uppercase tracking-wider">
              PROFILE SIGNAL READINESS
            </span>
            <span className="font-black text-[#021F94] tabular text-sm">
              {profileCompletionPct}%
            </span>
          </div>

          <div className="w-full h-2 bg-[#F5F2F3] rounded-[2px] overflow-hidden border border-[#021F94]/20">
            <div
              className="h-full bg-[#021F94] transition-all duration-300"
              style={{ width: `${profileCompletionPct}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[9.5px] pt-1">
            {profileChecklist.map((item) => (
              <span
                key={item.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] border ${
                  item.done
                    ? 'bg-[#021F94] text-[#F5F2F3] border-[#021F94]'
                    : 'bg-white text-[#565C73] border-[#021F94]/20'
                }`}
              >
                {item.done && <IconCheck className="w-2.5 h-2.5" />}
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Single-Column Editable Form */}
        <div className="bg-white border border-[#021F94]/30 rounded-[2px] p-4 space-y-3.5">
          <div className="pb-2 border-b border-[#021F94]/18 font-mono text-[10px] text-[#021F94] font-bold uppercase tracking-wider">
            EDITABLE ATTRIBUTES
          </div>

          <div>
            <label className="block font-mono text-[9.5px] uppercase text-[#565C73] font-bold mb-1 tracking-wider">
              USERNAME
            </label>
            <input
              type="text"
              value={profileUsername}
              onChange={(e) => setProfileUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-[2px] border border-[#021F94]/30 bg-white text-[16px] text-[#0B1026] focus:outline-none focus:border-[#021F94]"
            />
          </div>

          <div>
            <label className="block font-mono text-[9.5px] uppercase text-[#565C73] font-bold mb-1 tracking-wider">
              UNIVERSITY
            </label>
            <input
              type="text"
              value={profileUniversity}
              onChange={(e) => setProfileUniversity(e.target.value)}
              placeholder="e.g. Cairo University"
              className="w-full px-3 py-2 rounded-[2px] border border-[#021F94]/30 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
            />
          </div>

          <div>
            <label className="block font-mono text-[9.5px] uppercase text-[#565C73] font-bold mb-1 tracking-wider">
              BIO & ACADEMIC FOCUS
            </label>
            <textarea
              rows={3}
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              placeholder="What skills do you enjoy exchanging?"
              className="w-full px-3 py-2 rounded-[2px] border border-[#021F94]/30 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94] resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[9.5px] uppercase text-[#565C73] font-bold mb-1 tracking-wider">
              AVAILABILITY WINDOW
            </label>
            <select
              value={profileAvailability}
              onChange={(e) => setProfileAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-[2px] border border-[#021F94]/30 bg-white text-[16px] text-[#0B1026] focus:outline-none focus:border-[#021F94]"
            >
              <option value="Weekends">Weekends</option>
              <option value="Weekday evenings">Weekday evenings</option>
              <option value="Flexible">Flexible</option>
              <option value="Mornings">Mornings</option>
            </select>
          </div>

          {/* Interactive Skills Offered */}
          <div className="pt-2 border-t border-[#021F94]/18 space-y-2">
            <div className="font-mono text-[9.5px] uppercase text-[#565C73] font-bold tracking-wider">
              SKILLS YOU OFFER ({offeredSkills.length}/3)
            </div>

            <div className="flex flex-wrap gap-1.5">
              {offeredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#021F94] text-[#F5F2F3] font-mono text-[10px] font-bold"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOfferedSkill(sk)}
                    className="inline-flex items-center hover:text-[#D93829]"
                    aria-label={`Remove ${sk}`}
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddOfferedSkill} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add a skill (e.g. Next.js, Python)..."
                className="flex-1 px-3 py-1.5 rounded-[2px] border border-[#021F94]/30 bg-white text-[16px] text-[#0B1026] placeholder-[#565C73] focus:outline-none focus:border-[#021F94]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#F5F2F3] border border-[#021F94] text-[#021F94] font-mono text-[10.5px] font-bold uppercase rounded-[2px] shrink-0 active:opacity-85"
              >
                <IconPlus className="w-3 h-3" />
                <span>ADD</span>
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={saveProfileChanges}
            disabled={savingProfile}
            className="group w-full py-3 bg-[#021F94] text-[#F5F2F3] font-mono text-xs font-bold uppercase tracking-wider rounded-[2px] inline-flex items-center justify-center gap-2 active:opacity-85 disabled:opacity-50"
          >
            <span>{savingProfile ? 'SAVING...' : 'SAVE CHANGES'}</span>
            {!savingProfile && (
              <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Account & Log Out Section */}
        <div className="bg-white border border-[#D93829]/30 rounded-[2px] p-4 space-y-2.5">
          <div className="font-mono text-[10px] text-[#D93829] font-bold uppercase tracking-wider">
            SECURITY & ACCOUNT SESSION
          </div>
          <p className="text-xs text-[#565C73]">
            Log out will clear your session cookie securely from this device.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 border border-[#D93829] text-[#D93829] font-mono text-xs font-bold uppercase tracking-wider rounded-[2px] text-center active:bg-[#D93829] active:text-white transition-colors"
          >
            LOG OUT OF ECHO TIME
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. DESKTOP LAYOUT (>= 1024px STRICT DESKTOP LOCK — 100% UNTOUCHED)
          ==================================================================== */}
      <div className="hidden lg:block max-w-[1160px] mx-auto space-y-7">
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
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarSaving}
                title="Click to upload or change profile photo"
                className="shrink-0 transition-transform hover:scale-105 disabled:opacity-50"
              >
                <UserAvatar
                  src={avatarUrl}
                  initials={userInitials}
                  alt={profileFullName || 'Student Profile'}
                  className="w-14 h-14 text-lg"
                />
              </button>
              <div className="min-w-0">
                <div className="font-et-mono text-[9.5px] uppercase text-[var(--muted)]">
                  Full name
                </div>
                <div className="font-et-sans font-extrabold text-lg truncate">{profileFullName}</div>
                <div className="font-et-mono text-[11px] text-[var(--muted)] truncate">
                  @{profileUsername} &middot; {profileUniversity.trim() || 'University not added'}
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarSaving}
                    className="border border-[#021F94] text-[#021F94] bg-white font-mono text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-[2px] hover:bg-[#F5F2F3] transition-colors disabled:opacity-50"
                  >
                    {avatarSaving ? 'SAVING...' : 'CHANGE PHOTO'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarSaving}
                      className="text-[#D93829] font-mono text-[10px] font-bold uppercase px-2 py-1.5 hover:underline disabled:opacity-50"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfileChanges}
              disabled={savingProfile}
              className="px-4 py-2.5 rounded-sm bg-[var(--lime)] text-[var(--lime-ink)] font-et-mono text-[11px] font-bold uppercase tracking-[0.11em] hover:brightness-95 shrink-0 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
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
                      className="inline-flex items-center"
                      onClick={() => handleRemoveOfferedSkill(sk)}
                      aria-label={`Remove ${sk}`}
                    >
                      <IconClose className="w-3 h-3" />
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-[var(--border-strong)] hover:border-[var(--lime)] font-et-mono text-[11px] uppercase font-semibold"
                >
                  <IconPlus className="w-3 h-3" />
                  <span>Add</span>
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
                      {item.done && <IconCheck className="w-2.5 h-2.5" />}
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
    </div>
  );
}
