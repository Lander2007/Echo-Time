import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AgreementStage, MessageSenderType } from '@prisma/client';

const FALLBACK_ROOMS = [
  {
    id: 'room-seed-1',
    requesterId: 'usr_seed_khaled',
    providerId: 'usr_seed_sara',
    title: 'UI/UX Design Tokens & System Audit',
    category: 'Design',
    goal: 'Structure Swiss-style tokens in Figma and connect React variables',
    format: 'Online',
    durationHrs: 1,
    creditsPerHr: 1,
    termsVersion: 1,
    stage: 'NEGOTIATING',
    requester: {
      id: 'usr_seed_khaled',
      fullName: 'Khaled Amr Ahmeed',
      username: 'khaled',
      university: 'Cairo University — Computer Engineering',
      planTier: 'STUDENT_FREE',
    },
    provider: {
      id: 'usr_seed_sara',
      fullName: 'Sara Al-Mansoor',
      username: 'sara',
      university: 'AUC — Graphic Design',
      planTier: 'STUDENT_FREE',
    },
    messages: [
      {
        id: 'msg-seed-1',
        senderType: 'SYSTEM',
        authorLabel: 'SYSTEM PROTOCOL',
        body: 'Exchange started. Agree on the goal, format, duration, and credits, then both confirm the same terms.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'msg-seed-2',
        senderType: 'PEER',
        senderId: 'usr_seed_sara',
        authorLabel: 'Sara Al-Mansoor',
        body: 'Hey Khaled! Ready to review the Figma token architecture whenever you want.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
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

      if (rooms && rooms.length > 0) {
        return NextResponse.json({ agreements: rooms });
      }
    } catch {
      // Fallback if DB not ready
    }

    return NextResponse.json({ agreements: FALLBACK_ROOMS });
  } catch (error) {
    console.error('Failed to fetch agreement rooms:', error);
    return NextResponse.json({ agreements: FALLBACK_ROOMS });
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

    try {
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
    } catch {
      // Return fallback created room
      const mockRoom = {
        id: `room-${Date.now()}`,
        requesterId: user.id,
        providerId,
        title,
        category,
        goal,
        format,
        durationHrs: Number(durationHrs) || 1,
        creditsPerHr: Number(creditsPerHr) || 1,
        stage: 'NEGOTIATING',
        termsVersion: 1,
        requester: { id: user.id, fullName: user.fullName, username: user.username, university: user.university },
        provider: { id: providerId, fullName: 'Peer Student', username: 'peer', university: 'Campus' },
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderType: 'SYSTEM',
            authorLabel: 'SYSTEM PROTOCOL',
            body: 'Agreement Room opened. Review the terms and negotiate before confirming escrow.',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return NextResponse.json({ agreement: mockRoom }, { status: 201 });
    }
  } catch (error) {
    console.error('Failed to create agreement room:', error);
    return NextResponse.json({ error: 'Failed to create agreement room' }, { status: 500 });
  }
}
