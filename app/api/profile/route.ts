import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
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

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, bio, university, availability, offeredSkills, avatarActive } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(university !== undefined ? { university } : {}),
        ...(availability !== undefined ? { availability } : {}),
        ...(offeredSkills !== undefined && Array.isArray(offeredSkills) ? { offeredSkills } : {}),
        ...(avatarActive !== undefined ? { avatarActive: Boolean(avatarActive) } : {}),
      },
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
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
