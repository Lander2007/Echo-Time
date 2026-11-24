import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AgreementStage, MessageSenderType } from '@prisma/client';

export async function PATCH(
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

    if (room.stage !== AgreementStage.NEGOTIATING) {
      return NextResponse.json(
        { error: 'Terms can only be modified while in NEGOTIATING stage' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { goal, format, durationHrs, creditsPerHr } = body;

    const newVersion = room.termsVersion + 1;

    const [updatedRoom] = await prisma.$transaction([
      prisma.agreementRoom.update({
        where: { id },
        data: {
          ...(goal !== undefined ? { goal } : {}),
          ...(format !== undefined ? { format } : {}),
          ...(durationHrs !== undefined ? { durationHrs: Number(durationHrs) } : {}),
          ...(creditsPerHr !== undefined ? { creditsPerHr: Number(creditsPerHr) } : {}),
          termsVersion: newVersion,
        },
        include: {
          requester: { select: { id: true, fullName: true, username: true } },
          provider: { select: { id: true, fullName: true, username: true } },
        },
      }),
      prisma.agreementMessage.create({
        data: {
          roomId: id,
          senderType: MessageSenderType.SYSTEM,
          authorLabel: 'SYSTEM PROTOCOL',
          body: `Agreement terms updated to Version ${newVersion} by ${user.fullName}.`,
        },
      }),
    ]);

    return NextResponse.json({ agreement: updatedRoom });
  } catch (error) {
    console.error('Failed to update agreement terms:', error);
    return NextResponse.json({ error: 'Failed to update agreement terms' }, { status: 500 });
  }
}
