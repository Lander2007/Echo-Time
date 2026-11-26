import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getMaskedHostInfo(rawDbUrl: string): { maskedHost: string; isLocalhost: boolean; isConfigured: boolean } {
  const isConfigured = Boolean(rawDbUrl);
  const isLocalhost = rawDbUrl.includes('localhost') || rawDbUrl.includes('127.0.0.1');
  let maskedHost = 'unconfigured';

  if (rawDbUrl) {
    try {
      const parsed = new URL(rawDbUrl);
      const firstLabel = parsed.hostname.split('.')[0] || parsed.hostname;
      maskedHost =
        firstLabel.length > 14 ? `${firstLabel.slice(0, 14)}...` : `${firstLabel}...`;
    } catch {
      maskedHost = 'configured';
    }
  }

  return { maskedHost, isLocalhost, isConfigured };
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const rawDbUrl =
    dbUrl && dbUrl.includes('ep-red-sound') && directUrl
      ? directUrl
      : dbUrl || directUrl || '';

  const { maskedHost, isLocalhost, isConfigured } = getMaskedHostInfo(rawDbUrl);

  try {
    const [users, listings] = await Promise.all([
      prisma.user.count(),
      prisma.skillListing.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      host: maskedHost,
      environment: process.env.NODE_ENV,
      isLocalhost,
      stats: {
        users,
        listings,
      },
      message: 'PostgreSQL database is connected and operational.',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        host: maskedHost,
        isLocalhost,
        isConfigured,
        message: 'Database connectivity check failed.',
      },
      { status: 500 }
    );
  }
}
