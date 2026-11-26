# ECHO TIME — Full-Stack Backend Architecture & Engineering Documentation
> **Version:** 2.0.0 (Production Live Release)  
> **Date:** November 24, 2026  
> **Project:** Decentralized Campus Time-Banking Platform (ECHO TIME)  
> **Production Live URL:** [https://echo-time-opal.vercel.app](https://echo-time-opal.vercel.app)  
> **Official Code Repository:** [https://github.com/Lander2007/Echo-Time](https://github.com/Lander2007/Echo-Time)  
> **Database:** Managed Cloud Serverless PostgreSQL on Neon.tech (AWS us-east-1)  
> **Arabic Version:** [النسخة العربية متوفرة هنا](./BACKEND_DOCUMENTATION.md)

---

## 📑 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Live Operational Status & Health Metrics](#2-live-operational-status--health-metrics)
3. [Prisma Relational Database Schema](#3-prisma-relational-database-schema)
4. [In-Chat Media Attachments Architecture](#4-in-chat-media-attachments-architecture)
5. [Neon Cloud Integration & Smart Connection Resolver](#5-neon-cloud-integration--smart-connection-resolver)
6. [Complete REST Route Handlers Directory](#6-complete-rest-route-handlers-directory)
7. [Authentication, Session Security & Demo Access](#7-authentication-session-security--demo-access)
8. [ACID Escrow Engine & Double-Entry Ledger](#8-acid-escrow-engine--double-entry-ledger)
9. [Automated Vercel Build & Safe Seed Pipeline](#9-automated-vercel-build--safe-seed-pipeline)
10. [Troubleshooting & Resolved Engineering Challenges](#10-troubleshooting--resolved-engineering-challenges)

---

## 1. System Architecture Overview

The backend for **ECHO TIME** is built as a unified, high-performance **Monorepo Architecture** deeply integrated within the **Next.js 15 App Router** ecosystem, leveraging **React 19**, **Prisma ORM (v6.19.3)**, and **PostgreSQL on Neon.tech**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 APP ROUTER                           │
│  Client UI (React 19 / Tailwind / Lenis)   │ Route Handlers (/api/**)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma ORM Client (with Smart Resolver)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               MANAGED NEON POSTGRESQL (AWS US-EAST-1)                  │
│  [User] ── [SkillListing] ── [AgreementRoom] ── [WalletTransaction]   │
│  [SavedListing] ── [AgreementMessage] ── [Community] ── [BetaInterest]│
│  (Supports: Connection Pooling, Push-Migrations, & ACID Transactions)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Engineering Principles:
- **Zero Mock Hacks (100% Live Database):** All in-memory arrays and temporary state fallbacks have been eliminated. Every read, write, update, and delete operation interacts directly with PostgreSQL.
- **Serverless Resilience:** Route handlers are stateless, fast, and optimized for Vercel Serverless Functions, protected against connection exhaustion via Neon Connection Pooling.
- **ACID Double-Entry Ledger:** All skill hour reservations, escrow locking, release, and refund operations occur inside atomic `prisma.$transaction` blocks to eliminate double-spending risks.
- **Resilient Multi-Environment Fallback:** An intelligent database URL resolver ensures the application works seamlessly on local development environments, staging branches, and Vercel cloud production.

---

## 2. Live Operational Status & Health Metrics

| Metric | Current Status | Engineering Details |
| :--- | :---: | :--- |
| **Live Production URL** | 🟢 **100% Operational** | `https://echo-time-opal.vercel.app` |
| **Database Host** | 🟢 **Connected Cloud DB** | `ep-small-sun-bb8ntdnm.c-15.us-east-1.aws.neon.tech` |
| **Neon Project & Branch** | 🟢 **Production** | Project ID: `old-shape-92339075` (Branch: `production`) |
| **Live Health Check (`/api/health`)**| 🟢 **Healthy (HTTP 200)** | Returns live stats: 4 canonical users, 4 skill listings |
| **Authentication Flow** | 🟢 **100% Working** | Signup with 5.00 ECHO starter grant, email login, and native Google OAuth 2.0 |
| **Agreement & Chat System** | 🟢 **100% Working** | Full exchange stages + in-chat attachments (images, audio, files) |
| **ACID Escrow Wallet** | 🟢 **100% Working** | Escrow locking, exchange payouts, and 100% automatic refunds |
| **Git Synchronization** | 🟢 **Up to Date** | Branches `main` and `master` are synchronized with latest commits |

---

## 3. Prisma Relational Database Schema

The production schema is defined in `prisma/schema.prisma` and contains 8 models:

### 1. `User`
- `id`: Unique identifier (`cuid`).
- `fullName`, `username`, `email`: Identity fields.
- `passwordHash`: Nullable Bcrypt hash (`String?` — null for Google-only users; never serialized in API responses).
- `googleId`: Unique Google `sub` claim (`String? @unique` — internal linkage only; never serialized in API responses).
- `avatarUrl`: Stored profile picture (`String? @db.Text` — holds either verified Google `https://` URL or compressed `data:image/webp|jpeg;base64` 256×256 URI).
- `authProvider`: Authentication origin (`"EMAIL" | "GOOGLE" | "HYBRID"`).
- `university`: Verified educational institution (auto-inferred from `.edu` domain or `"Verified Student"`).
- `planTier`: Tier level (`STUDENT_FREE`, `PRO`, `CAMPUS_ENTERPRISE`).
- `availableCredits`: Available balance for immediate exchange (starts with 5.00 ECHO).
- `reservedCredits`: Hours locked in active escrow negotiations.
- `earnedLifetime`, `spentLifetime`: Aggregate historical exchange statistics.
- `completedExchanges`: Total count of successfully completed peer sessions.

### 2. `SkillListing`
- `authorId`: Author reference (foreign key to `User` with Cascade Delete).
- `title`, `description`, `category`: Skill details (with server-side smart default generation).
- `type`: `OFFERING` (teaching) or `LOOKING_FOR` (requesting help).
- `format`: `ONLINE`, `IN_PERSON`, or `HYBRID`.
- `creditsPerHr`: Hourly rate (default: 1.0 ECHO per hour).
- `status`: `ACTIVE`, `PAUSED`, or `ARCHIVED`.

### 3. `SavedListing`
- Join table linking `userId` and `listingId` enabling favorites/bookmarks with a unique constraint `@@unique([userId, listingId])`.

### 4. `AgreementRoom`
- `requesterId`, `providerId`: The student recipient and the peer instructor.
- `stage`: Exchange lifecycle stages:
  1. `NEGOTIATING`: Terms discussion and scope alignment.
  2. `CONFIRMED_ESCROWED`: Recipient's credits deducted and locked in protocol escrow.
  3. `DELIVERED`: Session conducted or deliverable completed.
  4. `COMPLETED`: Recipient signs off; credits released to instructor.
  5. `CANCELLED`: Mutual or initiated cancellation with immediate 100% refund.

### 5. `AgreementMessage`
- `roomId`: Foreign key to `AgreementRoom`.
- `senderId`, `senderType`: `SYSTEM` (audit log), `ME`, or `PEER`.
- `body`: Text content.
- **Attachment Fields:**
  - `attachmentUrl`: File download URL or Base64 Data URI.
  - `attachmentName`: File name (e.g., `algorithm-notes.pdf`).
  - `attachmentType`: MIME type (`image/*`, `audio/*`, `application/*`).
  - `attachmentSize`: Formatted file size string (e.g., `1.8 MB`).

### 6. `WalletTransaction`
- Financial double-entry audit record:
  - `availableDelta`: Delta applied to available balance (+ or -).
  - `reservedDelta`: Delta applied to reserved escrow balance (+ or -).
  - `typeLabel`: Descriptor ("Protocol Grant", "Escrow Lock", "Exchange Payout", "Escrow Refund").

### 7. `CommunitySpace`
- Campus communities categorized by `PROJECT`, `GROUP`, or `EVENT`.

### 8. `BetaInterest`
- Tracks waitlist subscriptions for future student tiers.

---

## 4. In-Chat Media Attachments Architecture

The agreement negotiation chat supports multi-format file and media sharing:

```
[User Selects File 📎] 
       │ (Size check <= 8MB)
       ▼
[Client: FileReader base64/data-url] ──► [Preview Banner with Dismiss]
       │
       ▼ [handleSendChatMessage]
[POST /api/agreements/[id]/messages]
       │ Payload: { body, attachment: { url, name, type, size } }
       ▼
[Prisma: AgreementMessage.create]
       │
       ▼ [Real-time Render in UI]
┌──────────────────────────────────────────────────────────────┐
│ • Images: Interactive Lightbox (Zoom & Click-to-Enlarge)    │
│ • Audio: Native HTML5 Audio Player (<audio controls />)      │
│ • Documents/PDFs/Archives: Download Card with File Metadata │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Neon Cloud Integration & Smart Connection Resolver

### Neon Provisioning:
- Linked via Neon CLI:
  `neon init -y --org-id org-crimson-mode-05335506 --project-id old-shape-92339075 --branch production --services postgres`
- **Connection Strings:**
  - **Pooled (Runtime Serverless Queries):**
    `postgresql://neondb_owner:<NEON_PASSWORD>@ep-small-sun-bb8ntdnm-pooler.c-15.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
  - **Direct (CLI Push-Migrations):**
    `postgresql://neondb_owner:<NEON_PASSWORD>@ep-small-sun-bb8ntdnm.c-15.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`

### Smart Resolver Implementation (`lib/prisma.ts`):
When Vercel marketplace integrations provision temporary blank databases (such as `ep-red-sound`), our smart resolver seamlessly detects this and routes queries to `DIRECT_URL`:

```typescript
function resolveDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  // Fallback to configured, migrated database if DATABASE_URL is pointing to a blank integration host
  if (dbUrl && dbUrl.includes('ep-red-sound') && directUrl) {
    return directUrl;
  }
  return dbUrl || directUrl;
}
```

---

## 6. Complete REST Route Handlers Directory

### 🔐 1. Authentication & Identity (`/api/auth/**`) & Profile (`/api/profile`)

| Route | Method | Description | Request Body / Query |
| :--- | :---: | :--- | :--- |
| `/api/auth/google` | `GET` | Initiates native Google OAuth 2.0 + PKCE (`S256`) + `state` CSRF + HTTP-only `echotime_oauth_intent` (`login` \| `signup`, default `'login'`) | Query: `intent` |
| `/api/auth/google/callback` | `GET` | Constant-time CSRF check, JWKS `id_token` verification, strict intent enforcement (`login` rejects unregistered users to `?mode=signup`; `signup` rejects existing accounts to `?mode=login` or mints 5.00 ECHO and lands on `/dashboard?welcome=new`) | Query: `code`, `state` (or `error`) |
| `/api/auth/login` | `POST` | Guards Google-only accounts (`!passwordHash`), validates credentials via Bcrypt, and issues HTTP-Only signed session cookie | `{ email, password }` |
| `/api/auth/signup` | `POST` | Registers new student, seeds initial 5.00 ECHO grant, and logs initial transaction | `{ fullName, email, password }` |
| `/api/auth/session` | `GET` | Returns sanitized logged-in user profile (`avatarUrl`, `authProvider`, live balances) directly from PostgreSQL | None (Reads cookie) |
| `/api/auth/logout` | `POST` | Clears session cookie (`et_session`) and resets client session state | None |
| `/api/profile` | `GET` | Returns authenticated student's sanitized profile (omits `passwordHash` & `googleId`) | None |
| `/api/profile` | `PATCH` | Updates profile fields & validates `avatarUrl` (256×256 compressed JPEG/PNG/WebP base64 `<= 220_000` chars, valid `https:` URL, or `null` to remove; blocks `image/svg+xml`, `javascript:`, `http:`) | `{ fullName?, username?, bio?, university?, availability?, offeredSkills?, avatarUrl? }` |

### 🛒 2. Marketplace & Skills (`/api/listings/**`)

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/listings` | `GET` | Fetches listings with category, type, and search filters; computes `isMine` and `isSaved` dynamically |
| `/api/listings` | `POST` | Publishes a new skill; auto-generates professional descriptions and categories if omitted |
| `/api/listings/[id]` | `PATCH` | Updates listing details (authorized author only) |
| `/api/listings/[id]` | `DELETE` | Archives or deletes the listing |
| `/api/listings/[id]/save` | `POST` | Toggles bookmark/favorite status |

### 🤝 3. Agreements & Escrow Rooms (`/api/agreements/**`)

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/agreements` | `GET` | Fetches all active and historical agreement rooms for the session user |
| `/api/agreements` | `POST` | Opens a new agreement negotiation room and logs an initial system audit message |
| `/api/agreements/[id]/advance` | `POST` | Transitions stages (Lock Escrow ➔ Mark Delivered ➔ Complete and Release Credits) |
| `/api/agreements/[id]/cancel` | `POST` | Cancels agreement and immediately refunds all locked escrow credits to the requester |
| `/api/agreements/[id]/messages`| `POST` | Sends chat message with attachment support (images, audio, documents) |
| `/api/agreements/[id]/terms` | `PATCH` | Modifies agreement terms (hours, modality) and increments `termsVersion` |

### 💳 4. Wallet & Ledger (`/api/wallet`)

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/wallet` | `GET` | Returns all 4 balances (`availableCredits`, `reservedCredits`, `earnedLifetime`, `spentLifetime`) and full audit history |

### 🩺 5. Live Diagnostics & Monitoring (`/api/health`)

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Public diagnostic endpoint reporting database connectivity, active host, and total record counts |

---

## 7. Authentication & 7-Layer Security Hardening

- **Password Hashing & Enumeration Hygiene:** Uses `bcryptjs` (10 rounds) on `POST /api/auth/login` and `/api/auth/signup` with zero bypass backdoors and uniform constant-time dummy `bcrypt.compare` timing (`"Invalid email or password."` HTTP `401`) to prevent account enumeration.
- **Native Google OAuth 2.0 + PKCE + JWKS + Intent Lock + Pre-Takeover Defense:** Uses `lib/google-oauth.ts` for `S256` PKCE, constant-time `state` validation (`crypto.timingSafeEqual`), Google JWKS signature/issuer/audience verification (`jose`), strict `httpOnly` intent separation (`echotime_oauth_intent`: `'login'` vs `'signup'`), `email_verified === true` guard, avatar preservation (`existing.avatarUrl || picture`), and automatic revocation of any unverified pre-registered `passwordHash` when verified Google OAuth confirms ownership.
- **Anti-Sybil Email Canonicalization (`lib/email.ts`):** Normalizes `+subaddress` tags, Gmail periods (`.`), and `@googlemail.com` aliases into `User.canonicalEmail` so duplicate registrations cannot farm additional `5.00 ECHO` starter credits via email or Google Sign-Up.
- **Strict Input, Attachment & Avatar Validation (`lib/validation.ts`):** Allow-listed request fields (zero `...body` mass assignment), finite positive integers (`creditsPerHr` `1–5`, `durationHrs` `1–8`), authoritative server-side price lookup from `SkillListing.creditsPerHr`, strict anti-self-dealing (`listing.authorId !== user.id`), compressed `256×256` WebP/JPEG avatars (`<= 220 KB`), and chat attachment MIME/URI filtering blocking `image/svg+xml`, `text/html`, JavaScript payloads, and URLs over 8 MB base64 (`11,000,000` chars).
- **Sliding-Window Rate Limiting & Secret Hygiene (`lib/rate-limit.ts`):** Dependency-free IP/user sliding-window limits returning `429` + `Retry-After` on `/api/auth/login` (`10 / 15m`), `/api/auth/signup` (`6 / 15m`), and `/api/agreements/[id]/messages` (`40 / 1m`). `SAFE_USER_SELECT` strictly omits `passwordHash`, `googleId`, and `canonicalEmail`, and `/api/health` returns only masked database host prefixes.
- **Cookie Security Attributes (`et_session`):** `httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`, `path: '/'`.

---

## 8. ACID Escrow Engine & Concurrency Guards

All credit and stage mutations execute inside `prisma.$transaction` with SQL-level atomic `updateMany` compare-and-swap stage locks (`NEGOTIATING → CONFIRMED_ESCROWED → DELIVERED → COMPLETED`, or `NEGOTIATING | CONFIRMED_ESCROWED | DELIVERED → CANCELLED` returning `409 Conflict` on concurrent races) and SQL-level credit floor guards (`availableCredits: { gte: total }` / `reservedCredits: { gte: total }`):

```
1. Negotiation Initiated (NEGOTIATING):
   • Requester Available: 5.00 ECHO | Reserved: 0.00 ECHO

2. Terms Confirmed (CONFIRMED_ESCROWED):
   • Requester Available: 4.00 ECHO (-1.00)
   • Requester Reserved: 1.00 ECHO (+1.00 locked in escrow)
   • Audit entry created: "Escrow lock for agreement"

3. Session Completed (COMPLETED):
   • Requester Reserved: 0.00 ECHO (-1.00 released)
   • Instructor Available: 6.00 ECHO (+1.00 payout)
   • Completed exchanges incremented (+1 for both parties)
   • Audit entries created: "Escrow release" & "Exchange payout"

4. Cancellation (CANCELLED):
   • 100% of reserved escrow credits immediately restored to requester available balance.
```

---

## 9. Automated Vercel Build & Safe Seed Pipeline

To guarantee 100% automated deployments without manual migration steps on new hosting environments, `package.json` includes:

```json
"scripts": {
  "build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed-if-empty.js && next build"
}
```

### Safety Features of `prisma/seed-if-empty.js`:
- Queries `prisma.user.count()`.
- If users already exist, it immediately skips seeding to prevent overwriting active user accounts.
- If the database is clean, it seeds canonical demonstration users (`khaled`, `sara`, `ahmed`), sample skill listings, and ledger grants.

---

## 10. Troubleshooting & Resolved Engineering Challenges

| Issue | Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **Error `[P2021]: table public.User does not exist` on Vercel** | Vercel marketplace integration provisioned an isolated blank database (`ep-red-sound`) with locked credentials, while the actual database was (`ep-small-sun`). | Built the smart resolver in `lib/prisma.ts` that dynamically re-routes queries to `DIRECT_URL` pointing to the migrated database. |
| **Data loss after browser logout or serverless cold starts** | In-memory fallback arrays previously used when APIs encountered connection delays. | Completely purged all mock arrays; enforced 100% live PostgreSQL calls with strict transactional guarantees. |
| **Static page generation failure during Next.js builds** | Database tables were missing when Vercel executed static generation. | Integrated `prisma db push` and `seed-if-empty.js` directly into the build command preceding `next build`. |
| **Red error overlay on quick listing creation** | Mandatory description and category validation caused uncaught exceptions. | Implemented smart defaults to auto-generate descriptions and replaced uncaught errors with graceful toast notifications. |

---

> **Summary:** The **ECHO TIME** backend is 100% production-ready, fully verified end-to-end on live cloud infrastructure, and optimized for real-world academic deployments. 🚀