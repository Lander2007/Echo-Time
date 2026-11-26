import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  parsePositiveInt,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  ValidationError,
} from '@/lib/validation';
import { ListingFormat, ListingStatus, ListingType } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.skillListing.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this listing.' },
        { status: 403 }
      );
    }

    const body = await readJsonBody(req);
    const updateData: {
      title?: string;
      description?: string;
      category?: string;
      type?: ListingType;
      format?: ListingFormat;
      creditsPerHr?: number;
      status?: ListingStatus;
    } = {};

    if (body.title !== undefined) {
      updateData.title = sanitizeText(body.title, {
        fieldName: 'title',
        minLen: 2,
        maxLen: 120,
        collapseNewlines: true,
      });
    }
    if (body.description !== undefined) {
      updateData.description = sanitizeText(body.description, {
        fieldName: 'description',
        minLen: 1,
        maxLen: 1200,
      });
    }
    if (body.category !== undefined) {
      updateData.category = sanitizeText(body.category, {
        fieldName: 'category',
        minLen: 1,
        maxLen: 60,
        collapseNewlines: true,
      });
    }
    if (body.type !== undefined) {
      if (
        body.type === 'Requests' ||
        body.type === 'Looking for' ||
        body.type === ListingType.LOOKING_FOR
      ) {
        updateData.type = ListingType.LOOKING_FOR;
      } else if (
        body.type === 'Offers' ||
        body.type === 'Offering' ||
        body.type === ListingType.OFFERING
      ) {
        updateData.type = ListingType.OFFERING;
      } else {
        throw new ValidationError('Invalid listing type.');
      }
    }
    if (body.format !== undefined) {
      if (body.format === 'In-person' || body.format === ListingFormat.IN_PERSON) {
        updateData.format = ListingFormat.IN_PERSON;
      } else if (body.format === 'Hybrid' || body.format === ListingFormat.HYBRID) {
        updateData.format = ListingFormat.HYBRID;
      } else if (body.format === 'Online' || body.format === ListingFormat.ONLINE) {
        updateData.format = ListingFormat.ONLINE;
      } else {
        throw new ValidationError('Invalid listing format.');
      }
    }
    if (body.creditsPerHr !== undefined) {
      updateData.creditsPerHr = parsePositiveInt(body.creditsPerHr, {
        min: 1,
        max: 5,
        fieldName: 'creditsPerHr',
      });
    }
    if (body.status !== undefined) {
      if (
        typeof body.status !== 'string' ||
        !(body.status in ListingStatus)
      ) {
        throw new ValidationError('Invalid listing status.');
      }
      updateData.status = body.status as ListingStatus;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid listing fields supplied to update.');
    }

    const updated = await prisma.skillListing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    return toErrorResponse(error, 'Failed to update listing.');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.skillListing.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this listing.' },
        { status: 403 }
      );
    }

    await prisma.skillListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    return toErrorResponse(error, 'Failed to delete listing.');
  }
}
