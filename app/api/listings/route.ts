import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { formatApiSkillListing } from '@/lib/listings';
import {
  parsePositiveInt,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
} from '@/lib/validation';
import { ListingType, ListingFormat, ListingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    const sort = searchParams.get('sort');
    const scope = searchParams.get('scope');

    const currentUser = await getSessionUser();

    const where: Record<string, unknown> = {
      status: ListingStatus.ACTIVE,
    };

    if (type === 'Offers' || type === 'Offering') {
      where.type = ListingType.OFFERING;
    } else if (type === 'Requests' || type === 'Looking for') {
      where.type = ListingType.LOOKING_FOR;
    }

    if (category && category !== 'All disciplines') {
      where.category = { equals: category.slice(0, 60), mode: 'insensitive' };
    }

    if (format && format !== 'All') {
      const formatUpper = format.toUpperCase().replace('-', '_');
      if (formatUpper in ListingFormat) {
        where.format = formatUpper as ListingFormat;
      }
    }

    if (q) {
      const boundedQ = q.slice(0, 120);
      where.OR = [
        { title: { contains: boundedQ, mode: 'insensitive' } },
        { description: { contains: boundedQ, mode: 'insensitive' } },
        { author: { fullName: { contains: boundedQ, mode: 'insensitive' } } },
      ];
    }

    if (scope === 'my') {
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Authentication required to view your listings.' },
          { status: 401, headers: NO_STORE_HEADERS }
        );
      }
      where.authorId = currentUser.id;
    } else if (scope === 'saved') {
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Authentication required to view saved listings.' },
          { status: 401, headers: NO_STORE_HEADERS }
        );
      }
      where.savedBy = {
        some: { userId: currentUser.id },
      };
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'hours-asc') {
      orderBy = { creditsPerHr: 'asc' };
    } else if (sort === 'hours-desc') {
      orderBy = { creditsPerHr: 'desc' };
    }

    const listings = await prisma.skillListing.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            university: true,
          },
        },
        savedBy: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true, createdAt: true },
            }
          : false,
      },
    });

    const formatted = listings.map((l) => formatApiSkillListing(l, currentUser?.id));
    const savedIds = formatted.filter((l) => l.isSaved).map((l) => l.id);

    return NextResponse.json(
      {
        success: true,
        listings: formatted,
        savedIds,
        savedCount: savedIds.length,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to retrieve skill listings from database.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to publish skills.' },
        { status: 401 }
      );
    }

    const body = await readJsonBody(req);

    // Strictly extract & validate allow-listed listing fields; authorId & status are server-controlled
    const cleanTitle = sanitizeText(body.title, {
      fieldName: 'Skill title',
      minLen: 2,
      maxLen: 120,
      collapseNewlines: true,
    });

    const cleanCategory = sanitizeText(body.category, {
      fieldName: 'Category',
      minLen: 1,
      maxLen: 60,
      defaultValue: 'Programming',
      collapseNewlines: true,
    });

    const cleanDescription = sanitizeText(body.description, {
      fieldName: 'Description',
      minLen: 0,
      maxLen: 1200,
      defaultValue: `1-on-1 collaborative exchange covering ${cleanTitle} on ECHO TIME.`,
    });

    const parsedCreditsPerHr = parsePositiveInt(body.creditsPerHr ?? 1, {
      min: 1,
      max: 5,
      fieldName: 'creditsPerHr',
    });

    const parsedType =
      body.type === 'Requests' || body.type === 'Looking for' || body.type === 'LOOKING_FOR'
        ? ListingType.LOOKING_FOR
        : ListingType.OFFERING;

    const parsedFormat =
      body.format === 'In-person' || body.format === 'IN_PERSON'
        ? ListingFormat.IN_PERSON
        : body.format === 'Hybrid' || body.format === 'HYBRID'
        ? ListingFormat.HYBRID
        : ListingFormat.ONLINE;

    const listing = await prisma.skillListing.create({
      data: {
        authorId: user.id,
        title: cleanTitle,
        description: cleanDescription,
        category: cleanCategory,
        type: parsedType,
        format: parsedFormat,
        creditsPerHr: parsedCreditsPerHr,
        status: ListingStatus.ACTIVE,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        listing: formatApiSkillListing(listing, user.id),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to publish skill listing to database.');
  }
}
