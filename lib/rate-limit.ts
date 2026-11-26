import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  buckets: Map<string, number[]>;
  lastCleanupAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  __echotimeRateLimit?: RateLimitStore;
};

const store: RateLimitStore =
  globalForRateLimit.__echotimeRateLimit ?? {
    buckets: new Map<string, number[]>(),
    lastCleanupAt: Date.now(),
  };

if (!globalForRateLimit.__echotimeRateLimit) {
  globalForRateLimit.__echotimeRateLimit = store;
}

const CLEANUP_INTERVAL_MS = 60_000;
const MAX_STALE_WINDOW_MS = 15 * 60_000;

function cleanupExpiredBuckets(now: number): void {
  if (now - store.lastCleanupAt < CLEANUP_INTERVAL_MS && store.buckets.size < 2000) {
    return;
  }
  store.lastCleanupAt = now;
  for (const [key, timestamps] of store.buckets.entries()) {
    const fresh = timestamps.filter((ts) => now - ts < MAX_STALE_WINDOW_MS);
    if (fresh.length === 0) {
      store.buckets.delete(key);
    } else if (fresh.length !== timestamps.length) {
      store.buckets.set(key, fresh);
    }
  }
}

/** Extract client IP safely across localhost and Vercel / reverse proxy deployments. */
export function getClientIp(req: NextRequest | Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) return firstHop;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

/**
 * Sliding-window in-memory rate limiter (zero external Redis dependencies).
 */
export function checkRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: true; remaining: number } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const windowStart = now - opts.windowMs;
  const existing = store.buckets.get(opts.key) ?? [];
  const active = existing.filter((ts) => ts > windowStart);

  if (active.length >= opts.limit) {
    const oldestInWindow = active[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldestInWindow + opts.windowMs - now) / 1000));
    store.buckets.set(opts.key, active);
    return { allowed: false, retryAfterSec };
  }

  active.push(now);
  store.buckets.set(opts.key, active);
  return { allowed: true, remaining: Math.max(0, opts.limit - active.length) };
}

export function rateLimitResponse(retryAfterSec: number, message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || `Too many requests. Please try again in ${retryAfterSec} seconds.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
      },
    }
  );
}
