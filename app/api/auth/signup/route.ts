import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, university } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const username =
      cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') || `student_${Date.now()}`;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email or username already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Atomic transaction: create user and issue 5.00 ECHO starter grant
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          fullName: fullName.trim(),
          username,
          university: university?.trim() || 'Accredited University',
          planTier: PlanTier.STUDENT_FREE,
          availableCredits: 5.0,
          reservedCredits: 0.0,
          earnedLifetime: 0.0,
          spentLifetime: 0.0,
          completedExchanges: 0,
          streakDays: 1,
          avatarActive: true,
          offeredSkills: [],
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          counterpartyInitials: 'ET',
          counterpartyName: 'Echo Time Protocol',
          title: 'Founding Student Seed Grant',
          availableDelta: 5.0,
          reservedDelta: 0.0,
          typeLabel: 'Protocol Grant',
        },
      });

      return user;
    });

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const res = NextResponse.json(
      {
        success: true,
        message: `Account created for ${newUser.fullName} (+5.00 ECHO starter grant minted).`,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          username: newUser.username,
          availableCredits: newUser.availableCredits,
          reservedCredits: newUser.reservedCredits,
        },
      },
      { status: 201 }
    );

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create student account in database.' },
      { status: 500 }
    );
  }
}
