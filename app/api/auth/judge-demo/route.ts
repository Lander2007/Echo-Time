import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken, hashPassword, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const DEMO_EMAIL = 'khaled@echotime.edu';
    let user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!user) {
      const demoHash = await hashPassword('demo1234password');
      user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            fullName: 'Khaled Amr Ahmeed',
            username: 'khaled',
            email: DEMO_EMAIL,
            passwordHash: demoHash,
            university: 'Cairo University — Computer Engineering',
            bio: 'Full-stack software engineer & CS senior. Passionate about Next.js, distributed systems, and reciprocal student economies.',
            availability: 'Mon, Wed, Fri 4:00 PM — 8:00 PM EET',
            avatarActive: true,
            streakDays: 3,
            availableCredits: 6.0,
            reservedCredits: 0.0,
            earnedLifetime: 12.0,
            spentLifetime: 6.0,
            completedExchanges: 4,
            offeredSkills: [
              'Next.js 15 & React 19',
              'TypeScript Architecture',
              'Prisma & PostgreSQL',
              'Tailwind CSS Systems',
            ],
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: createdUser.id,
            counterpartyInitials: 'ET',
            counterpartyName: 'Echo Time Protocol',
            title: 'Founding Student Seed Grant',
            availableDelta: 5.0,
            reservedDelta: 0.0,
            typeLabel: 'Protocol Grant',
          },
        });

        return createdUser;
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Logged in as Competition Judge Demo User (Khaled Amr Ahmeed).',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        university: user.university,
        availableCredits: user.availableCredits,
        reservedCredits: user.reservedCredits,
        completedExchanges: user.completedExchanges,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('Judge Demo Login Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate as Judge Demo User.' },
      { status: 500 }
    );
  }
}
