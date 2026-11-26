import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  NotFoundError,
  parsePositiveInt,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
import { AgreementStage, MessageSenderType } from '@prisma/client';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await prisma.agreementRoom.findMany({
      where: {
        OR: [{ requesterId: user.id }, { providerId: user.id }],
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            username: true,
            university: true,
            planTier: true,
          },
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            username: true,
            university: true,
            planTier: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            creditsPerHr: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ agreements: rooms });
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch agreement rooms from database.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody(req);

    const rawListingId =
      typeof body.listingId === 'string' && body.listingId.trim()
        ? body.listingId.trim()
        : null;

    const goal = sanitizeText(body.goal, {
      fieldName: 'Goal',
      minLen: 0,
      maxLen: 500,
      defaultValue: 'Collaborative exchange of domain skills',
    });
    const format = sanitizeText(body.format, {
      fieldName: 'Format',
      minLen: 0,
      maxLen: 32,
      defaultValue: 'Online',
      collapseNewlines: true,
    });
    const durationHrs = parsePositiveInt(body.durationHrs ?? 1, {
      min: 1,
      max: 8,
      fieldName: 'Duration hours',
    });

    let resolvedProviderId: string;
    let resolvedCreditsPerHr: number;
    let resolvedTitle: string;
    let resolvedCategory: string;

    if (rawListingId) {
      // Server-side authoritative lookup: never trust client-supplied price or providerId
      const listing = await prisma.skillListing.findUnique({
        where: { id: rawListingId },
        select: {
          id: true,
          authorId: true,
          title: true,
          category: true,
          creditsPerHr: true,
        },
      });

      if (!listing) {
        throw new NotFoundError('Referenced skill listing not found.');
      }

      if (listing.authorId === user.id) {
        throw new ValidationError('You cannot open an agreement room on your own listing.');
      }

      resolvedProviderId = listing.authorId;
      resolvedCreditsPerHr = Math.min(5, Math.max(1, Math.trunc(listing.creditsPerHr || 1)));
      resolvedTitle = sanitizeText(body.title, {
        fieldName: 'Title',
        minLen: 1,
        maxLen: 140,
        defaultValue: listing.title,
        collapseNewlines: true,
      });
      resolvedCategory = listing.category;
    } else {
      const cleanProviderId = sanitizeText(body.providerId, {
        fieldName: 'providerId',
        minLen: 1,
        maxLen: 64,
        collapseNewlines: true,
      });

      if (cleanProviderId === user.id) {
        throw new ValidationError('You cannot open an agreement room on your own listing.');
      }

      const providerExists = await prisma.user.findUnique({
        where: { id: cleanProviderId },
        select: { id: true },
      });
      if (!providerExists) {
        throw new NotFoundError('Provider account not found.');
      }

      resolvedProviderId = providerExists.id;
      resolvedCreditsPerHr = parsePositiveInt(body.creditsPerHr ?? 1, {
        min: 1,
        max: 5,
        fieldName: 'Credits per hour',
      });
      resolvedTitle = sanitizeText(body.title, {
        fieldName: 'Title',
        minLen: 1,
        maxLen: 140,
        collapseNewlines: true,
      });
      resolvedCategory = sanitizeText(body.category, {
        fieldName: 'Category',
        minLen: 1,
        maxLen: 60,
        defaultValue: 'Engineering',
        collapseNewlines: true,
      });
    }

    const room = await prisma.agreementRoom.create({
      data: {
        requesterId: user.id,
        providerId: resolvedProviderId,
        listingId: rawListingId,
        title: resolvedTitle,
        category: resolvedCategory,
        goal,
        format,
        durationHrs,
        creditsPerHr: resolvedCreditsPerHr,
        stage: AgreementStage.NEGOTIATING,
        termsVersion: 1,
        messages: {
          create: {
            senderType: MessageSenderType.SYSTEM,
            authorLabel: 'SYSTEM PROTOCOL',
            body: 'Agreement Room opened. Review the terms and negotiate before confirming escrow.',
          },
        },
      },
      include: {
        requester: {
          select: { id: true, fullName: true, username: true, university: true },
        },
        provider: {
          select: { id: true, fullName: true, username: true, university: true },
        },
        messages: true,
      },
    });

    return NextResponse.json({ agreement: room }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to create agreement room in database.');
  }
}
