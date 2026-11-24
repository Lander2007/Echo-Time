const { PrismaClient } = require('@prisma/client');

function resolveDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  if (dbUrl && dbUrl.includes('ep-red-sound') && directUrl) {
    return directUrl;
  }
  return dbUrl || directUrl;
}

const activeUrl = resolveDatabaseUrl();
const prisma = new PrismaClient(activeUrl ? { datasources: { db: { url: activeUrl } } } : undefined);

async function main() {
  try {
    const userCount = await prisma.user.count().catch(() => 0);
    if (userCount > 0) {
      console.log(`✅ Database already contains ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Database is empty. Seeding initial canonical users and listings...');

    const demoPasswordHash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // "demo1234password"

    const khaled = await prisma.user.create({
      data: {
        fullName: 'Khaled Amr Ahmeed',
        username: 'khaled',
        email: 'khaled@echotime.edu',
        passwordHash: demoPasswordHash,
        university: 'Cairo University — Computer Engineering',
        bio: 'Full-stack software engineer & CS senior. Passionate about Next.js, distributed systems, and reciprocal student economies.',
        availability: 'Mon, Wed, Fri 4:00 PM — 8:00 PM EET',
        avatarActive: true,
        planTier: 'STUDENT_FREE',
        streakDays: 3,
        availableCredits: 6.0,
        reservedCredits: 0.0,
        earnedLifetime: 12.0,
        spentLifetime: 6.0,
        completedExchanges: 4,
        offeredSkills: [
          'Next.js 15 & React 19',
          'TypeScript Architecture',
          'Prisma & PostgreSQL',
          'Tailwind CSS Systems',
        ],
      },
    });

    const sara = await prisma.user.create({
      data: {
        fullName: 'Sara Al-Mansoor',
        username: 'sara',
        email: 'sara@echotime.edu',
        passwordHash: demoPasswordHash,
        university: 'American University in Cairo — Graphic Design',
        bio: 'Design systems lead & UI/UX researcher. I help engineering students turn complex tools into clean editorial interfaces.',
        availability: 'Tue, Thu 2:00 PM — 6:00 PM EET',
        avatarActive: true,
        planTier: 'STUDENT_FREE',
        streakDays: 7,
        availableCredits: 8.0,
        reservedCredits: 0.0,
        earnedLifetime: 16.0,
        spentLifetime: 8.0,
        completedExchanges: 6,
        offeredSkills: ['Figma Design Systems', 'Editorial Typography', 'User Research'],
      },
    });

    const ahmed = await prisma.user.create({
      data: {
        fullName: 'Ahmed Taha',
        username: 'ahmed',
        email: 'ahmed@echotime.edu',
        passwordHash: demoPasswordHash,
        university: 'Ain Shams University — Computer Science',
        bio: 'Competitive programmer and Python enthusiast. Specializes in algorithms, data structures, and FastAPI backends.',
        availability: 'Weekends 10:00 AM — 2:00 PM EET',
        avatarActive: true,
        planTier: 'STUDENT_FREE',
        streakDays: 5,
        availableCredits: 5.0,
        reservedCredits: 0.0,
        earnedLifetime: 10.0,
        spentLifetime: 5.0,
        completedExchanges: 3,
        offeredSkills: ['Python & Algorithms', 'FastAPI & Docker', 'Data Structures'],
      },
    });

    console.log(`👤 Seeded 3 Users: ${khaled.fullName}, ${sara.fullName}, ${ahmed.fullName}`);

    await prisma.skillListing.createMany({
      data: [
        {
          authorId: khaled.id,
          category: 'ENGINEERING',
          type: 'OFFERING',
          title: 'Next.js 15 App Router & Server Actions Masterclass',
          description: 'Hands-on architectural review of server components, streaming Suspense boundaries, and zero-bundle server mutations.',
          format: 'ONLINE',
          creditsPerHr: 1,
          status: 'ACTIVE',
          rating: 5.0,
          reviewsCount: 14,
        },
        {
          authorId: sara.id,
          category: 'DESIGN',
          type: 'OFFERING',
          title: 'Figma Auto-Layout & Design Tokens Architecture',
          description: 'Learn to build scalable design systems, variable modes, and token export pipelines aligned with Tailwind CSS.',
          format: 'ONLINE',
          creditsPerHr: 1,
          status: 'ACTIVE',
          rating: 4.9,
          reviewsCount: 22,
        },
        {
          authorId: ahmed.id,
          category: 'ENGINEERING',
          type: 'OFFERING',
          title: 'FastAPI Microservices & Docker Containerization',
          description: 'Production architecture for Python async REST backends, Pydantic v2 serialization, and multi-stage Docker builds.',
          format: 'ONLINE',
          creditsPerHr: 1,
          status: 'ACTIVE',
          rating: 4.8,
          reviewsCount: 9,
        },
      ],
    });

    await prisma.walletTransaction.createMany({
      data: [
        {
          userId: khaled.id,
          counterpartyInitials: 'ET',
          counterpartyName: 'Echo Time Protocol',
          title: 'Founding Student Seed Grant',
          availableDelta: 5.0,
          reservedDelta: 0.0,
          typeLabel: 'Protocol Grant',
        },
        {
          userId: khaled.id,
          counterpartyInitials: 'SM',
          counterpartyName: 'Sara Al-Mansoor',
          title: 'Session: Editorial Design Tokens in Tailwind',
          availableDelta: 1.0,
          reservedDelta: 0.0,
          typeLabel: 'Exchange Payout',
        },
      ],
    });

    console.log('✅ Auto-seed completed successfully!');
  } catch (err) {
    console.warn('Auto-seed warning (can proceed):', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
