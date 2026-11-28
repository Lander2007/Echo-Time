import { NextRequest, NextResponse } from 'next/server';
import { ListingStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { toErrorResponse, ValidationError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
};

async function readOptionalDesiredSaved(req: NextRequest): Promise<boolean | undefined> {
  try {
    const raw = await req.text();
    if (!raw.trim()) return undefined;
    const parsed = JSON.parse(raw) as { saved?: unknown };
    if (typeof parsed?.saved === 'boolean') {
      return parsed.saved;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function handleSaveMutation(
  req: NextRequest,
  params: Promise<{ id: string }>,
  forcedState?: boolean
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const { id: rawListingId } = await params;
    const listingId = rawListingId?.trim();
    if (!listingId) {
      throw new ValidationError('Invalid listing ID.');
    }

    const listing = await prisma.skillListing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found.' },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    const desiredState =
      typeof forcedState === 'boolean'
        ? forcedState
        : await readOptionalDesiredSaved(req);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId,
          },
        },
        select: { id: true, createdAt: true },
      });

      const targetSaved = typeof desiredState === 'boolean' ? desiredState : !existing;

      if (targetSaved && listing.status !== ListingStatus.ACTIVE) {
        throw new ValidationError('Only active listings can be saved.');
      }

      let savedRecord: { createdAt: Date } | null = null;

      if (targetSaved) {
        if (existing) {
          savedRecord = { createdAt: existing.createdAt };
        } else {
          try {
            const created = await tx.savedListing.create({
              data: {
                userId: user.id,
                listingId,
              },
              select: { createdAt: true },
            });
            savedRecord = created;
          } catch (err: unknown) {
            if ((err as { code?: string })?.code === 'P2002') {
              const concurrent = await tx.savedListing.findUnique({
                where: { userId_listingId: { userId: user.id, listingId } },
                select: { createdAt: true },
              });
              savedRecord = concurrent;
            } else {
              throw err;
            }
          }
        }
      } else if (existing) {
        await tx.savedListing.deleteMany({
          where: {
            userId: user.id,
            listingId,
          },
        });
      }

      const savedCount = await tx.savedListing.count({
        where: {
          userId: user.id,
          listing: {
            status: ListingStatus.ACTIVE,
          },
        },
      });

      return {
        saved: Boolean(savedRecord),
        savedAt: savedRecord ? savedRecord.createdAt.toISOString() : null,
        savedCount,
      };
    });

    return NextResponse.json(
      {
        success: true,
        listingId,
        saved: result.saved,
        savedAt: result.savedAt,
        savedCount: result.savedCount,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return toErrorResponse(error, 'Failed to update saved listing in database.');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleSaveMutation(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleSaveMutation(req, params, true);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleSaveMutation(req, params, false);
}
