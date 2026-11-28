import { ListingFormat, ListingType } from '@prisma/client';

export interface DbListingWithAuthor {
  id: string;
  authorId: string;
  title: string;
  description: string;
  category: string;
  type: ListingType;
  format: ListingFormat;
  creditsPerHr: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  author: {
    id: string;
    fullName: string;
    username: string;
    university: string;
  };
  savedBy?: Array<{ id: string; createdAt?: Date }>;
}

/** Formats a Prisma SkillListing record with author metadata and user-specific bookmark state. */
export function formatApiSkillListing(
  listing: DbListingWithAuthor,
  currentUserId?: string | null,
  explicitSavedAt?: Date | null
) {
  const savedRecord = listing.savedBy?.[0];
  const savedTimestamp = explicitSavedAt ?? savedRecord?.createdAt ?? null;
  const isSaved = Boolean(
    explicitSavedAt || (currentUserId && listing.savedBy && listing.savedBy.length > 0)
  );

  return {
    id: listing.id,
    authorId: listing.authorId,
    authorName: listing.author.fullName,
    authorUni: listing.author.university,
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
    rating: listing.rating,
    reviewsCount: listing.reviewsCount,
    isSaved,
    saved: isSaved,
    savedAt: savedTimestamp ? savedTimestamp.toISOString() : null,
    isMine: Boolean(currentUserId && listing.authorId === currentUserId),
    createdAt: listing.createdAt.toISOString(),
  };
}
