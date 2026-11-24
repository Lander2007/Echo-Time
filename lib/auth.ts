import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'echotime-super-secret-jwt-key-2026-production-32chars'
);

export const SESSION_COOKIE_NAME = 'et_session';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
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
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        university: true,
        bio: true,
        availability: true,
        avatarActive: true,
        planTier: true,
        streakDays: true,
        availableCredits: true,
        reservedCredits: true,
        earnedLifetime: true,
        spentLifetime: true,
        completedExchanges: true,
        offeredSkills: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}
