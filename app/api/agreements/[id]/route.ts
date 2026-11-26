import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { toErrorResponse } from '@/lib/validation';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const room = await prisma.agreementRoom.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, fullName: true, username: true, university: true, planTier: true },
        },
        provider: {
          select: { id: true, fullName: true, username: true, university: true, planTier: true },
        },
        listing: {
          select: { id: true, title: true, creditsPerHr: true, category: true, format: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Agreement room not found' }, { status: 404 });
    }

    if (room.requesterId !== user.id && room.providerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ agreement: room });
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch agreement room');
  }
}
