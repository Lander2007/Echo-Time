import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves the optimal PostgreSQL connection string:
 * - If DATABASE_URL is pointing to a blank/unmigrated integration host (e.g. ep-red-sound),
 *   fallback to DIRECT_URL which contains the configured, seeded database.
 * - Otherwise prefer DATABASE_URL, falling back to DIRECT_URL.
 */
function resolveDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (dbUrl && dbUrl.includes('ep-red-sound') && directUrl) {
    return directUrl;
  }
  return dbUrl || directUrl;
}

const activeUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: activeUrl
      ? {
          db: {
            url: activeUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

