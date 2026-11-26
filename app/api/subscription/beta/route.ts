import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { readJsonBody, sanitizeText, toErrorResponse, ValidationError } from '@/lib/validation';

const PLAN_KEY_REGEX = /^[a-z0-9_-]{2,64}$/i;

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
    return toErrorResponse(error, 'Failed to fetch beta interests');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody(req);
    const planKey = sanitizeText(body.planKey, {
      fieldName: 'planKey',
      minLen: 2,
      maxLen: 64,
      collapseNewlines: true,
    });

    if (!PLAN_KEY_REGEX.test(planKey)) {
      throw new ValidationError('Invalid beta plan key format.');
    }

    // Toggle interest cleanly for the authenticated session user only
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
    return toErrorResponse(error, 'Failed to toggle beta subscription');
  }
}
