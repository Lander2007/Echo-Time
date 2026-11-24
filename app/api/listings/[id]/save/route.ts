import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id: listingId } = await params;

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId,
        },
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error('Toggle save listing error:', error);
    return NextResponse.json({ error: 'Failed to bookmark listing.' }, { status: 500 });
  }
}
