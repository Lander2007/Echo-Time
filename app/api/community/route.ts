import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
import { CommunityKind } from '@prisma/client';

const EYEBROW_BY_KIND: Record<CommunityKind, string> = {
  PROJECT: 'Build with peers',
  GROUP: 'Join study circle',
  EVENT: 'Attend campus session',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const q = searchParams.get('q');

    const where: Record<string, unknown> = {};
    if (
      kind &&
      kind !== 'ALL' &&
      Object.values(CommunityKind).includes(kind as CommunityKind)
    ) {
      where.kind = kind as CommunityKind;
    }

    if (q) {
      const boundedQ = q.slice(0, 120);
      where.OR = [
        { title: { contains: boundedQ, mode: 'insensitive' } },
        { description: { contains: boundedQ, mode: 'insensitive' } },
        { tag: { contains: boundedQ, mode: 'insensitive' } },
      ];
    }

    const spaces = await prisma.communitySpace.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            username: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ spaces });
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch community spaces');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody(req);

    // Strictly allow-list kind, tag, title, description; hostId and membersCount are server-controlled
    let parsedKind: CommunityKind = CommunityKind.PROJECT;
    if (body.kind !== undefined) {
      if (typeof body.kind !== 'string' || !(body.kind.toUpperCase() in CommunityKind)) {
        throw new ValidationError('Invalid community space kind.');
      }
      parsedKind = body.kind.toUpperCase() as CommunityKind;
    }

    const cleanTag = sanitizeText(body.tag, {
      fieldName: 'Tag',
      minLen: 1,
      maxLen: 40,
      defaultValue: 'tech',
      collapseNewlines: true,
    });
    const cleanTitle = sanitizeText(body.title, {
      fieldName: 'Title',
      minLen: 1,
      maxLen: 120,
      collapseNewlines: true,
    });
    const cleanDescription = sanitizeText(body.description, {
      fieldName: 'Description',
      minLen: 1,
      maxLen: 800,
    });

    const space = await prisma.communitySpace.create({
      data: {
        hostId: user.id,
        kind: parsedKind,
        tag: cleanTag,
        eyebrowCta: EYEBROW_BY_KIND[parsedKind],
        title: cleanTitle,
        description: cleanDescription,
        membersCount: 1,
      },
      include: {
        host: {
          select: { id: true, fullName: true, username: true, university: true },
        },
      },
    });

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to create community space');
  }
}
