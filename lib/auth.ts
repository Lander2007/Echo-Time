import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'echotime-super-secret-jwt-key-2026-production-32chars'
);

export const SESSION_COOKIE_NAME = 'et_session';

/** Syntactically valid 10-round bcrypt hash used to equalize timing on unknown-email logins. */
export const DUMMY_BCRYPT_HASH =
  '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
}

/** Safe User column projection — strictly omits passwordHash, googleId, and canonicalEmail. */
export const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  emailVerified: true,
  university: true,
  bio: true,
  availability: true,
  avatarActive: true,
  avatarUrl: true,
  authProvider: true,
  planTier: true,
  streakDays: true,
  availableCredits: true,
  reservedCredits: true,
  earnedLifetime: true,
  spentLifetime: true,
  completedExchanges: true,
  offeredSkills: true,
  createdAt: true,
} as const;

export function serializeSafeUser(user: {
  id: string;
  email: string;
  emailVerified?: boolean;
  fullName: string;
  username: string;
  university: string;
  avatarUrl: string | null;
  authProvider: string;
  availableCredits: number;
  reservedCredits: number;
  completedExchanges?: number;
}) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    fullName: user.fullName,
    username: user.username,
    university: user.university,
    avatarUrl: user.avatarUrl ?? null,
    authProvider: user.authProvider || 'EMAIL',
    availableCredits: user.availableCredits,
    reservedCredits: user.reservedCredits,
    ...(typeof user.completedExchanges === 'number'
      ? { completedExchanges: user.completedExchanges }
      : {}),
  };
}

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: SAFE_USER_SELECT,
    });

    return user;
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}
