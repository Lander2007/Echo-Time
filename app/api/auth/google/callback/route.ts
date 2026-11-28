import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PlanTier } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { canonicalizeEmail } from '@/lib/email';
import {
  clearOAuthCookies,
  getAppOrigin,
  inferUniversityFromEmail,
  OAUTH_INTENT_COOKIE,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from '@/lib/google-oauth';
import { getSafeRedirectPath } from '@/lib/session-token';

export const runtime = 'nodejs';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

function redirectWithOAuthError(
  origin: string,
  code: string,
  mode?: 'login' | 'signup'
): NextResponse {
  const url = new URL('/login', origin);
  if (mode) {
    url.searchParams.set('mode', mode);
  }
  url.searchParams.set('oauth_error', code);

  const response = NextResponse.redirect(url);
  clearOAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = getAppOrigin(request);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Read tamper-resistant OAuth intent & safe next destination from httpOnly cookies
  const intent: 'login' | 'signup' =
    request.cookies.get(OAUTH_INTENT_COOKIE)?.value === 'signup'
      ? 'signup'
      : 'login';
  const safeNext = getSafeRedirectPath(request.cookies.get(OAUTH_NEXT_COOKIE)?.value);

  if (!clientId || !clientSecret) {
    return redirectWithOAuthError(origin, 'google_not_configured', intent);
  }

  const { searchParams } = request.nextUrl;
  const oauthError = searchParams.get('error');
  if (oauthError) {
    return redirectWithOAuthError(origin, 'google_cancelled', intent);
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!code || !state || !expectedState || !codeVerifier) {
    return redirectWithOAuthError(origin, 'oauth_failed', intent);
  }

  // Constant-time CSRF validation between returned state and cookie state
  const stateBuf = Buffer.from(state, 'utf8');
  const expectedBuf = Buffer.from(expectedState, 'utf8');
  if (
    stateBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(stateBuf, expectedBuf)
  ) {
    return redirectWithOAuthError(origin, 'oauth_failed', intent);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed with status:', tokenRes.status);
      return redirectWithOAuthError(origin, 'oauth_failed', intent);
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) {
      return redirectWithOAuthError(origin, 'oauth_failed', intent);
    }

    // Cryptographically verify Google ID token signature, issuer, and audience
    const { payload } = await jwtVerify(tokenData.id_token, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });

    if (
      payload.email_verified !== true ||
      typeof payload.email !== 'string' ||
      typeof payload.sub !== 'string'
    ) {
      return redirectWithOAuthError(origin, 'unverified_google_email', intent);
    }

    const googleId = payload.sub;
    const cleanEmail = payload.email.toLowerCase().trim();
    const canonicalEmail = canonicalizeEmail(cleanEmail);
    const rawName = typeof payload.name === 'string' ? payload.name.trim().slice(0, 80) : '';
    const fullName = rawName || cleanEmail.split('@')[0] || 'Student Member';
    const rawPicture =
      typeof payload.picture === 'string' && payload.picture.startsWith('https://')
        ? payload.picture
        : null;

    // Look up existing account by googleId, exact email, or canonical email (anti-Sybil)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: cleanEmail }, { canonicalEmail }],
      },
    });

    // Strict Branch A: intent === 'login' (Returning Students Only)
    if (intent === 'login') {
      if (!existing) {
        return redirectWithOAuthError(origin, 'account_not_found', 'signup');
      }

      // Pre-takeover defense: if an unverified passwordHash was pre-registered before the real owner
      // signed in via cryptographically verified Google OAuth, revoke that unverified passwordHash.
      const shouldRevokeUnverifiedPassword = Boolean(existing.passwordHash && !existing.emailVerified);
      const nextPasswordHash = shouldRevokeUnverifiedPassword ? null : existing.passwordHash;
      const authProvider = nextPasswordHash ? 'HYBRID' : 'GOOGLE';
      const nextAvatarUrl = existing.avatarUrl || rawPicture;

      let canonicalToSet: string | undefined;
      if (!existing.canonicalEmail) {
        const collision = await prisma.user.findUnique({
          where: { canonicalEmail },
          select: { id: true },
        });
        if (!collision) {
          canonicalToSet = canonicalEmail;
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId,
          emailVerified: true,
          ...(shouldRevokeUnverifiedPassword ? { passwordHash: null } : {}),
          ...(canonicalToSet ? { canonicalEmail: canonicalToSet } : {}),
          authProvider,
          // Preserve custom uploaded avatar; only backfill Google photo if none exists yet
          avatarUrl: nextAvatarUrl,
          avatarActive: Boolean(nextAvatarUrl),
        },
      });

      const sessionToken = await createSessionToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
      });

      const response = NextResponse.redirect(new URL(safeNext, origin));
      setSessionCookie(response, sessionToken);
      clearOAuthCookies(response);
      return response;
    }

    // Strict Branch B: intent === 'signup' (New Student Registration Only)
    if (existing) {
      return redirectWithOAuthError(origin, 'account_already_exists', 'login');
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const baseSlug =
        cleanEmail
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
          .slice(0, 20) || 'student';

      let username = baseSlug;
      for (let attempt = 0; attempt < 8; attempt++) {
        const taken = await tx.user.findUnique({
          where: { username },
          select: { id: true },
        });
        if (!taken) break;
        username = `${baseSlug}_${crypto.randomBytes(2).toString('hex')}`;
      }

      const university = inferUniversityFromEmail(cleanEmail);

      const createdUser = await tx.user.create({
        data: {
          email: cleanEmail,
          canonicalEmail,
          emailVerified: true,
          passwordHash: null,
          googleId,
          avatarUrl: rawPicture,
          avatarActive: Boolean(rawPicture),
          authProvider: 'GOOGLE',
          fullName,
          username,
          university,
          planTier: PlanTier.STUDENT_FREE,
          availableCredits: 5.0,
          reservedCredits: 0.0,
          earnedLifetime: 0.0,
          spentLifetime: 0.0,
          completedExchanges: 0,
          streakDays: 1,
          offeredSkills: [],
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: createdUser.id,
          counterpartyInitials: 'ET',
          counterpartyName: 'Echo Time Protocol',
          title: 'Starter credits (Google Sign-Up)',
          availableDelta: 5.0,
          reservedDelta: 0.0,
          typeLabel: 'Protocol Grant',
        },
      });

      return createdUser;
    });

    const sessionToken = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const welcomeUrl = new URL(safeNext, origin);
    welcomeUrl.searchParams.set('welcome', 'new');
    const response = NextResponse.redirect(welcomeUrl);
    setSessionCookie(response, sessionToken);
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return redirectWithOAuthError(origin, 'oauth_failed', intent);
  }
}
