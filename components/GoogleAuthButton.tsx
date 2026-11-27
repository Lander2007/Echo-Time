'use client';

import React, { useEffect, useState } from 'react';
import { IconSpinner } from '@/components/workspace/Icons';

export interface GoogleAuthButtonProps {
  intent: 'login' | 'signup';
  label?: string;
  tabIndex?: number;
  disabled?: boolean;
  className?: string;
}

export function GoogleAuthButton({
  intent,
  label,
  tabIndex = 0,
  disabled = false,
  className = '',
}: GoogleAuthButtonProps) {
  const [redirecting, setRedirecting] = useState(false);

  const buttonLabel =
    label ?? (intent === 'signup' ? 'Sign up with Google' : 'Log in with Google');

  useEffect(() => {
    const handlePageShow = () => setRedirecting(false);
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleClick = () => {
    if (disabled || redirecting) return;
    setRedirecting(true);
    window.location.href = `/api/auth/google?intent=${intent}`;
  };

  return (
    <button
      type="button"
      tabIndex={tabIndex}
      disabled={disabled || redirecting}
      aria-busy={redirecting}
      onClick={handleClick}
      className={`et-google-btn ${className}`}
    >
      {redirecting ? (
        <IconSpinner className="w-[18px] h-[18px] text-[#021F94]" />
      ) : (
        <svg
          className="et-google-btn-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.29v3.09A12 12 0 0 0 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.29A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.62H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.99-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09C6.23 6.87 8.88 4.76 12 4.76z"
          />
        </svg>
      )}

      <span className="et-google-btn-label">
        {redirecting ? 'Redirecting to Google...' : buttonLabel}
      </span>

      {/* Staggered 4-Pigment Calibration Strip / Redirect Progress */}
      {redirecting ? (
        <span aria-hidden="true" className="et-oauth-progress-bar" />
      ) : (
        <span className="et-google-pigment-rail" aria-hidden="true">
          <span className="et-google-pigment-seg et-google-pigment-1" />
          <span className="et-google-pigment-seg et-google-pigment-2" />
          <span className="et-google-pigment-seg et-google-pigment-3" />
          <span className="et-google-pigment-seg et-google-pigment-4" />
        </span>
      )}
    </button>
  );
}
