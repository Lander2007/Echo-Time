import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  parsePositiveInt,
  readJsonBody,
  sanitizeText,
  toErrorResponse,
} from '@/lib/validation';
import { ListingType, ListingFormat, ListingStatus } from '@prisma/client';

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

    if (scope === 'my' && currentUser) {
      where.authorId = currentUser.id;
    } else if (scope === 'saved' && currentUser) {
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
              select: { id: true },
            }
          : false,
      },
    });

    const formatted = listings.map((l) => ({
      id: l.id,
      authorId: l.authorId,
      authorName: l.author.fullName,
      authorUni: l.author.university,
      title: l.title,
      description: l.description,
      category: l.category,
      type: l.type === ListingType.OFFERING ? 'Offering' : 'Looking for',
      format:
        l.format === ListingFormat.ONLINE
          ? 'Online'
          : l.format === ListingFormat.IN_PERSON
          ? 'In-person'
          : 'Hybrid',
      creditsPerHr: l.creditsPerHr,
      rating: l.rating,
      reviewsCount: l.reviewsCount,
      isSaved: Boolean(currentUser && l.savedBy && l.savedBy.length > 0),
      isMine: Boolean(currentUser && l.authorId === currentUser.id),
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, listings: formatted });
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
        listing: {
          id: listing.id,
          authorId: listing.authorId,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          type: listing.type === ListingType.OFFERING ? 'Offering' : 'Looking for',
          format:
            listing.format === ListingFormat.ONLINE
              ? 'Online'
              : listing.format === ListingFormat.IN_PERSON
              ? 'In-person'
              : 'Hybrid',
          creditsPerHr: listing.creditsPerHr,
          authorName: listing.author.fullName,
          authorUni: listing.author.university,
          rating: listing.rating,
          reviewsCount: listing.reviewsCount,
          isSaved: false,
          isMine: true,
          createdAt: listing.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to publish skill listing to database.');
  }
}
