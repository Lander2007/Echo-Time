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
      select: { id: true, hostId: true },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await readJsonBody(req);

    // Strictly allow-list kind, tag, title, description; never allow tampering with hostId or membersCount
    const updateData: {
      kind?: CommunityKind;
      eyebrowCta?: string;
      tag?: string;
      title?: string;
      description?: string;
    } = {};

    if (body.kind !== undefined) {
      if (typeof body.kind !== 'string' || !(body.kind.toUpperCase() in CommunityKind)) {
        throw new ValidationError('Invalid community space kind.');
      }
      const nextKind = body.kind.toUpperCase() as CommunityKind;
      updateData.kind = nextKind;
      updateData.eyebrowCta = EYEBROW_BY_KIND[nextKind];
    }

    if (body.tag !== undefined) {
      updateData.tag = sanitizeText(body.tag, {
        fieldName: 'Tag',
        minLen: 1,
        maxLen: 40,
        collapseNewlines: true,
      });
    }
    if (body.title !== undefined) {
      updateData.title = sanitizeText(body.title, {
        fieldName: 'Title',
        minLen: 1,
        maxLen: 120,
        collapseNewlines: true,
      });
    }
    if (body.description !== undefined) {
      updateData.description = sanitizeText(body.description, {
        fieldName: 'Description',
        minLen: 1,
        maxLen: 800,
      });
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid community fields provided to update.');
    }

    const updated = await prisma.communitySpace.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ space: updated });
  } catch (error) {
    return toErrorResponse(error, 'Failed to update community space');
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
      select: { id: true, hostId: true },
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
    return toErrorResponse(error, 'Failed to delete community space');
  }
}
