import { PrismaClient, PlanTier, ListingType, ListingFormat, ListingStatus, AgreementStage, MessageSenderType, CommunityKind } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ECHO TIME Database Seeding...');

  // 1. Clean existing records (in reverse relation order)
  await prisma.betaInterest.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.agreementMessage.deleteMany({});
  await prisma.agreementRoom.deleteMany({});
  await prisma.savedListing.deleteMany({});
  await prisma.skillListing.deleteMany({});
  await prisma.communitySpace.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Demo Seed Password (demo1234password hashed or mock string for demo)
  // In production, hashed via bcryptjs: "$2a$10$w8uD6hH7bLhL9qVlH..."
  const demoPasswordHash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // "demo1234password"

  // 3. Create Primary Judge Demo Student: Khaled Amr Ahmeed
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
      planTier: PlanTier.STUDENT_FREE,
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

  // 4. Create Demo Peer: Sara Al-Mansoor
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
      planTier: PlanTier.STUDENT_FREE,
      streakDays: 7,
      availableCredits: 8.0,
      reservedCredits: 0.0,
      earnedLifetime: 16.0,
      spentLifetime: 8.0,
      completedExchanges: 6,
      offeredSkills: ['Figma Design Systems', 'Editorial Typography', 'User Research'],
    },
  });

  // 5. Create Demo Peer: Ahmed Taha
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
      planTier: PlanTier.STUDENT_FREE,
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

  // 6. Create Canonical Skill Listings
  const listing1 = await prisma.skillListing.create({
    data: {
      authorId: khaled.id,
      category: 'ENGINEERING',
      type: ListingType.OFFERING,
      title: 'Next.js 15 App Router & TypeScript Code Audit',
      description: '1-on-1 code review of your Next.js routes, server components, and state management. I help you eliminate hydration bugs and optimize rendering.',
      format: ListingFormat.ONLINE,
      creditsPerHr: 1,
      status: ListingStatus.ACTIVE,
      rating: 5.0,
      reviewsCount: 4,
    },
  });

  const listing2 = await prisma.skillListing.create({
    data: {
      authorId: sara.id,
      category: 'DESIGN',
      type: ListingType.OFFERING,
      title: 'Figma Auto-Layout & Design Tokens Systems',
      description: 'Complete audit of your Figma component library, color tokens, and responsive mobile/desktop variants. Ready for developer handoff.',
      format: ListingFormat.ONLINE,
      creditsPerHr: 2,
      status: ListingStatus.ACTIVE,
      rating: 4.95,
      reviewsCount: 6,
    },
  });

  const listing3 = await prisma.skillListing.create({
    data: {
      authorId: ahmed.id,
      category: 'MATH & CS',
      type: ListingType.LOOKING_FOR,
      title: 'Calculus II Proofs & Integration by Parts',
      description: 'Looking for a math major to help me review series convergence and differential equations for upcoming midterm sprint.',
      format: ListingFormat.ONLINE,
      creditsPerHr: 1,
      status: ListingStatus.ACTIVE,
      rating: 5.0,
      reviewsCount: 2,
    },
  });

  // Bookmark listing2 for Khaled
  await prisma.savedListing.create({
    data: {
      userId: khaled.id,
      listingId: listing2.id,
    },
  });

  console.log('📌 Seeded 3 Skill Listings + 1 Bookmarked Listing');

  // 7. Create Active Agreement Room between Khaled (Requester) & Sara (Provider)
  const room = await prisma.agreementRoom.create({
    data: {
      listingId: listing2.id,
      requesterId: khaled.id,
      providerId: sara.id,
      title: 'Figma Auto-Layout & Design Tokens Systems',
      category: 'DESIGN STUDIO',
      goal: 'Audit Echo Time design system components and verify contrast tokens',
      format: 'Online Google Meet',
      durationHrs: 1,
      creditsPerHr: 1,
      termsVersion: 1,
      stage: AgreementStage.NEGOTIATING,
    },
  });

  // Messages inside the Agreement Room
  await prisma.agreementMessage.createMany({
    data: [
      {
        roomId: room.id,
        senderId: null,
        senderType: MessageSenderType.SYSTEM,
        authorLabel: 'SYSTEM PROTOCOL',
        body: 'Agreement Room opened. Review session terms, confirm reciprocation, and lock escrow.',
      },
      {
        roomId: room.id,
        senderId: sara.id,
        senderType: MessageSenderType.PEER,
        authorLabel: 'Sara Al-Mansoor',
        body: 'Hey Khaled! I reviewed your design token specs. We can audit the color contrast tokens and mobile auto-layout rules in a 1-hour session.',
      },
      {
        roomId: room.id,
        senderId: khaled.id,
        senderType: MessageSenderType.ME,
        authorLabel: 'Khaled Amr Ahmeed',
        body: 'Awesome! I updated the terms to 1 hour (1.00 ECHO). Ready to lock escrow whenever you are.',
      },
    ],
  });

  console.log(`🤝 Seeded Agreement Room: "${room.title}" with 3 messages`);

  // 8. Seed Wallet Transactions for Khaled
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
        roomId: null,
      },
      {
        userId: khaled.id,
        counterpartyInitials: 'AT',
        counterpartyName: 'Ahmed Taha',
        title: 'Settled Python Debug Sprint',
        availableDelta: 1.0,
        reservedDelta: 0.0,
        typeLabel: 'Skill Earned',
        roomId: null,
      },
    ],
  });

  // 9. Seed Community Spaces (including Arabic titles)
  await prisma.communitySpace.createMany({
    data: [
      {
        hostId: khaled.id,
        kind: CommunityKind.PROJECT,
        tag: 'OPEN CAPSTONE',
        eyebrowCta: 'COLLABORATIVE SPRINT',
        title: 'Solar Telemetry PCB Sprint (5 peers)',
        description: 'Multi-disciplinary capstone building solar irradiance sensors and live telemetry dashboard. Hardware + firmware + web team.',
        membersCount: 5,
      },
      {
        hostId: sara.id,
        kind: CommunityKind.GROUP,
        tag: 'CAMPUS GUILD',
        eyebrowCta: 'DESIGNERS & MAKERS',
        title: 'Cairo University Creative Guild',
        description: 'Weekly portfolio critiques, design system audits, and cross-major student design collaborations.',
        membersCount: 14,
      },
      {
        hostId: khaled.id,
        kind: CommunityKind.GROUP,
        tag: 'REGIONAL ALLIANCE',
        eyebrowCta: 'LOCAL COHORT',
        title: 'المحاميد — رابطة طلبة الحاسبات والذكاء الاصطناعي',
        description: 'مجموعة دراسية وتعاونية لتبادل المهارات البرمجية، التدريب على المقابلات التقنية، ومشاريع التخرج الجماعية.',
        membersCount: 28,
      },
      {
        hostId: ahmed.id,
        kind: CommunityKind.EVENT,
        tag: 'HACKATHON SPRINT',
        eyebrowCta: 'CAMPUS COMPETITION',
        title: '48-Hour Open AI Agents Sprint',
        description: 'Live hackathon pairing engineering students with domain experts to build student productivity agents.',
        membersCount: 42,
      },
    ],
  });

  console.log('🏛️ Seeded 4 Community Spaces');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
