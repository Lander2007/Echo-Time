'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type AuthMode = 'login' | 'signup';

interface ToastItem {
  id: number;
  text: string;
}

interface EchoTimeAuthPortalProps {
  initialMode?: AuthMode;
}

export function EchoTimeAuthPortal({ initialMode = 'login' }: EchoTimeAuthPortalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('mode');
      if (q === 'signup') {
        setMode('signup');
      } else if (q === 'login') {
        setMode('login');
      }
    }
  }, []);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign-Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Non-blocking Swiss Toast Stack
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      pushToast('Please enter your university email and password.');
      return;
    }
    // TODO: Wire to real Auth endpoint (POST /api/auth/login or Auth.js signIn)
    pushToast(`Signed in as ${loginEmail.trim()} — entering Student Workspace.`);
    router.push('/dashboard');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      pushToast('Complete all fields to create your student ledger and claim 5 starter credits.');
      return;
    }
    // TODO: Wire to real Registration endpoint (POST /api/auth/signup)
    pushToast(`Ledger created for ${signupName.trim()} (+5 starter credits minted).`);
    router.push('/dashboard');
  };

  const isSignup = mode === 'signup';

  return (
    <div className="et-auth-shell et-auth-imperial flex flex-col justify-between">
      {/* Top Minimal Swiss Header (Zero Theme Switcher) */}
      <header className="w-full border-b border-[var(--border)] px-5 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <span
            className="w-6 h-6 rounded-sm inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-90"
            style={{ backgroundColor: '#021F94', color: '#F5F2F3' }}
          >
            <span className="et-swiss-cross" />
          </span>
          <span className="font-black uppercase tracking-[-0.04em] text-base leading-none text-[#0B1026]">
            ECHO{' '}
            <span className="font-et-mono font-semibold text-xs tracking-[0.08em] text-[#021F94]">
              TIME
            </span>
          </span>
        </Link>

        <Link
          href="/"
          className="font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#565C73] hover:text-[#021F94] transition-colors"
        >
          ← Back to Portal
        </Link>
      </header>

      {/* Main Centered Auth Stage */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <div className={`et-auth-stage ${isSignup ? 'is-signup' : ''}`}>
          {/* PANEL 1: LOGIN FORM (RIGHT HALF ON DESKTOP) */}
          <div className="et-form-panel et-form-login" aria-hidden={isSignup}>
            <div>
              <div className="flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] pb-3 border-b border-[var(--border)]">
                <span>STUDENT PORTAL</span>
                <span className="font-semibold text-[#D93829]">01 · LOG IN</span>
              </div>

              <h1 className="mt-5 font-black tracking-[-0.04em] text-3xl sm:text-4xl leading-none text-[#0B1026]">
                Welcome back.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Enter your workspace to manage credits, listings, and active agreement rooms.
              </p>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5"
                  >
                    University email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    tabIndex={isSignup ? -1 : 0}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="et-field-input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      tabIndex={isSignup ? -1 : 0}
                      onClick={() => pushToast('Password reset link dispatched to your .edu inbox.')}
                      className="font-et-mono text-[10px] uppercase tracking-[0.08em] text-[#D93829] hover:underline"
                    >
                      Reset?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    tabIndex={isSignup ? -1 : 0}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="et-field-input"
                  />
                </div>

                <button
                  type="submit"
                  tabIndex={isSignup ? -1 : 0}
                  className="w-full mt-2 py-3.5 rounded-md bg-[#021F94] text-[#F5F2F3] font-et-mono text-xs font-bold uppercase tracking-[0.14em] transition-transform active:scale-[0.98] hover:brightness-110"
                >
                  Enter Student Workspace →
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                <span>1.00 HR = 1.00 CREDIT</span>
                <span className="tabular">0.00% FEES</span>
              </div>
            </div>
          </div>

          {/* PANEL 2: SIGN-UP FORM (LEFT HALF ON DESKTOP) */}
          <div className="et-form-panel et-form-signup" aria-hidden={!isSignup}>
            <div>
              <div className="flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] pb-3 border-b border-[var(--border)]">
                <span>NEW STUDENT LEDGER</span>
                <span className="font-semibold text-[#D93829]">02 · SIGN UP</span>
              </div>

              <h1 className="mt-5 font-black tracking-[-0.04em] text-3xl sm:text-4xl leading-none text-[#0B1026]">
                Create account.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Start with 5 starter credits and verified peer agreements on campus.
              </p>

              <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5"
                  >
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    tabIndex={!isSignup ? -1 : 0}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Khaled Amr Ahmeed"
                    className="et-field-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5"
                  >
                    University email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    tabIndex={!isSignup ? -1 : 0}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="et-field-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    tabIndex={!isSignup ? -1 : 0}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="et-field-input"
                  />
                </div>

                <button
                  type="submit"
                  tabIndex={!isSignup ? -1 : 0}
                  className="w-full mt-2 py-3.5 rounded-md bg-[#021F94] text-[#F5F2F3] font-et-mono text-xs font-bold uppercase tracking-[0.14em] transition-transform active:scale-[0.98] hover:brightness-110"
                >
                  Claim 5 Starter Credits →
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between font-et-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                <span>ATOMIC ESCROW</span>
                <span className="tabular">.EDU VERIFIED</span>
              </div>
            </div>
          </div>

          {/* THE SWEEPING 300% CURVED IMPERIAL BLUE CURTAIN */}
          <div className="et-curtain-layer" aria-hidden="true">
            <div className="et-curtain-blob" />
          </div>

          {/* CURTAIN COPY A (LEFT — VISIBLE IN LOGIN MODE, INVITES SIGN UP) */}
          <div className="et-toggle-panel et-toggle-left" aria-hidden={isSignup}>
            <div
              className="hidden md:flex items-center justify-between font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] pb-3 border-b"
              style={{ borderColor: 'var(--curtain-border)' }}
            >
              <span>STUDENT ACCESS</span>
              <span className="px-2 py-0.5 rounded-sm bg-[#D93829] text-[#F5F2F3]">
                1 HR = 1 CREDIT
              </span>
            </div>

            <div className="my-auto">
              <div className="font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] mb-2 hidden sm:block text-[#B9C8FF]">
                NEW TO ECHO TIME?
              </div>
              <h2 className="font-black uppercase tracking-[-0.05em] leading-[0.92] text-3xl sm:text-5xl text-[#F5F2F3]">
                TRADE HOURS,
                <br />
                NOT TUITION.
              </h2>
              <p
                className="mt-3 text-xs sm:text-sm leading-relaxed max-w-xs hidden sm:block"
                style={{ color: 'var(--curtain-muted)' }}
              >
                Open your campus ledger in seconds and receive 5 starter credits to request your first peer exchange.
              </p>

              <button
                type="button"
                tabIndex={isSignup ? -1 : 0}
                onClick={() => setMode('signup')}
                className="mt-4 sm:mt-6 px-6 py-3 rounded-md font-et-mono text-xs font-bold uppercase tracking-[0.14em] border-2 border-[#F5F2F3] text-[#F5F2F3] bg-transparent hover:bg-[#F5F2F3] hover:text-[#021F94] transition-all active:scale-95"
              >
                Create Account →
              </button>
            </div>

            <div
              className="hidden md:flex items-center justify-between font-et-mono text-[10px] font-semibold uppercase tracking-[0.14em] pt-3 border-t"
              style={{ borderColor: 'var(--curtain-border)' }}
            >
              <span>5 STARTER CREDITS</span>
              <span className="text-[#B9C8FF]">0% FEES</span>
            </div>
          </div>

          {/* CURTAIN COPY B (RIGHT — VISIBLE IN SIGN-UP MODE, INVITES LOG IN) */}
          <div className="et-toggle-panel et-toggle-right" aria-hidden={!isSignup}>
            <div
              className="hidden md:flex items-center justify-between font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] pb-3 border-b"
              style={{ borderColor: 'var(--curtain-border)' }}
            >
              <span>RETURNING MEMBER</span>
              <span className="px-2 py-0.5 rounded-sm bg-[#D93829] text-[#F5F2F3]">
                ESCROW ARMED
              </span>
            </div>

            <div className="my-auto">
              <div className="font-et-mono text-[10px] font-bold uppercase tracking-[0.16em] mb-2 hidden sm:block text-[#B9C8FF]">
                ALREADY VERIFIED?
              </div>
              <h2 className="font-black uppercase tracking-[-0.05em] leading-[0.92] text-3xl sm:text-5xl text-[#F5F2F3]">
                BACK TO THE
                <br />
                EXCHANGE.
              </h2>
              <p
                className="mt-3 text-xs sm:text-sm leading-relaxed max-w-xs hidden sm:block"
                style={{ color: 'var(--curtain-muted)' }}
              >
                Sign back into your verified student account to check your credit rhythm and active agreement rooms.
              </p>

              <button
                type="button"
                tabIndex={!isSignup ? -1 : 0}
                onClick={() => setMode('login')}
                className="mt-4 sm:mt-6 px-6 py-3 rounded-md font-et-mono text-xs font-bold uppercase tracking-[0.14em] border-2 border-[#F5F2F3] text-[#F5F2F3] bg-transparent hover:bg-[#F5F2F3] hover:text-[#021F94] transition-all active:scale-95"
              >
                ← Log In
              </button>
            </div>

            <div
              className="hidden md:flex items-center justify-between font-et-mono text-[10px] font-semibold uppercase tracking-[0.14em] pt-3 border-t"
              style={{ borderColor: 'var(--curtain-border)' }}
            >
              <span>PRIVATE WORKSPACES</span>
              <span className="text-[#B9C8FF]">1:1 PARITY</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Spec Line */}
      <footer className="w-full px-6 py-4 text-center font-et-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
        ECHO TIME &middot; PEER-TO-PEER UNIVERSITY TIME BANKING
      </footer>

      {/* Non-Blocking Swiss Toast Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="et-toast pointer-events-auto px-4 py-3 rounded-md border border-[#021F94] bg-[#FFFFFF] text-[#0B1026] font-et-mono text-[11px] leading-snug shadow-2xl"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
