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

    const total = room.durationHrs * room.creditsPerHr;

    // Transition 1: NEGOTIATING -> CONFIRMED_ESCROWED
    if (room.stage === AgreementStage.NEGOTIATING) {
      // Re-fetch fresh requester balance
      const requester = await prisma.user.findUnique({
        where: { id: room.requesterId },
      });

      if (!requester || requester.availableCredits < total) {
        return NextResponse.json(
          {
            error: `Insufficient available credits. Required: ${total.toFixed(2)} ECHO, Available: ${
              requester?.availableCredits.toFixed(2) || '0.00'
            } ECHO.`,
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        // Deduct from available, add to reserved
        await tx.user.update({
          where: { id: room.requesterId },
          data: {
            availableCredits: { decrement: total },
            reservedCredits: { increment: total },
          },
        });

        // Record Escrow Lock transaction
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
            title: `Escrow Lock: ${room.title}`,
            availableDelta: -total,
            reservedDelta: total,
            typeLabel: 'ESCROW_LOCK',
          },
        });

        // Advance room stage
        const updated = await tx.agreementRoom.update({
          where: { id: room.id },
          data: { stage: AgreementStage.CONFIRMED_ESCROWED },
          include: {
            requester: { select: { id: true, fullName: true, username: true } },
            provider: { select: { id: true, fullName: true, username: true } },
            messages: { orderBy: { createdAt: 'asc' } },
          },
        });

        // Post protocol message
        await tx.agreementMessage.create({
          data: {
            roomId: room.id,
            senderType: MessageSenderType.SYSTEM,
            authorLabel: 'SYSTEM PROTOCOL',
            body: `1.00 HR = 1.00 ECHO reciprocal parity locked. Escrow funds (${total.toFixed(
              2
            )} ECHO) secured in smart ledger.`,
          },
        });

        return updated;
      });

      return NextResponse.json({
        agreement: result,
        message: 'Escrow locked successfully.',
      });
    }

    // Transition 2: CONFIRMED_ESCROWED -> DELIVERED
    if (room.stage === AgreementStage.CONFIRMED_ESCROWED) {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.agreementRoom.update({
          where: { id: room.id },
          data: { stage: AgreementStage.DELIVERED },
          include: {
            requester: { select: { id: true, fullName: true, username: true } },
            provider: { select: { id: true, fullName: true, username: true } },
            messages: { orderBy: { createdAt: 'asc' } },
          },
        });

        await tx.agreementMessage.create({
          data: {
            roomId: room.id,
            senderType: MessageSenderType.SYSTEM,
            authorLabel: 'SYSTEM PROTOCOL',
            body: 'Service delivery marked as complete. Counterparty awaiting final verification & credit release.',
          },
        });

        return updated;
      });

      return NextResponse.json({
        agreement: result,
        message: 'Marked as delivered.',
      });
    }

    // Transition 3: DELIVERED -> COMPLETED
    if (room.stage === AgreementStage.DELIVERED) {
      const result = await prisma.$transaction(async (tx) => {
        // Requester: release reserved credits, add to spentLifetime, increment completedExchanges
        await tx.user.update({
          where: { id: room.requesterId },
          data: {
            reservedCredits: { decrement: total },
            spentLifetime: { increment: total },
            completedExchanges: { increment: 1 },
          },
        });

        // Provider: credit available balance, add to earnedLifetime, increment completedExchanges
        await tx.user.update({
          where: { id: room.providerId },
          data: {
            availableCredits: { increment: total },
            earnedLifetime: { increment: total },
            completedExchanges: { increment: 1 },
          },
        });

        const reqInitials = room.provider.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const provInitials = room.requester.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        // Record ledger transactions for both parties
        await tx.walletTransaction.create({
          data: {
            userId: room.requesterId,
            roomId: room.id,
            counterpartyInitials: reqInitials,
            counterpartyName: room.provider.fullName,
            title: `Settled: ${room.title}`,
            availableDelta: 0,
            reservedDelta: -total,
            typeLabel: 'ESCROW_RELEASE',
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: room.providerId,
            roomId: room.id,
            counterpartyInitials: provInitials,
            counterpartyName: room.requester.fullName,
            title: `Earned: ${room.title}`,
            availableDelta: total,
            reservedDelta: 0,
            typeLabel: 'TRANSFER_IN',
          },
        });

        const updated = await tx.agreementRoom.update({
          where: { id: room.id },
          data: { stage: AgreementStage.COMPLETED },
          include: {
            requester: { select: { id: true, fullName: true, username: true } },
            provider: { select: { id: true, fullName: true, username: true } },
            messages: { orderBy: { createdAt: 'asc' } },
          },
        });

        await tx.agreementMessage.create({
          data: {
            roomId: room.id,
            senderType: MessageSenderType.SYSTEM,
            authorLabel: 'SYSTEM PROTOCOL',
            body: `Agreement completed! ${total.toFixed(
              2
            )} ECHO successfully transferred to provider. Reciprocal parity exchange finalized.`,
          },
        });

        return updated;
      });

      return NextResponse.json({
        agreement: result,
        message: 'Agreement completed and credits settled.',
      });
    }

    return NextResponse.json(
      { error: `Cannot advance agreement from current stage: ${room.stage}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to advance agreement stage:', error);
    return NextResponse.json({ error: 'Failed to advance agreement stage' }, { status: 500 });
  }
}
