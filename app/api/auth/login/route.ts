import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  DUMMY_BCRYPT_HASH,
  verifyPassword,
  createSessionToken,
  serializeSafeUser,
  setSessionCookie,
} from '@/lib/auth';
import { canonicalizeEmail } from '@/lib/email';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { readJsonBody, sanitizeText, toErrorResponse } from '@/lib/validation';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit({
      key: `login:${ip}`,
      limit: MAX_LOGIN_ATTEMPTS_PER_WINDOW,
      windowMs: LOGIN_WINDOW_MS,
    });
    if (!rate.allowed) {
      return rateLimitResponse(
        rate.retryAfterSec,
        'Too many sign-in attempts. Please wait a few minutes and try again.'
      );
    }

    const body = await readJsonBody(req);
    const rawIdentifier = sanitizeText(body.email, {
      fieldName: 'Email or username',
      minLen: 1,
      maxLen: 254,
      collapseNewlines: true,
    });
    const password = sanitizeText(body.password, {
      fieldName: 'Password',
      minLen: 1,
      maxLen: 128,
    });

    const cleanIdentifier = rawIdentifier.toLowerCase();
    const isEmailInput = cleanIdentifier.includes('@');
    const canonical = isEmailInput ? canonicalizeEmail(cleanIdentifier) : null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
          ...(canonical ? [{ canonicalEmail: canonical }] : []),
        ],
      },
    });

    // Always run bcrypt verification (against a valid dummy hash when needed) to prevent timing enumeration
    if (!user || !user.passwordHash) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Backfill canonicalEmail opportunistically for legacy accounts without breaking on conflicts
    if (!user.canonicalEmail && user.email.includes('@')) {
      const targetCanonical = canonicalizeEmail(user.email);
      await prisma.user
        .updateMany({
          where: { id: user.id, canonicalEmail: null },
          data: { canonicalEmail: targetCanonical },
        })
        .catch(() => {});
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const res = NextResponse.json({
      success: true,
      message: `Signed in as ${user.fullName}.`,
      user: serializeSafeUser(user),
    });

    setSessionCookie(res, token);
    return res;
  } catch (error) {
    return toErrorResponse(error, 'Unable to sign in right now. Please try again.');
  }
}
