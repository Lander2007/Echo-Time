import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        availableCredits: true,
        reservedCredits: true,
        earnedLifetime: true,
        spentLifetime: true,
        completedExchanges: true,
        streakDays: true,
        planTier: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      telemetry: {
        availableCredits: freshUser.availableCredits,
        reservedCredits: freshUser.reservedCredits,
        earnedLifetime: freshUser.earnedLifetime,
        spentLifetime: freshUser.spentLifetime,
        completedExchanges: freshUser.completedExchanges,
        streakDays: freshUser.streakDays,
        planTier: freshUser.planTier,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        initials: t.counterpartyInitials,
        title: t.title,
        counterparty: t.counterpartyName,
        date: t.createdAt.toISOString().split('T')[0],
        availableDelta: t.availableDelta,
        reservedDelta: t.reservedDelta,
        type: t.typeLabel,
      })),
    });
  } catch (error) {
    console.error('Wallet telemetry error:', error);
    return NextResponse.json({ error: 'Failed to retrieve wallet from database.' }, { status: 500 });
  }
}
