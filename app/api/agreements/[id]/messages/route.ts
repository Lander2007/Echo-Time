import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import {
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  validateChatAttachment,
  ValidationError,
} from '@/lib/validation';
import { MessageSenderType } from '@prisma/client';

const MSG_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES_PER_MIN = 40;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = checkRateLimit({
      key: `msg:${user.id}`,
      limit: MAX_MESSAGES_PER_MIN,
      windowMs: MSG_WINDOW_MS,
    });
    if (!rate.allowed) {
      return rateLimitResponse(
        rate.retryAfterSec,
        'Message rate limit reached. Please wait a moment before sending more messages.'
      );
    }

    const { id } = await params;
    const room = await prisma.agreementRoom.findUnique({
      where: { id },
      select: { id: true, requesterId: true, providerId: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Agreement room not found' }, { status: 404 });
    }

    if (room.requesterId !== user.id && room.providerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await readJsonBody(req);
    const cleanBody =
      body.body !== undefined && body.body !== null
        ? sanitizeText(body.body, {
            fieldName: 'Message body',
            minLen: 0,
            maxLen: 4000,
          })
        : '';

    const attachment = validateChatAttachment({
      attachmentUrl: body.attachmentUrl,
      attachmentName: body.attachmentName,
      attachmentType: body.attachmentType,
      attachmentSize: body.attachmentSize,
    });

    if (!cleanBody && !attachment) {
      throw new ValidationError('Message text or attachment is required.');
    }

    const message = await prisma.agreementMessage.create({
      data: {
        roomId: id,
        senderId: user.id,
        senderType: MessageSenderType.ME,
        authorLabel: user.fullName,
        body:
          cleanBody ||
          (attachment?.attachmentName
            ? `Shared attachment: ${attachment.attachmentName}`
            : 'Attachment'),
        attachmentUrl: attachment?.attachmentUrl ?? null,
        attachmentName: attachment?.attachmentName ?? null,
        attachmentType: attachment?.attachmentType ?? null,
        attachmentSize: attachment?.attachmentSize ?? null,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to post message');
  }
}
