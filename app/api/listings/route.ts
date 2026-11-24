import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
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

    const where: any = {
      status: ListingStatus.ACTIVE,
    };

    if (type === 'Offers' || type === 'Offering') {
      where.type = ListingType.OFFERING;
    } else if (type === 'Requests' || type === 'Looking for') {
      where.type = ListingType.LOOKING_FOR;
    }

    if (category && category !== 'All disciplines') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (format && format !== 'All') {
      const formatUpper = format.toUpperCase().replace('-', '_');
      if (formatUpper in ListingFormat) {
        where.format = formatUpper as ListingFormat;
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { fullName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (scope === 'my' && currentUser) {
      where.authorId = currentUser.id;
    } else if (scope === 'saved' && currentUser) {
      where.savedBy = {
        some: { userId: currentUser.id },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
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
      format: l.format === ListingFormat.ONLINE ? 'Online' : l.format === ListingFormat.IN_PERSON ? 'In-person' : 'Hybrid',
      creditsPerHr: l.creditsPerHr,
      rating: l.rating,
      reviewsCount: l.reviewsCount,
      isSaved: Boolean(currentUser && l.savedBy && l.savedBy.length > 0),
      isMine: Boolean(currentUser && l.authorId === currentUser.id),
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, listings: formatted });
  } catch (error) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve skill listings from database.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to publish skills.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, type, format, creditsPerHr } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { error: 'Skill title is required.' },
        { status: 400 }
      );
    }

    const cleanTitle = String(title).trim();
    const cleanCategory = category && String(category).trim() ? String(category).trim() : 'Programming';
    const cleanDescription =
      description && String(description).trim()
        ? String(description).trim()
        : `1-on-1 collaborative exchange covering ${cleanTitle} on ECHO TIME.`;

    const parsedType =
      type === 'Requests' || type === 'Looking for' || type === 'LOOKING_FOR'
        ? ListingType.LOOKING_FOR
        : ListingType.OFFERING;

    const parsedFormat =
      format === 'In-person' || format === 'IN_PERSON'
        ? ListingFormat.IN_PERSON
        : format === 'Hybrid' || format === 'HYBRID'
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
        creditsPerHr: Number(creditsPerHr) || 1,
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
          format: listing.format === ListingFormat.ONLINE ? 'Online' : listing.format === ListingFormat.IN_PERSON ? 'In-person' : 'Hybrid',
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
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to publish skill listing to database.' },
      { status: 500 }
    );
  }
}
