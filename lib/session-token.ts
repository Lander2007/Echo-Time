import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'et_session';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
}

/**
 * Shared secret resolver identical across Edge Middleware, Server Components, and API routes.
 */
export function getJwtSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    'echotime-super-secret-jwt-key-2026-production-32chars';
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    const rawUserId = payload.userId ?? payload.sub;
    if (typeof rawUserId !== 'string' || !rawUserId) {
      return null;
    }
    return {
      userId: rawUserId,
      email: typeof payload.email === 'string' ? payload.email : '',
      username: typeof payload.username === 'string' ? payload.username : '',
      ...(typeof payload.role === 'string' ? { role: payload.role } : {}),
    };
  } catch {
    return null;
  }
}

/** Validates internal post-login redirect targets to prevent Open Redirect vulnerabilities. */
export function getSafeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return '/dashboard';
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.startsWith('/login') ||
    trimmed.startsWith('/signup')
  ) {
    return '/dashboard';
  }
  return trimmed;
}
