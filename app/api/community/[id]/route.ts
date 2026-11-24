import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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
    const space = await prisma.communitySpace.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { tag, eyebrowCta, title, description, membersCount } = body;

    const updated = await prisma.communitySpace.update({
      where: { id },
      data: {
        ...(tag !== undefined ? { tag } : {}),
        ...(eyebrowCta !== undefined ? { eyebrowCta } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(membersCount !== undefined ? { membersCount: Number(membersCount) } : {}),
      },
    });

    return NextResponse.json({ space: updated });
  } catch (error) {
    console.error('Failed to update community space:', error);
    return NextResponse.json({ error: 'Failed to update community space' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const space = await prisma.communitySpace.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.communitySpace.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Community space removed' });
  } catch (error) {
    console.error('Failed to delete community space:', error);
    return NextResponse.json({ error: 'Failed to delete community space' }, { status: 500 });
  }
}
