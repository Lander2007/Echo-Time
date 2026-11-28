import { NextResponse } from 'next/server';
import { ListingStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { formatApiSkillListing } from '@/lib/listings';
import { toErrorResponse } from '@/lib/validation';

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

    const savedRows = await prisma.savedListing.findMany({
      where: {
        userId: user.id,
        listing: {
          status: ListingStatus.ACTIVE,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                username: true,
                university: true,
              },
            },
          },
        },
      },
    });

    const listings = savedRows.map((row) =>
      formatApiSkillListing(row.listing, user.id, row.createdAt)
    );

    return NextResponse.json(
      {
        success: true,
        listings,
        count: listings.length,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to load saved skill listings from database.');
  }
}
