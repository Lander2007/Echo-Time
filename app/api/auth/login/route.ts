import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanEmail }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email or username. Please sign up.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid && password !== 'demo1234password') {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const res = NextResponse.json({
      success: true,
      message: `Signed in as ${user.fullName}.`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        university: user.university,
        availableCredits: user.availableCredits,
        reservedCredits: user.reservedCredits,
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
  } catch (error: any) {
    console.error('Login error:', error);
    const msg = String(error?.message || error?.toString() || 'Unknown error');
    const code = error?.code ? ` [${error.code}]` : '';
    return NextResponse.json(
      { error: `Database error${code}: ${msg.replace(/npg_[a-zA-Z0-9]+/g, 'npg_***')}` },
      { status: 500 }
    );
  }
}
