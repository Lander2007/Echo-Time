import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/session-token';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/explore',
  '/saved',
  '/agreement',
  '/wallet',
  '/community',
  '/subscription',
  '/profile',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    const nextPath = `${pathname}${search}`;
    // Preserve intended destination safely (relative path only)
    if (nextPath.startsWith('/') && !nextPath.startsWith('//') && !nextPath.includes('\\')) {
      loginUrl.searchParams.set('next', nextPath);
    }

    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }
    return response;
  }

  // Prevent browser Back-button cache from exposing protected pages after Logout
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/explore/:path*',
    '/saved/:path*',
    '/agreement/:path*',
    '/wallet/:path*',
    '/community/:path*',
    '/subscription/:path*',
    '/profile/:path*',
  ],
};
