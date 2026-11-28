import { Prisma, PrismaClient } from '@prisma/client';

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface CreateNotificationInput {
  userId: string;
  type?: string;
  title: string;
  body: string;
  href?: string;
  roomId?: string | null;
  actorName?: string | null;
}

/** Persists an in-app & web-pollable notification row for a target recipient user. */
export async function createUserNotification(
  db: DbClient,
  input: CreateNotificationInput
) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type || 'SKILL_REQUEST',
      title: input.title.slice(0, 140),
      body: input.body.slice(0, 400),
      href: input.href || '/agreement',
      roomId: input.roomId ?? null,
      actorName: input.actorName ?? null,
    },
  });
}
