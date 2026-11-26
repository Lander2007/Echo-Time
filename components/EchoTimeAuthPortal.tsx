'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { IconArrowLeft, IconArrowRight, IconSpinner } from '@/components/workspace/Icons';

export type AuthMode = 'login' | 'signup';

interface ToastItem {
  id: number;
  text: string;
}

interface EchoTimeAuthPortalProps {
  initialMode?: AuthMode;
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_found:
    'No Echo Time account found for this Google email. Sign up first to claim your 5 starter credits.',
  account_already_exists:
    'This Google account is already registered. Please log in instead.',
  google_cancelled: 'Google Sign-In was cancelled. No changes were made.',
  unverified_google_email:
    'Your Google email address is not verified. Verify it with Google or sign up with email.',
  google_not_configured:
    'Google Sign-In is not configured yet (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).',
  oauth_failed: 'Could not complete Google Sign-In. Please try again.',
};

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function ContinueWithGoogleBlock({
  intent,
  tabIndex,
}: {
  intent: 'login' | 'signup';
  tabIndex: number;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const label = intent === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  useEffect(() => {
    const handlePageShow = () => setIsRedirecting(false);
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleClick = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    window.location.assign(`/api/auth/google?intent=${intent}`);
  };

  return (
    <div className="mt-3.5">
      <div className="flex items-center gap-3 mb-3.5">
        <span className="h-px flex-1 bg-[#DADCE0]" />
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5F6368]">
          or
        </span>
        <span className="h-px flex-1 bg-[#DADCE0]" />
      </div>
      <button
        type="button"
        tabIndex={tabIndex}
        disabled={isRedirecting}
        aria-busy={isRedirecting}
        onClick={handleClick}
        className={`group relative overflow-hidden w-full h-11 px-4 rounded-[4px] border font-sans text-[14px] font-medium tracking-[0.015em] flex items-center justify-center gap-3 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#021F94]/35 focus-visible:ring-offset-1 ${
          isRedirecting
            ? 'bg-[#F1F5FE] border-[#021F94]/45 text-[#0B1026] shadow-[0_2px_8px_rgba(2,31,148,0.1)] cursor-wait'
            : 'bg-white text-[#1F1F1F] border-[#747775]/55 shadow-[0_1px_2px_rgba(11,16,38,0.06)] hover:bg-[#F1F5FE] hover:border-[#021F94]/50 hover:text-[#0B1026] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(2,31,148,0.12),0_1px_3px_rgba(60,64,67,0.1)] active:translate-y-0 active:scale-[0.99] active:bg-[#E4ECFD] cursor-pointer'
        }`}
      >
        {isRedirecting ? (
          <>
            <IconSpinner className="w-[18px] h-[18px] text-[#021F94]" />
            <span>Connecting to Google...</span>
            <span aria-hidden="true" className="et-oauth-progress-bar" />
          </>
        ) : (
          <>
            <span className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-[1.06]">
              <GoogleGIcon />
            </span>
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}

function AuthSearchParamsSync({
  onModeFromQuery,
  onOAuthNotice,
  pushToast,
}: {
  onModeFromQuery: (next: AuthMode) => void;
  onOAuthNotice: (code: string | null) => void;
  pushToast: (msg: string) => void;
}) {
  const searchParams = useSearchParams();
  const handledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') {
      onModeFromQuery('signup');
    } else if (modeParam === 'login') {
      onModeFromQuery('login');
    }

    const oauthErr = searchParams.get('oauth_error');
    if (oauthErr && handledErrorRef.current !== oauthErr) {
      handledErrorRef.current = oauthErr;
      onOAuthNotice(oauthErr);
      pushToast(OAUTH_ERROR_MESSAGES[oauthErr] || OAUTH_ERROR_MESSAGES.oauth_failed);
      if (typeof window !== 'undefined') {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('oauth_error');
        window.history.replaceState(null, '', nextUrl.pathname + nextUrl.search);
      }
    }
  }, [searchParams, onModeFromQuery, onOAuthNotice, pushToast]);

  return null;
}

export function EchoTimeAuthPortal({ initialMode = 'login' }: EchoTimeAuthPortalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = useCallback((next: AuthMode) => {
    setMode(next);
    setOauthNotice(null);
    if (typeof window !== 'undefined') {
      const url = next === 'signup' ? '/login?mode=signup' : '/login';
      window.history.replaceState(null, '', url);
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

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      pushToast('Please enter your university email and password.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast(data?.error || 'Invalid email or password');
        return;
      }
      pushToast(`Signed in as ${data.user.fullName} — entering Student Workspace.`);
      window.setTimeout(() => {
        router.push('/dashboard');
      }, 400);
    } catch (err: any) {
      pushToast(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      pushToast('Complete all fields to create your student ledger and claim 5 starter credits.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          university: 'Accredited University',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast(data?.error || 'Registration failed');
        return;
      }
      pushToast(`Ledger created for ${data.user.fullName} (+5.00 ECHO starter grant minted in database).`);
      window.setTimeout(() => {
        router.push('/dashboard?welcome=new');
      }, 400);
    } catch (err: any) {
      pushToast(err?.message || 'Sign up failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="et-auth-shell et-auth-imperial flex flex-col justify-between">
      <Suspense fallback={null}>
        <AuthSearchParamsSync
          onModeFromQuery={setMode}
          onOAuthNotice={setOauthNotice}
          pushToast={pushToast}
        />
      </Suspense>

      {/* Top Minimal Swiss Header */}
      <header className="w-full border-b border-[var(--border)] px-5 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <BrandLogo surface="light" size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#021F94]/20 hover:border-[#021F94]/45 hover:bg-[#021F94]/[0.04] font-et-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#565C73] hover:text-[#021F94] transition-all duration-200"
          >
            <IconArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Auth Stage */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <div className={`et-auth-stage ${isSignup ? 'is-signup' : ''}`}>
          {/* PANEL 1: LOGIN FORM (RIGHT HALF ON DESKTOP) */}
          <div className="et-form-panel et-form-login" aria-hidden={isSignup}>
            <div>
              <h1 className="font-black tracking-[-0.04em] text-3xl sm:text-4xl leading-none text-[#0B1026]">
                Welcome back.
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Enter your workspace to manage credits, listings, and active agreement rooms.
              </p>

              {oauthNotice === 'account_already_exists' && (
                <div className="mt-3 px-3 py-2 rounded-[2px] border border-[#D93829]/35 border-l-[3px] border-l-[#D93829] bg-[#D93829]/5 text-[11px] font-mono text-[#0B1026] leading-snug">
                  {OAUTH_ERROR_MESSAGES.account_already_exists}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1"
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
                  <div className="flex items-center justify-between mb-1">
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
                  disabled={submitting}
                  tabIndex={isSignup ? -1 : 0}
                  className="group w-full mt-1 py-3 px-4 rounded-md bg-[#0B1026] text-[#F5F2F3] font-et-mono text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] hover:bg-[#021F94] hover:shadow-[0_4px_14px_rgba(2,31,148,0.22)] cursor-pointer disabled:opacity-60"
                >
                  <span>{submitting ? 'Verifying...' : 'Enter Student Workspace'}</span>
                  {!submitting && (
                    <IconArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              <ContinueWithGoogleBlock intent="login" tabIndex={isSignup ? -1 : 0} />
            </div>
          </div>

          {/* PANEL 2: SIGN-UP FORM (LEFT HALF ON DESKTOP) */}
          <div className="et-form-panel et-form-signup" aria-hidden={!isSignup}>
            <div>
              <h1 className="font-black tracking-[-0.04em] text-3xl sm:text-4xl leading-none text-[#0B1026]">
                Create account.
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Start with 5 starter credits and verified peer agreements on campus.
              </p>

              {oauthNotice === 'account_not_found' && (
                <div className="mt-3 px-3 py-2 rounded-[2px] border border-[#D93829]/35 border-l-[3px] border-l-[#D93829] bg-[#D93829]/5 text-[11px] font-mono text-[#0B1026] leading-snug">
                  {OAUTH_ERROR_MESSAGES.account_not_found}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1"
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
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1"
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
                    className="block font-et-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1"
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
                  disabled={submitting}
                  tabIndex={!isSignup ? -1 : 0}
                  className="group w-full mt-1 py-3 px-4 rounded-md bg-[#021F94] text-[#F5F2F3] font-et-mono text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] hover:brightness-110 hover:shadow-[0_4px_14px_rgba(2,31,148,0.28)] cursor-pointer disabled:opacity-60"
                >
                  <span>{submitting ? 'Minting Grant...' : 'Claim 5 Starter Credits'}</span>
                  {!submitting && (
                    <IconArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              <ContinueWithGoogleBlock intent="signup" tabIndex={!isSignup ? -1 : 0} />
            </div>
          </div>

          {/* THE SWEEPING 300% CURVED IMPERIAL BLUE CURTAIN */}
          <div className="et-curtain-layer" aria-hidden="true">
            <div className="et-curtain-blob" />
          </div>

          {/* CURTAIN COPY A (LEFT — VISIBLE IN LOGIN MODE, INVITES SIGN UP) */}
          <div className="et-toggle-panel et-toggle-left" aria-hidden={isSignup}>
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
                onClick={() => switchMode('signup')}
                className="group mt-4 sm:mt-6 px-6 py-3 rounded-md font-et-mono text-xs font-bold uppercase tracking-[0.14em] border-2 border-[#F5F2F3] text-[#F5F2F3] bg-transparent hover:bg-[#F5F2F3] hover:text-[#021F94] inline-flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Create Account</span>
                <IconArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* CURTAIN COPY B (RIGHT — VISIBLE IN SIGN-UP MODE, INVITES LOG IN) */}
          <div className="et-toggle-panel et-toggle-right" aria-hidden={!isSignup}>
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
                onClick={() => switchMode('login')}
                className="group mt-4 sm:mt-6 px-6 py-3 rounded-md font-et-mono text-xs font-bold uppercase tracking-[0.14em] border-2 border-[#F5F2F3] text-[#F5F2F3] bg-transparent hover:bg-[#F5F2F3] hover:text-[#021F94] inline-flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <IconArrowLeft className="w-4 h-4 transition-transform duration-200 ease-out group-hover:-translate-x-1" />
                <span>Log In</span>
              </button>
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
