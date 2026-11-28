import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { readJsonBody, toErrorResponse, ValidationError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
};

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        unreadCount,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          href: n.href,
          roomId: n.roomId,
          actorName: n.actorName,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch notifications from database.');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const body = await readJsonBody(req);

    if (body.markAll === true) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (typeof body.id === 'string' && body.id.trim()) {
      await prisma.notification.updateMany({
        where: {
          id: body.id.trim(),
          userId: user.id,
        },
        data: { read: true },
      });
    } else {
      throw new ValidationError('Provide either notification id or markAll: true.');
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json(
      {
        success: true,
        unreadCount,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to update notification state.');
  }
}
