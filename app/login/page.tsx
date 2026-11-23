'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconSunMoon } from '@/components/workspace/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('khaled.ahmeed@alexu.edu.eg');
  const [authPassword, setAuthPassword] = useState<string>('••••••••••••');
  const [authFullName, setAuthFullName] = useState<string>('Khaled Amr Ahmeed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className={`et-shell ${themeMode === 'dark' ? 'et-app-dark' : 'et-app-light'} flex flex-col justify-between min-h-screen`}>
      <header className="w-full border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-sm bg-[#C9E54B] text-[#1A1B17] inline-flex items-center justify-center">
            <span className="et-swiss-cross" />
          </span>
          <span className="font-black uppercase tracking-[-0.04em] text-base">
            ECHO <span className="font-et-mono font-semibold text-xs text-[var(--lime)]">TIME</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setThemeMode((m) => (m === 'dark' ? 'light' : 'dark'))}
          className="w-9 h-9 rounded-sm border border-[var(--border)] hover:border-[var(--lime)] flex items-center justify-center"
          aria-label="Toggle color mode"
        >
          <IconSunMoon isDark={themeMode === 'dark'} />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="et-animate-in max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-strong)] bg-[var(--bg-elevated)] rounded-sm overflow-hidden shadow-2xl">
          {/* Left Swiss Poster Column */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-[#C9E54B] text-[#1A1B17] relative">
            <div className="flex items-center justify-between font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] pb-3 border-b border-[#1A1B17]/20">
              <span>STUDENT ACCESS</span>
              <span className="text-[#1E3AE0]">1 HR = 1 CREDIT</span>
            </div>
            <div className="my-10">
              <h1 className="font-black uppercase tracking-[-0.05em] leading-[0.9] text-4xl sm:text-5xl">
                TRADE HOURS,
                <br />
                NOT TUITION.
              </h1>
              <p className="mt-4 font-et-mono text-xs leading-relaxed text-[#1A1B17]/80">
                Sign in with your student account to access your credit wallet, explore campus listings, and open private agreement rooms.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1A1B17]/20 flex items-center justify-between font-et-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
              <span>5 STARTER CREDITS</span>
              <span className="text-[#1E3AE0]">0% FEES</span>
            </div>
          </div>

          {/* Right Auth Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex p-1 rounded-sm border border-[var(--border)] bg-[var(--bg)] mb-6">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAuthMode(m)}
                    className={`px-4 py-1.5 rounded-sm font-et-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      authMode === m
                        ? 'bg-[#C9E54B] text-[#1A1B17]'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {m === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>

              <h2 className="font-black text-2xl sm:text-3xl tracking-[-0.03em]">
                {authMode === 'login' ? 'Welcome back.' : 'Create your student ledger.'}
              </h2>
              <p className="mt-1.5 text-sm text-[var(--muted)]">
                {authMode === 'login'
                  ? 'Enter your workspace to continue exchanging skills.'
                  : 'Start with 5 starter credits and verified peer agreements.'}
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {authMode === 'signup' && (
                  <div>
                    <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lime)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                    University email
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lime)]"
                  />
                </div>

                <div>
                  <label className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lime)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-sm bg-[#C9E54B] text-[#1A1B17] font-et-mono text-xs font-bold uppercase tracking-[0.14em] hover:brightness-95 transition-all"
                >
                  {authMode === 'login' ? 'Enter Student Workspace →' : 'Create Account & Claim 5 Credits →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
