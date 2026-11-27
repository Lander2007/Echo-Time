import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  base64UrlEncode,
  getAppOrigin,
  getOAuthTempCookieOptions,
  OAUTH_INTENT_COOKIE,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from '@/lib/google-oauth';
import { getSafeRedirectPath } from '@/lib/session-token';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = getAppOrigin(request);

  if (!clientId) {
    return NextResponse.redirect(new URL('/login?oauth_error=google_not_configured', origin));
  }

  // Strictly default raw requests to 'login' so login flows never silently create ghost accounts
  const rawIntent = request.nextUrl.searchParams.get('intent');
  const intent: 'login' | 'signup' = rawIntent === 'signup' ? 'signup' : 'login';
  const safeNext = getSafeRedirectPath(request.nextUrl.searchParams.get('next'));

  const state = base64UrlEncode(crypto.randomBytes(24));
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );

  const redirectUri = `${origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('code_challenge', codeChallenge);
  googleAuthUrl.searchParams.set('code_challenge_method', 'S256');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleAuthUrl);
  const cookieOpts = getOAuthTempCookieOptions();

  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOpts);
  response.cookies.set(OAUTH_INTENT_COOKIE, intent, cookieOpts);
  response.cookies.set(OAUTH_NEXT_COOKIE, safeNext, cookieOpts);
  return response;
}
