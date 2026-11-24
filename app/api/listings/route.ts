import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { ListingType, ListingFormat, ListingStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'All' | 'Offers' | 'Requests'
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    const sort = searchParams.get('sort'); // 'rating' | 'hours-asc' | 'hours-desc'
    const scope = searchParams.get('scope'); // 'all' | 'saved' | 'my'

    const currentUser = await getSessionUser();

    // Build where clause
    const where: any = {
      status: ListingStatus.ACTIVE,
    };

    if (type === 'Offers') {
      where.type = ListingType.OFFERING;
    } else if (type === 'Requests') {
      where.type = ListingType.LOOKING_FOR;
    }

    if (category && category !== 'All disciplines') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (format && format !== 'All') {
      where.format = format.toUpperCase() as ListingFormat;
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

    // Build orderBy
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
      type: l.type === ListingType.OFFERING ? 'Offers' : 'Requests',
      format: l.format,
      creditsPerHr: l.creditsPerHr,
      rating: l.rating,
      reviewsCount: l.reviewsCount,
      isSaved: Boolean(l.savedBy && l.savedBy.length > 0),
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, listings: formatted });
  } catch (error) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve skill listings.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, type, format, creditsPerHr } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required.' },
        { status: 400 }
      );
    }

    const listing = await prisma.skillListing.create({
      data: {
        authorId: user.id,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        type: type === 'Requests' ? ListingType.LOOKING_FOR : ListingType.OFFERING,
        format: (format?.toUpperCase() as ListingFormat) || ListingFormat.ONLINE,
        creditsPerHr: Number(creditsPerHr) || 1,
        status: ListingStatus.ACTIVE,
      },
      include: {
        author: {
          select: {
            fullName: true,
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
          title: listing.title,
          description: listing.description,
          category: listing.category,
          type: listing.type === ListingType.OFFERING ? 'Offers' : 'Requests',
          format: listing.format,
          creditsPerHr: listing.creditsPerHr,
          authorName: listing.author.fullName,
          authorUni: listing.author.university,
          rating: listing.rating,
          isSaved: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to publish skill listing.' },
      { status: 500 }
    );
  }
}
