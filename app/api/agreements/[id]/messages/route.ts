import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { MessageSenderType } from '@prisma/client';

export async function POST(
  req: NextRequest,
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
    });

    if (!room) {
      return NextResponse.json({ error: 'Agreement room not found' }, { status: 404 });
    }

    if (room.requesterId !== user.id && room.providerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { body } = await req.json();
    if (!body || !body.trim()) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    }

    const message = await prisma.agreementMessage.create({
      data: {
        roomId: id,
        senderId: user.id,
        senderType: MessageSenderType.ME,
        authorLabel: user.fullName,
        body: body.trim(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Failed to post message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
