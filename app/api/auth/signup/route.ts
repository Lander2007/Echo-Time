import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  createSessionToken,
  serializeSafeUser,
  setSessionCookie,
} from '@/lib/auth';
import { canonicalizeEmail, isValidEmailFormat } from '@/lib/email';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import {
  ConflictError,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
import { PlanTier } from '@prisma/client';

const SIGNUP_WINDOW_MS = 15 * 60 * 1000;
const MAX_SIGNUPS_PER_WINDOW = 6;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit({
      key: `signup:${ip}`,
      limit: MAX_SIGNUPS_PER_WINDOW,
      windowMs: SIGNUP_WINDOW_MS,
    });
    if (!rate.allowed) {
      return rateLimitResponse(
        rate.retryAfterSec,
        'Too many account registration attempts. Please try again later.'
      );
    }

    const body = await readJsonBody(req);
    const rawEmail = sanitizeText(body.email, {
      fieldName: 'Email',
      minLen: 5,
      maxLen: 254,
      collapseNewlines: true,
    });
    if (!isValidEmailFormat(rawEmail)) {
      throw new ValidationError('Please provide a valid email address.');
    }

    const password = sanitizeText(body.password, {
      fieldName: 'Password',
      minLen: 6,
      maxLen: 128,
    });
    const fullName = sanitizeText(body.fullName, {
      fieldName: 'Full name',
      minLen: 2,
      maxLen: 80,
      collapseNewlines: true,
    });
    const university = sanitizeText(body.university, {
      fieldName: 'University',
      minLen: 0,
      maxLen: 120,
      defaultValue: 'Accredited University',
      collapseNewlines: true,
    });

    const cleanEmail = rawEmail.toLowerCase();
    const canonicalEmail = canonicalizeEmail(cleanEmail);

    // Block exact email duplicates as well as +tag / Gmail dot-trick Sybil farming
    const existingByEmail = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { canonicalEmail }],
      },
      select: { id: true },
    });

    if (existingByEmail) {
      throw new ConflictError('An account with this email already exists. Please log in.');
    }

    const passwordHash = await hashPassword(password);

    // Atomic transaction: create user with hardcoded server defaults and 5.00 ECHO starter grant
    const newUser = await prisma.$transaction(async (tx) => {
      const baseSlug =
        cleanEmail
          .split('@')[0]
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

      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          canonicalEmail,
          emailVerified: false,
          passwordHash,
          authProvider: 'EMAIL',
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
          avatarActive: false,
          offeredSkills: [],
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          counterpartyInitials: 'ET',
          counterpartyName: 'Echo Time Protocol',
          title: 'Founding Student Seed Grant',
          availableDelta: 5.0,
          reservedDelta: 0.0,
          typeLabel: 'Protocol Grant',
        },
      });

      return user;
    });

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const res = NextResponse.json(
      {
        success: true,
        message: `Account created for ${newUser.fullName} (+5.00 ECHO starter grant minted).`,
        user: serializeSafeUser(newUser),
      },
      { status: 201 }
    );

    setSessionCookie(res, token);
    return res;
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }
    return toErrorResponse(error, 'Unable to create account right now. Please try again.');
  }
}
