import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CommunityKind } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const q = searchParams.get('q');

    const where: any = {};
    if (kind && kind !== 'ALL' && Object.values(CommunityKind).includes(kind as CommunityKind)) {
      where.kind = kind as CommunityKind;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tag: { contains: q, mode: 'insensitive' } },
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
    console.error('Failed to fetch community spaces:', error);
    return NextResponse.json({ error: 'Failed to fetch community spaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { kind = 'PROJECT', tag, eyebrowCta, title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title and description are required' },
        { status: 400 }
      );
    }

    const space = await prisma.communitySpace.create({
      data: {
        hostId: user.id,
        kind: (kind.toUpperCase() in CommunityKind) ? (kind.toUpperCase() as CommunityKind) : CommunityKind.PROJECT,
        tag: tag || 'Initiative',
        eyebrowCta: eyebrowCta || 'JOIN INITIATIVE →',
        title,
        description,
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
    console.error('Failed to create community space:', error);
    return NextResponse.json({ error: 'Failed to create community space' }, { status: 500 });
  }
}
