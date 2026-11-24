# ECHO TIME — Full-Stack Backend & Vercel Deployment Blueprint

This document specifies the complete, production-grade architecture and implementation roadmap to transition **ECHO TIME** from an interactive frontend prototype into a 100% database-backed, full-stack Next.js 15+ App Router application with live PostgreSQL persistence, ACID escrow credit settlements, and an instant **One-Click Judge Demo Mode**.

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    Client["Next.js App Router (Client & Server Components)"]
    AuthCookie["Signed HTTP-Only Session Cookie (jose / HMAC SHA-256)"]
    JudgeDemo["One-Click Judge Demo Mode (/api/auth/judge-demo)"]

    subgraph API["Next.js Route Handlers (app/api)"]
        AuthRoutes["/api/auth (login, signup, session, logout, judge-demo)"]
        ListingsRoutes["/api/listings (CRUD, search, filter, bookmark)"]
        AgreementRoutes["/api/agreements (negotiate, terms, chat, ACID escrow advance, cancel)"]
        WalletRoutes["/api/wallet (live balance, telemetry, transaction ledger)"]
        CommunityRoutes["/api/community (projects, groups, events, Arabic titles)"]
        ProfileRoutes["/api/profile & /api/subscription/beta"]
    end

    subgraph DB["PostgreSQL Database (Neon / Supabase Serverless)"]
        Prisma["Prisma ORM Client (@prisma/client)"]
        Pooler["PgBouncer Connection Pooling (DATABASE_URL)"]
        Direct["Direct TCP Connection (DIRECT_URL for Migrations)"]
    end

    Client --> AuthCookie --> API
    JudgeDemo --> API
    API --> Prisma --> Pooler --> DB
    Prisma --> Direct --> DB
```

### Key Architectural Tenets
1. **Unified Monorepo:** Frontend pages (`app/(workspace)/*`, `app/page.tsx`, `app/login/page.tsx`) and backend route handlers (`app/api/**/*`) live in a single repository on Vercel with zero microservice sprawl.
2. **Serverless Connection Safety:** Managed PostgreSQL via Neon or Supabase with connection pooling (`DATABASE_URL` via PgBouncer) prevents serverless connection exhaustion, paired with `DIRECT_URL` for migration scripts.
3. **Session Authentication:** Signed HTTP-only session cookies with password hashing (`bcryptjs`) and structured claims (`jose` or Web Crypto).
4. **Instant Competition Judge Demo Entry (`/api/auth/judge-demo`):** A zero-friction one-click button that logs directly into the pre-seeded account of **Khaled Amr Ahmeed** (`khaled@echotime.edu`) with preloaded balance, active agreement negotiations, and live ledger transactions so judges can test every feature without creating an account.
5. **Strict ACID Escrow Ledger:** Credit locking and transfers are executed inside atomic database transactions (`prisma.$transaction`) with balance validation checks to prevent double-spending or credit leaks.

---

## 2. Database Models (`prisma/schema.prisma`)

The database schema is defined in [prisma/schema.prisma](prisma/schema.prisma):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum PlanTier {
  STUDENT_FREE
  PRO
  CAMPUS_ENTERPRISE
}

enum ListingType {
  OFFERING
  LOOKING_FOR
}

enum ListingFormat {
  ONLINE
  IN_PERSON
  HYBRID
}

enum ListingStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}

enum AgreementStage {
  NEGOTIATING
  CONFIRMED_ESCROWED
  DELIVERED
  COMPLETED
  CANCELLED
}

enum MessageSenderType {
  SYSTEM
  ME
  PEER
}

enum CommunityKind {
  PROJECT
  GROUP
  EVENT
}

model User {
  id                 String   @id @default(cuid())
  fullName           String
  username           String   @unique
  email              String   @unique
  passwordHash       String
  university         String   @default("Accredited University")
  bio                String?
  availability       String?  @default("Available for sessions")
  avatarActive       Boolean  @default(true)
  planTier           PlanTier @default(STUDENT_FREE)
  streakDays         Int      @default(3)
  availableCredits   Float    @default(5.0)
  reservedCredits    Float    @default(0.0)
  earnedLifetime     Float    @default(0.0)
  spentLifetime      Float    @default(0.0)
  completedExchanges Int      @default(0)
  offeredSkills      String[] @default([])
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  listings            SkillListing[]
  savedListings       SavedListing[]
  requestedAgreements AgreementRoom[]     @relation("RequestedAgreements")
  providedAgreements  AgreementRoom[]     @relation("ProvidedAgreements")
  messages            AgreementMessage[]
  transactions        WalletTransaction[]
  hostedCommunities   CommunitySpace[]
  betaInterests       BetaInterest[]

  @@index([email])
  @@index([username])
}

model SkillListing {
  id           String        @id @default(cuid())
  authorId     String
  author       User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category     String
  type         ListingType   @default(OFFERING)
  title        String
  description  String
  format       ListingFormat @default(ONLINE)
  creditsPerHr Int           @default(1)
  status       ListingStatus @default(ACTIVE)
  rating       Float         @default(5.0)
  reviewsCount Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  savedBy    SavedListing[]
  agreements AgreementRoom[]

  @@index([authorId])
  @@index([category])
  @@index([status])
}

model SavedListing {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId String
  listing   SkillListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())

  @@unique([userId, listingId])
  @@index([userId])
}

model AgreementRoom {
  id           String         @id @default(cuid())
  listingId    String?
  listing      SkillListing?  @relation(fields: [listingId], references: [id], onDelete: SetNull)
  requesterId  String
  requester    User           @relation("RequestedAgreements", fields: [requesterId], references: [id], onDelete: Cascade)
  providerId   String
  provider     User           @relation("ProvidedAgreements", fields: [providerId], references: [id], onDelete: Cascade)
  title        String
  category     String
  goal         String
  format       String         @default("Online")
  durationHrs  Int            @default(1)
  creditsPerHr Int            @default(1)
  termsVersion Int            @default(1)
  stage        AgreementStage @default(NEGOTIATING)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  messages     AgreementMessage[]
  transactions WalletTransaction[]

  @@index([requesterId])
  @@index([providerId])
  @@index([stage])
}

model AgreementMessage {
  id          String            @id @default(cuid())
  roomId      String
  room        AgreementRoom     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  senderId    String?
  sender      User?             @relation(fields: [senderId], references: [id], onDelete: SetNull)
  senderType  MessageSenderType @default(ME)
  authorLabel String
  body        String
  createdAt   DateTime          @default(now())

  @@index([roomId])
}

model WalletTransaction {
  id                   String         @id @default(cuid())
  userId               String
  user                 User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  counterpartyInitials String
  counterpartyName     String
  title                String
  availableDelta       Float
  reservedDelta        Float
  typeLabel            String
  roomId               String?
  room                 AgreementRoom? @relation(fields: [roomId], references: [id], onDelete: SetNull)
  createdAt            DateTime       @default(now())

  @@index([userId])
}

model CommunitySpace {
  id           String        @id @default(cuid())
  hostId       String
  host         User          @relation(fields: [hostId], references: [id], onDelete: Cascade)
  kind         CommunityKind @default(PROJECT)
  tag          String
  eyebrowCta   String
  title        String
  description  String
  membersCount Int           @default(1)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([hostId])
  @@index([kind])
}

model BetaInterest {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  planKey   String
  createdAt DateTime @default(now())

  @@unique([userId, planKey])
  @@index([userId])
}
```

---

## 3. Seed Strategy (`prisma/seed.ts`)

The database seeder in [prisma/seed.ts](prisma/seed.ts) populates:
1. **Primary Judge Demo User:**
   - Name: `Khaled Amr Ahmeed`
   - Email: `khaled@echotime.edu`
   - Password: `demo1234password`
   - University: `Cairo University — Computer Engineering`
   - Balance: `6.00 ECHO available` | `0.00 ECHO reserved` | `4 completed exchanges`
2. **Demo Peers:**
   - `Sara Al-Mansoor` (`sara@echotime.edu`, Graphic Design, AUC)
   - `Ahmed Taha` (`ahmed@echotime.edu`, Computer Science, Ain Shams)
3. **Canonical Skill Listings:**
   - Next.js 15 App Router Code Audit (Offering, 1.00 ECHO/hr)
   - Figma Auto-Layout Design Tokens (Offering, 2.00 ECHO/hr, bookmarked by Khaled)
   - Calculus II Integration by Parts (Looking for, 1.00 ECHO/hr)
4. **Active Agreement Room:**
   - Between Khaled (Requester) & Sara (Provider)
   - Stage: `NEGOTIATING` (Terms v1)
   - 3 real conversation & system protocol messages
5. **Community Spaces:**
   - Solar Telemetry PCB Sprint (Project)
   - Cairo University Creative Guild (Group)
   - المحاميد — رابطة طلبة الحاسبات والذكاء الاصطناعي (Group with full Arabic RTL text)
   - 48-Hour Open AI Agents Sprint (Event)

---

## 4. API Route Handlers Specification

### 4.1 Authentication (`app/api/auth/*`)
- **`POST /api/auth/signup`**:
  - Validates `email`, `password`, `fullName`, `university`.
  - Creates user with `5.00 ECHO` starter balance.
  - Automatically logs a `"Founding Student Seed Grant"` in `WalletTransaction`.
  - Issues signed `et_session` cookie (`HttpOnly; Secure; SameSite=Lax; Path=/`).
- **`POST /api/auth/login`**:
  - Compares password hash via `bcryptjs`.
  - Issues session cookie.
- **`POST /api/auth/judge-demo`**:
  - Finds or seeds `khaled@echotime.edu`.
  - Automatically issues a signed session cookie as Khaled so the jury is immediately authenticated with a single click.
- **`GET /api/auth/session`**:
  - Decodes cookie and returns live user object with refreshed `availableCredits` and `reservedCredits`.
- **`POST /api/auth/logout`**:
  - Clears the session cookie.

### 4.2 Marketplace Listings (`app/api/listings/*`)
- **`GET /api/listings`**:
  - Query params: `type` (`All | Offers | Requests`), `q` (search term), `category`, `format`, `sort`, `scope` (`all | saved | my`).
  - Returns array of listings with `isSaved` boolean populated for current user.
- **`POST /api/listings`**:
  - Creates listing for authenticated user.
- **`PATCH /api/listings/[id]` & `DELETE /api/listings/[id]`**:
  - Verifies ownership and updates or archives listing.
- **`POST /api/listings/[id]/save`**:
  - Toggles row in `SavedListing` table.

### 4.3 Agreement Rooms & ACID Escrow Settlement (`app/api/agreements/*`)
- **`GET /api/agreements`**:
  - Returns rooms where user is `requesterId` or `providerId`, with messages and counterparty details.
- **`POST /api/agreements`**:
  - Creates agreement room for a listing, with an initial `SYSTEM` greeting message.
- **`PATCH /api/agreements/[id]/terms`**:
  - Updates `goal`, `format`, `durationHrs`, `creditsPerHr` while in `NEGOTIATING` and increments `termsVersion`.
- **`POST /api/agreements/[id]/messages`**:
  - Inserts new message into `AgreementMessage`.
- **`POST /api/agreements/[id]/advance`**:
  - Implements the 3-stage state machine inside `prisma.$transaction`:
    1. **`NEGOTIATING → CONFIRMED_ESCROWED`**:
       - Calculates `total = durationHrs * creditsPerHr`.
       - Checks `requester.availableCredits >= total`. If insufficient, aborts with `400 Bad Request`.
       - Decrements `requester.availableCredits` by `total`.
       - Increments `requester.reservedCredits` by `total`.
       - Logs `WalletTransaction` for Escrow Lock.
       - Sets stage to `CONFIRMED_ESCROWED` and adds system message.
    2. **`CONFIRMED_ESCROWED → DELIVERED`**:
       - Verifies session work delivered, advances stage to `DELIVERED`, logs system message.
    3. **`DELIVERED → COMPLETED`**:
       - Decrements `requester.reservedCredits` by `total`.
       - Increments `requester.spentLifetime` by `total` and `completedExchanges` by 1.
       - Increments `provider.availableCredits` by `total`, `earnedLifetime` by `total`, and `completedExchanges` by 1.
       - Logs payout and debit transactions in `WalletTransaction`.
       - Sets stage to `COMPLETED`.
- **`POST /api/agreements/[id]/cancel`**:
  - If in `CONFIRMED_ESCROWED`, atomically refunds `reservedCredits` back to `availableCredits`.
  - Sets stage to `CANCELLED`.

### 4.4 Wallet, Community, & Profile
- **`GET /api/wallet`**:
  - Returns live telemetry (`availableCredits`, `reservedCredits`, `earnedLifetime`, `spentLifetime`) and history of `WalletTransaction` records.
- **`GET /api/community`, `POST /api/community`, `PATCH /api/community/[id]`, `DELETE /api/community/[id]`**:
  - Full CRUD for campus initiatives, capstone guilds, and study groups.
- **`GET /api/profile` & `PATCH /api/profile`**:
  - Updates profile fields, offered skills list, and availability.
- **`POST /api/subscription/beta`**:
  - Toggles beta plan waitlist interest in `BetaInterest`.

---

## 5. Implementation Roadmap (5 Sprints)

| Sprint | Deliverable | Key Files |
|---|---|---|
| **Sprint 1** | Database Engine & Prisma Setup | `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts` |
| **Sprint 2** | Auth & Judge Demo Entry | `lib/auth.ts`, `app/api/auth/**`, Judge Demo button in `/login` |
| **Sprint 3** | Listings & Saved Bookmarks API | `app/api/listings/**`, wire into `app/(workspace)/explore/page.tsx` |
| **Sprint 4** | Agreement Rooms & ACID Escrow | `app/api/agreements/**`, wire into `app/(workspace)/agreement/page.tsx` |
| **Sprint 5** | Wallet, Community, Profile & Vercel Deploy | `app/api/wallet/**`, `app/api/community/**`, Vercel deploy & seed |

---

## 6. Vercel Deployment Guide

1. **Environment Variables on Vercel:**
   ```bash
   DATABASE_URL="postgresql://user:pass@pooler.neon.tech/echotime?pgbouncer=true&connect_timeout=15"
   DIRECT_URL="postgresql://user:pass@ep-xyz.neon.tech/echotime?connect_timeout=15"
   AUTH_SECRET="super-strong-random-32-byte-hex-or-jwt-secret"
   NEXT_PUBLIC_APP_URL="https://echo-time.vercel.app"
   ```

2. **Run Migrations & Seed Against Remote DB:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Verify Competition Jury Experience:**
   - Jury visits live production URL.
   - Click **"Judge Demo Login"** on `/login` or `/`.
   - Instant access as Khaled Amr Ahmeed with active credits and transactions.
   - Advance agreements, post new skills, and verify reactive balance changes live.
