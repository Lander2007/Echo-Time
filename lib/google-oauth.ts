import { NextRequest, NextResponse } from 'next/server';

export const OAUTH_STATE_COOKIE = 'echotime_oauth_state';
export const OAUTH_VERIFIER_COOKIE = 'echotime_oauth_verifier';
export const OAUTH_INTENT_COOKIE = 'echotime_oauth_intent';

export function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Resolve canonical origin from the live request (and ignore stale localhost env vars in cloud production). */
export function getAppOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const requestOrigin = forwardedHost
    ? `${forwardedProto || (forwardedHost.includes('localhost') ? 'http' : 'https')}://${forwardedHost}`
    : request.nextUrl.origin;

  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
  if (configured) {
    try {
      const reqUrl = new URL(requestOrigin);
      const cfgUrl = new URL(configured);
      const reqIsLocal = reqUrl.hostname === 'localhost' || reqUrl.hostname === '127.0.0.1';
      const cfgIsLocal = cfgUrl.hostname === 'localhost' || cfgUrl.hostname === '127.0.0.1';
      // Never let a stale localhost NEXT_PUBLIC_APP_URL hijack a live Vercel request
      if (!reqIsLocal && cfgIsLocal) {
        return requestOrigin;
      }
      if (cfgUrl.host === reqUrl.host) {
        return configured;
      }
    } catch {
      // Ignore malformed configured URL and fall back to requestOrigin
    }
  }

  return requestOrigin;
}

export function getOAuthTempCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  };
}

export function clearOAuthCookies(response: NextResponse): void {
  const expired = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, '', expired);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, '', expired);
  response.cookies.set(OAUTH_INTENT_COOKIE, '', expired);
}

const KNOWN_UNIVERSITY_DOMAINS: Record<string, string> = {
  'cu.edu.eg': 'Cairo University',
  'eng.cu.edu.eg': 'Cairo University — Engineering',
  'aucegypt.edu': 'American University in Cairo',
  'asu.edu.eg': 'Ain Shams University',
  'alexu.edu.eg': 'Alexandria University',
  'guc.edu.eg': 'German University in Cairo',
  'bue.edu.eg': 'British University in Egypt',
  'echotime.edu': 'Echo Time Campus',
  'mit.edu': 'Massachusetts Institute of Technology',
  'stanford.edu': 'Stanford University',
  'harvard.edu': 'Harvard University',
  'ox.ac.uk': 'University of Oxford',
  'cam.ac.uk': 'University of Cambridge',
};

const CONSUMER_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
]);

/** Infer institution label from a verified Google Workspace / .edu email domain. */
export function inferUniversityFromEmail(email: string): string {
  const domain = email.toLowerCase().split('@')[1]?.trim();
  if (!domain || CONSUMER_DOMAINS.has(domain)) {
    return 'Verified Student';
  }

  for (const [knownDomain, label] of Object.entries(KNOWN_UNIVERSITY_DOMAINS)) {
    if (domain === knownDomain || domain.endsWith(`.${knownDomain}`)) {
      return label;
    }
  }

  const parts = domain.split('.').filter(Boolean);
  const eduIdx = parts.findIndex((p) => p === 'edu' || p === 'ac');
  if (eduIdx > 0) {
    const orgSlug = parts[eduIdx - 1];
    if (orgSlug && orgSlug.length >= 2) {
      const formatted = orgSlug
        .split('-')
        .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
        .join(' ');
      return formatted.length <= 4 ? `${formatted.toUpperCase()} University` : `${formatted} University`;
    }
  }

  return 'Verified Student';
}
