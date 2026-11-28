import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { createUserNotification } from '@/lib/notifications';
import { ConflictError, toErrorResponse } from '@/lib/validation';
import { AgreementStage, MessageSenderType } from '@prisma/client';

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ET'
  );
}

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
      select: {
        id: true,
        title: true,
        requesterId: true,
        providerId: true,
        durationHrs: true,
        creditsPerHr: true,
        stage: true,
        provider: { select: { id: true, fullName: true } },
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
      throw new ConflictError(`Cannot cancel an agreement that is already ${room.stage}`);
    }

    const total = room.durationHrs * room.creditsPerHr;

    const result = await prisma.$transaction(async (tx) => {
      // Atomically claim escrow-bearing stages first so escrowed funds in CONFIRMED_ESCROWED or DELIVERED
      // are strictly refunded at most once even under concurrent double-click cancellation.
      let shouldRefundEscrow = false;

      const escrowedLock = await tx.agreementRoom.updateMany({
        where: {
          id: room.id,
          stage: { in: [AgreementStage.CONFIRMED_ESCROWED, AgreementStage.DELIVERED] },
        },
        data: { stage: AgreementStage.CANCELLED },
      });

      if (escrowedLock.count === 1) {
        shouldRefundEscrow = true;
      } else {
        const negotiatingLock = await tx.agreementRoom.updateMany({
          where: {
            id: room.id,
            stage: AgreementStage.NEGOTIATING,
          },
          data: { stage: AgreementStage.CANCELLED },
        });
        if (negotiatingLock.count !== 1) {
          throw new ConflictError('Agreement state has already changed. Please refresh.');
        }
      }

      if (shouldRefundEscrow) {
        const refund = await tx.user.updateMany({
          where: {
            id: room.requesterId,
            reservedCredits: { gte: total },
          },
          data: {
            availableCredits: { increment: total },
            reservedCredits: { decrement: total },
          },
        });
        if (refund.count !== 1) {
          throw new ConflictError('Escrow refund could not be verified. Please refresh.');
        }

        await tx.walletTransaction.create({
          data: {
            userId: room.requesterId,
            roomId: room.id,
            counterpartyInitials: getInitials(room.provider.fullName),
            counterpartyName: room.provider.fullName,
            title: `Escrow Refund: ${room.title}`,
            availableDelta: total,
            reservedDelta: -total,
            typeLabel: 'ESCROW_REFUND',
          },
        });
      }

      const counterpartyId = user.id === room.requesterId ? room.providerId : room.requesterId;
      await createUserNotification(tx, {
        userId: counterpartyId,
        type: 'AGREEMENT_CANCELLED',
        title: `Agreement cancelled: ${room.title}`,
        body: shouldRefundEscrow
          ? `${user.fullName} cancelled "${room.title}". ${total.toFixed(2)} ECHO was refunded from escrow.`
          : `${user.fullName} cancelled the agreement room "${room.title}".`,
        href: `/agreement?roomId=${room.id}`,
        roomId: room.id,
        actorName: user.fullName,
      });

      const updated = await tx.agreementRoom.findUnique({
        where: { id: room.id },
        include: {
          requester: { select: { id: true, fullName: true, username: true } },
          provider: { select: { id: true, fullName: true, username: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      const sysMsg = await tx.agreementMessage.create({
        data: {
          roomId: room.id,
          senderType: MessageSenderType.SYSTEM,
          authorLabel: 'SYSTEM PROTOCOL',
          body: `Agreement cancelled by ${user.fullName}. Any locked escrow credits have been refunded.`,
        },
      });

      return updated ? { ...updated, messages: [...updated.messages, sysMsg] } : null;
    });

    return NextResponse.json({
      agreement: result,
      message: 'Agreement cancelled successfully.',
    });
  } catch (error) {
    return toErrorResponse(error, 'Failed to cancel agreement');
  }
}
