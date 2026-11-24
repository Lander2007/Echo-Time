import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AgreementStage, MessageSenderType } from '@prisma/client';

export async function POST(
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
        requester: true,
        provider: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Agreement room not found' }, { status: 404 });
    }

    if (room.requesterId !== user.id && room.providerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      room.stage === AgreementStage.COMPLETED ||
      room.stage === AgreementStage.CANCELLED
    ) {
      return NextResponse.json(
        { error: `Cannot cancel an agreement that is already ${room.stage}` },
        { status: 400 }
      );
    }

    const total = room.durationHrs * room.creditsPerHr;

    const result = await prisma.$transaction(async (tx) => {
      // If escrow was locked, refund reserved back to available
      if (room.stage === AgreementStage.CONFIRMED_ESCROWED) {
        await tx.user.update({
          where: { id: room.requesterId },
          data: {
            availableCredits: { increment: total },
            reservedCredits: { decrement: total },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: room.requesterId,
            roomId: room.id,
            counterpartyInitials: room.provider.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            counterpartyName: room.provider.fullName,
            title: `Escrow Refund: ${room.title}`,
            availableDelta: total,
            reservedDelta: -total,
            typeLabel: 'ESCROW_REFUND',
          },
        });
      }

      const updated = await tx.agreementRoom.update({
        where: { id: room.id },
        data: { stage: AgreementStage.CANCELLED },
      });

      await tx.agreementMessage.create({
        data: {
          roomId: room.id,
          senderType: MessageSenderType.SYSTEM,
          authorLabel: 'SYSTEM PROTOCOL',
          body: `Agreement cancelled by ${user.fullName}. Any locked escrow credits have been refunded.`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      agreement: result,
      message: 'Agreement cancelled successfully.',
    });
  } catch (error) {
    console.error('Failed to cancel agreement:', error);
    return NextResponse.json({ error: 'Failed to cancel agreement' }, { status: 500 });
  }
}
