import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { ListingStatus } from '@prisma/client';

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
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this listing.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.skillListing.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? body.description.trim() : undefined,
        category: body.category !== undefined ? body.category.trim() : undefined,
        creditsPerHr: body.creditsPerHr !== undefined ? Number(body.creditsPerHr) : undefined,
        status: body.status !== undefined ? (body.status as ListingStatus) : undefined,
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Failed to update listing.' }, { status: 500 });
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
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this listing.' }, { status: 403 });
    }

    await prisma.skillListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Failed to delete listing.' }, { status: 500 });
  }
}
