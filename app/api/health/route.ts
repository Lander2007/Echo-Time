import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rawDbUrl = process.env.DATABASE_URL || '';
  const isLocalhost = rawDbUrl.includes('localhost') || rawDbUrl.includes('127.0.0.1');
  const isConfigured = Boolean(rawDbUrl);

  let dbHost = 'unknown';
  let dbName = 'unknown';
  try {
    const parsed = new URL(rawDbUrl);
    dbHost = parsed.host;
    dbName = parsed.pathname.replace('/', '');
  } catch {}

  try {
    const userCount = await prisma.user.count();
    const listingCount = await prisma.skillListing.count();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      dbHost,
      dbName,
      environment: process.env.NODE_ENV,
      isLocalhost,
      stats: {
        users: userCount,
        listings: listingCount,
      },
      message: 'PostgreSQL database is connected and tables exist.',
    });
  } catch (error: any) {
    const msg = String(error?.message || '');
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        dbHost,
        dbName,
        isLocalhost,
        isConfigured,
        errorCode: error?.code || 'UNKNOWN',
        diagnostic: isLocalhost
          ? 'DATABASE_URL in Vercel is pointing to localhost! Vercel runs in the cloud and cannot connect to your laptop. Set a cloud PostgreSQL URL (e.g. Neon.tech or Supabase) in Vercel Project Settings.'
          : msg.includes('does not exist') || msg.includes('P2021')
          ? 'Cloud database is connected, but tables do not exist yet. Please run "npx prisma db push" against your cloud database.'
          : `Database error: ${error?.message}`,
      },
      { status: 500 }
    );
  }
}
