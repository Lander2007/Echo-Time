import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, SAFE_USER_SELECT } from '@/lib/auth';
import {
  readJsonBody,
  sanitizeText,
  toErrorResponse,
  validateAvatarUrlInput,
  ValidationError,
} from '@/lib/validation';

const MAX_OFFERED_SKILLS = 20;

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch profile');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody(req);

    // Strictly allow-list user-editable profile fields only; credits, planTier,
    // role, googleId, passwordHash, email, canonicalEmail, and id are permanently ignored.
    const updateData: {
      fullName?: string;
      username?: string;
      university?: string;
      bio?: string;
      availability?: string;
      avatarUrl?: string | null;
      avatarActive?: boolean;
      offeredSkills?: string[];
    } = {};

    if (body.fullName !== undefined) {
      updateData.fullName = sanitizeText(body.fullName, {
        fieldName: 'Full name',
        minLen: 2,
        maxLen: 80,
        collapseNewlines: true,
      });
    }

    if (body.username !== undefined) {
      if (typeof body.username !== 'string') {
        throw new ValidationError('Username must be a text string.');
      }
      const cleanUsername = body.username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');
      if (cleanUsername.length < 2 || cleanUsername.length > 30) {
        throw new ValidationError(
          'Username must be 2 to 30 valid characters (letters, numbers, _, -).'
        );
      }
      updateData.username = cleanUsername;
    }

    if (body.university !== undefined) {
      updateData.university = sanitizeText(body.university, {
        fieldName: 'University',
        minLen: 1,
        maxLen: 120,
        collapseNewlines: true,
      });
    }

    if (body.bio !== undefined) {
      updateData.bio =
        body.bio === null || body.bio === ''
          ? ''
          : sanitizeText(body.bio, {
              fieldName: 'Bio',
              minLen: 0,
              maxLen: 600,
            });
    }

    if (body.availability !== undefined) {
      updateData.availability =
        body.availability === null || body.availability === ''
          ? ''
          : sanitizeText(body.availability, {
              fieldName: 'Availability',
              minLen: 0,
              maxLen: 100,
              collapseNewlines: true,
            });
    }

    if (body.offeredSkills !== undefined) {
      if (!Array.isArray(body.offeredSkills)) {
        throw new ValidationError('offeredSkills must be an array of strings.');
      }
      if (body.offeredSkills.length > MAX_OFFERED_SKILLS) {
        throw new ValidationError(`You can list at most ${MAX_OFFERED_SKILLS} offered skills.`);
      }
      const cleanedSkills: string[] = [];
      for (const item of body.offeredSkills) {
        if (typeof item !== 'string') {
          throw new ValidationError('Each offered skill must be a text string.');
        }
        const cleanSkill = sanitizeText(item, {
          fieldName: 'Offered skill',
          minLen: 1,
          maxLen: 50,
          collapseNewlines: true,
        });
        if (!cleanedSkills.includes(cleanSkill)) {
          cleanedSkills.push(cleanSkill);
        }
      }
      updateData.offeredSkills = cleanedSkills;
    }

    if (body.avatarUrl !== undefined) {
      const check = validateAvatarUrlInput(body.avatarUrl);
      if (!check.ok) {
        throw new ValidationError(check.error);
      }
      updateData.avatarUrl = check.value;
      updateData.avatarActive = check.value !== null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid profile fields provided to update.');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: SAFE_USER_SELECT,
    });

    return NextResponse.json({ profile: updated });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: 'That username is already taken. Please pick another.' },
        { status: 409 }
      );
    }
    return toErrorResponse(error, 'Failed to update profile');
  }
}
