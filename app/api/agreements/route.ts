import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AgreementStage, MessageSenderType } from '@prisma/client';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await prisma.agreementRoom.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { providerId: user.id },
        ],
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
    console.error('Failed to fetch agreement rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch agreement rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      listingId,
      providerId,
      title,
      category = 'Engineering',
      goal = 'Collaborative exchange of domain skills',
      format = 'Online',
      durationHrs = 1,
      creditsPerHr = 1,
    } = body;

    if (!providerId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId and title are required' },
        { status: 400 }
      );
    }

    if (providerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot initiate an agreement with yourself' },
        { status: 400 }
      );
    }

    const room = await prisma.agreementRoom.create({
      data: {
        requesterId: user.id,
        providerId,
        listingId: listingId || null,
        title,
        category,
        goal,
        format,
        durationHrs: Number(durationHrs) || 1,
        creditsPerHr: Number(creditsPerHr) || 1,
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
    console.error('Failed to create agreement room:', error);
    return NextResponse.json({ error: 'Failed to create agreement room' }, { status: 500 });
  }
}
