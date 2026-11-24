import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interests = await prisma.betaInterest.findMany({
      where: { userId: user.id },
      select: { planKey: true },
    });

    return NextResponse.json({ plans: interests.map((i) => i.planKey) });
  } catch (error) {
    console.error('Failed to fetch beta interests:', error);
    return NextResponse.json({ error: 'Failed to fetch beta interests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planKey } = await req.json();
    if (!planKey) {
      return NextResponse.json({ error: 'Missing planKey' }, { status: 400 });
    }

    // Toggle interest
    const existing = await prisma.betaInterest.findUnique({
      where: {
        userId_planKey: {
          userId: user.id,
          planKey,
        },
      },
    });

    if (existing) {
      await prisma.betaInterest.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ subscribed: false, planKey });
    } else {
      await prisma.betaInterest.create({
        data: {
          userId: user.id,
          planKey,
        },
      });
      return NextResponse.json({ subscribed: true, planKey });
    }
  } catch (error) {
    console.error('Failed to toggle beta subscription:', error);
    return NextResponse.json({ error: 'Failed to toggle beta subscription' }, { status: 500 });
  }
}
