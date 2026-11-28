import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { createUserNotification } from '@/lib/notifications';
import {
  ConflictError,
  InsufficientCreditsError,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
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

const SAFE_ROOM_INCLUDE = {
  requester: { select: { id: true, fullName: true, username: true } },
  provider: { select: { id: true, fullName: true, username: true } },
  messages: { orderBy: { createdAt: 'asc' as const } },
};

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
        requester: { select: { id: true, fullName: true } },
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
      !Number.isInteger(room.durationHrs) ||
      room.durationHrs < 1 ||
      !Number.isInteger(room.creditsPerHr) ||
      room.creditsPerHr < 1
    ) {
      throw new ValidationError('Invalid agreement credit terms.');
    }

    const total = room.durationHrs * room.creditsPerHr;

    // Transition 1: NEGOTIATING -> CONFIRMED_ESCROWED
    if (room.stage === AgreementStage.NEGOTIATING) {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic stage transition guard prevents double-locking on concurrent requests
        const stageLock = await tx.agreementRoom.updateMany({
          where: { id: room.id, stage: AgreementStage.NEGOTIATING },
          data: { stage: AgreementStage.CONFIRMED_ESCROWED },
        });
        if (stageLock.count !== 1) {
          throw new ConflictError('Agreement state has already changed. Please refresh.');
        }

        // Atomic SQL-level balance constraint prevents double-spending across parallel requests
        const debit = await tx.user.updateMany({
          where: {
            id: room.requesterId,
            availableCredits: { gte: total },
          },
          data: {
            availableCredits: { decrement: total },
            reservedCredits: { increment: total },
          },
        });
        if (debit.count !== 1) {
          throw new InsufficientCreditsError(
            `Insufficient available ECHO credits. Required: ${total.toFixed(2)} ECHO.`
          );
        }

        await tx.walletTransaction.create({
          data: {
            userId: room.requesterId,
            roomId: room.id,
            counterpartyInitials: getInitials(room.provider.fullName),
            counterpartyName: room.provider.fullName,
            title: `Escrow Lock: ${room.title}`,
            availableDelta: -total,
            reservedDelta: total,
            typeLabel: 'ESCROW_LOCK',
          },
        });

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

        const counterpartyId = user.id === room.requesterId ? room.providerId : room.requesterId;
        await createUserNotification(tx, {
          userId: counterpartyId,
          type: 'ESCROW_LOCKED',
          title: `Escrow locked: ${room.title}`,
          body: `${user.fullName} confirmed agreement terms and locked ${total.toFixed(2)} ECHO in escrow.`,
          href: `/agreement?roomId=${room.id}`,
          roomId: room.id,
          actorName: user.fullName,
        });

        return tx.agreementRoom.findUnique({
          where: { id: room.id },
          include: SAFE_ROOM_INCLUDE,
        });
      });

      return NextResponse.json({
        agreement: result,
        message: 'Escrow locked successfully.',
      });
    }

    // Transition 2: CONFIRMED_ESCROWED -> DELIVERED
    if (room.stage === AgreementStage.CONFIRMED_ESCROWED) {
      const result = await prisma.$transaction(async (tx) => {
        const stageLock = await tx.agreementRoom.updateMany({
          where: { id: room.id, stage: AgreementStage.CONFIRMED_ESCROWED },
          data: { stage: AgreementStage.DELIVERED },
        });
        if (stageLock.count !== 1) {
          throw new ConflictError('Agreement state has already changed. Please refresh.');
        }

        await tx.agreementMessage.create({
          data: {
            roomId: room.id,
            senderType: MessageSenderType.SYSTEM,
            authorLabel: 'SYSTEM PROTOCOL',
            body: 'Service delivery marked as complete. Counterparty awaiting final verification & credit release.',
          },
        });

        const counterpartyId = user.id === room.requesterId ? room.providerId : room.requesterId;
        await createUserNotification(tx, {
          userId: counterpartyId,
          type: 'DELIVERY_MARKED',
          title: `Delivery submitted: ${room.title}`,
          body: `${user.fullName} marked the session as delivered. Verify completion to settle ${total.toFixed(2)} ECHO.`,
          href: `/agreement?roomId=${room.id}`,
          roomId: room.id,
          actorName: user.fullName,
        });

        return tx.agreementRoom.findUnique({
          where: { id: room.id },
          include: SAFE_ROOM_INCLUDE,
        });
      });

      return NextResponse.json({
        agreement: result,
        message: 'Marked as delivered.',
      });
    }

    // Transition 3: DELIVERED -> COMPLETED
    if (room.stage === AgreementStage.DELIVERED) {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic stage guard prevents double-payout under concurrent click races
        const stageLock = await tx.agreementRoom.updateMany({
          where: { id: room.id, stage: AgreementStage.DELIVERED },
          data: { stage: AgreementStage.COMPLETED },
        });
        if (stageLock.count !== 1) {
          throw new ConflictError('Agreement state has already changed. Please refresh.');
        }

        // Atomic reserved-balance check prevents negative reserved balances under concurrency
        const release = await tx.user.updateMany({
          where: {
            id: room.requesterId,
            reservedCredits: { gte: total },
          },
          data: {
            reservedCredits: { decrement: total },
            spentLifetime: { increment: total },
            completedExchanges: { increment: 1 },
          },
        });
        if (release.count !== 1) {
          throw new ConflictError('Reserved escrow balance mismatch during settlement.');
        }

        await tx.user.update({
          where: { id: room.providerId },
          data: {
            availableCredits: { increment: total },
            earnedLifetime: { increment: total },
            completedExchanges: { increment: 1 },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: room.requesterId,
            roomId: room.id,
            counterpartyInitials: getInitials(room.provider.fullName),
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
            counterpartyInitials: getInitials(room.requester.fullName),
            counterpartyName: room.requester.fullName,
            title: `Earned: ${room.title}`,
            availableDelta: total,
            reservedDelta: 0,
            typeLabel: 'TRANSFER_IN',
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

        const counterpartyId = user.id === room.requesterId ? room.providerId : room.requesterId;
        await createUserNotification(tx, {
          userId: counterpartyId,
          type: 'AGREEMENT_COMPLETED',
          title: `Credits settled: ${room.title}`,
          body: `${user.fullName} completed the agreement (${total.toFixed(2)} ECHO settled).`,
          href: `/agreement?roomId=${room.id}`,
          roomId: room.id,
          actorName: user.fullName,
        });

        return tx.agreementRoom.findUnique({
          where: { id: room.id },
          include: SAFE_ROOM_INCLUDE,
        });
      });

      return NextResponse.json({
        agreement: result,
        message: 'Agreement completed and credits settled.',
      });
    }

    throw new ConflictError(`Cannot advance agreement from current stage: ${room.stage}`);
  } catch (error) {
    return toErrorResponse(error, 'Failed to advance agreement stage');
  }
}
