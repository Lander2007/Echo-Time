import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  ConflictError,
  parsePositiveInt,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
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
      select: {
        id: true,
        requesterId: true,
        providerId: true,
        stage: true,
        termsVersion: true,
      },
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

    const body = await readJsonBody(req);
    const updateData: {
      goal?: string;
      format?: string;
      durationHrs?: number;
      creditsPerHr?: number;
    } = {};

    if (body.goal !== undefined) {
      updateData.goal = sanitizeText(body.goal, {
        fieldName: 'goal',
        minLen: 1,
        maxLen: 500,
      });
    }
    if (body.format !== undefined) {
      updateData.format = sanitizeText(body.format, {
        fieldName: 'format',
        minLen: 1,
        maxLen: 32,
        collapseNewlines: true,
      });
    }
    if (body.durationHrs !== undefined) {
      updateData.durationHrs = parsePositiveInt(body.durationHrs, {
        min: 1,
        max: 8,
        fieldName: 'durationHrs',
      });
    }
    if (body.creditsPerHr !== undefined) {
      updateData.creditsPerHr = parsePositiveInt(body.creditsPerHr, {
        min: 1,
        max: 5,
        fieldName: 'creditsPerHr',
      });
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid term fields supplied to update.');
    }

    const updatedRoom = await prisma.$transaction(async (tx) => {
      // Conditional guard prevents modifying terms after stage leaves NEGOTIATING concurrently
      const stageLock = await tx.agreementRoom.updateMany({
        where: {
          id,
          stage: AgreementStage.NEGOTIATING,
          termsVersion: room.termsVersion,
        },
        data: {
          ...updateData,
          termsVersion: { increment: 1 },
        },
      });

      if (stageLock.count !== 1) {
        throw new ConflictError('Agreement terms or stage has already changed. Please refresh.');
      }

      const newVersion = room.termsVersion + 1;

      await tx.agreementMessage.create({
        data: {
          roomId: id,
          senderType: MessageSenderType.SYSTEM,
          authorLabel: 'SYSTEM PROTOCOL',
          body: `Agreement terms updated to Version ${newVersion} by ${user.fullName}.`,
        },
      });

      return tx.agreementRoom.findUnique({
        where: { id },
        include: {
          requester: { select: { id: true, fullName: true, username: true } },
          provider: { select: { id: true, fullName: true, username: true } },
        },
      });
    });

    return NextResponse.json({ agreement: updatedRoom });
  } catch (error) {
    return toErrorResponse(error, 'Failed to update agreement terms');
  }
}
