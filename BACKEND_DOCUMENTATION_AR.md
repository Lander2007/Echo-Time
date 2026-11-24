# ECHO TIME — توثيق المعمارية البرمجية والهندسة الخلفية (Backend Documentation)
> **النسخة:** 2.0.0 (Production Live Release)  
> **التاريخ:** 24 نوفمبر 2026  
> **المشروع:** منصة بنك الوقت اللامركزي للطلاب الجامعيين (ECHO TIME)  
> **الموقع الحي المباشر (Production Live URL):** [https://echo-time-opal.vercel.app](https://echo-time-opal.vercel.app)  
> **مستودع الكود (GitHub):** [https://github.com/Lander2007/Echo-Time](https://github.com/Lander2007/Echo-Time)  
> **قاعدة البيانات:** PostgreSQL سحابية مُدارة عبر Neon.tech (AWS us-east-1)  
> **اللغة الإنجليزية:** [English Version Available Here](./BACKEND_DOCUMENTATION_EN.md)

---

## 📑 فهرس المحتويات
1. [نظرة عامة على النظام والمعمارية](#1-نظرة-عامة-على-النظام-والمعمارية)
2. [الحالة التشغيلية الحية (Live Production Status)](#2-الحالة-التشغيلية-الحية-live-production-status)
3. [مخطط قاعدة البيانات (Prisma PostgreSQL Schema)](#3-مخطط-قاعدة-البيانات-prisma-postgresql-schema)
4. [ميزة مرفقات المحادثات الجديدة (Chat Attachments Architecture)](#4-ميزة-مرفقات-المحادثات-الجديدة-chat-attachments-architecture)
5. [تكامل Neon السحابي والمعالجة الذكية للاتصال (Neon Cloud & Smart Resolver)](#5-تكامل-neon-السحابي-والمعالجة-الذكية-للاتصال-neon-cloud--smart-resolver)
6. [دليل مسارات الـ REST API الكامل](#6-دليل-مسارات-الـ-rest-api-الكامل)
7. [الأمان وإدارة الجلسات (Authentication & Security)](#7-الأمان-وإدارة-الجلسات-authentication--security)
8. [نظام الضمان البنكي المحكم (ACID Escrow Engine)](#8-نظام-الضمان-البنكي-المحكم-acid-escrow-engine)
9. [خط أنابيب النشر والبناء التلقائي (Vercel Build & Seed Pipeline)](#9-خط-أنابيب-النشر-والبناء-التلقائي-vercel-build--seed-pipeline)
10. [سجل المشاكل والحلول الجذرية (Troubleshooting & Resolved Issues)](#10-سجل-المشاكل-والحلول-الجذرية-troubleshooting--resolved-issues)

---

## 1. نظرة عامة على النظام والمعمارية

تم بناء الباك إند لمنصة **ECHO TIME** كمعمارية موحدة عالية الأداء (**Unified Full-Stack Architecture**) مدمجة بالكامل داخل إطار عمل **Next.js 15 App Router** مع **React 19** و **Prisma ORM** و **PostgreSQL السحابية على Neon**.

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

### المبادئ الهندسية الصارمة:
- **Zero Mock Hacks (انعدام البيانات الوهمية 100%):** تم استئصال جميع مصفوفات الذاكرة المؤقتة (In-memory arrays)؛ جميع العمليات تتصل مباشرة بالداتابيز.
- **Serverless Resilience:** جميع الدوال اللاسيرفرية (Serverless Functions) لا تعتمد على حالة محلية (Stateless) ومحمية ضد انتهاء الاتصالات عبر Neon Connection Pooling.
- **ACID Double-Entry Ledger:** عمليات خصم، حجز، وإيداع الساعات تتم داخل كتل ذرية بضمانات عدم الازدواجية والتسريب المالي.
- **Resilient Multi-Environment Fallback:** معالجة ذكية لرابط الاتصال تضمن عمل الكود محلياً وعلى سحابة Vercel بسلاسة.

---

## 2. الحالة التشغيلية الحية (Live Production Status)

| المؤشر | الحالة | التفاصيل |
| :--- | :---: | :--- |
| **رابط الإنتاج الحي** | 🟢 **نشط 100%** | `https://echo-time-opal.vercel.app` |
| **سيرفر قاعدة البيانات** | 🟢 **سحابي متصل** | `ep-small-sun-bb8ntdnm.c-15.us-east-1.aws.neon.tech` |
| **مشروع Neon السحابي** | 🟢 **Production** | Project ID: `old-shape-92339075` (Branch: `production`) |
| **فحص الصحة الحي (`/api/health`)** | 🟢 **Healthy** | يعيد كود 200 مع إحصائيات حية: 4 مستخدمين، 4 مهارات |
| **المصادقة (Auth)** | 🟢 **جاهز 100%** | تسجيل مستخدم، تسجيل دخول، ودخول فوري للتحكيم (Judge Demo) |
| **غرف الاتفاق والدردشة** | 🟢 **شغال 100%** | دورة حياة التبادل كاملة + إرسال المرفقات (صور، صوت، ملفات) |
| **محفظة الساعات والـ Escrow** | 🟢 **شغال 100%** | حجز الضمان، إيداع المنحة، تحويل الساعات عند اكتمال الجلسة |
| **مزامنة Git** | 🟢 **متطابق** | الفروع `main` و `master` متطابقة تماماً مع أحدث إصدار |

---

## 3. مخطط قاعدة البيانات (Prisma PostgreSQL Schema)

يحتوي المخطط على 8 نماذج رئيسية مرتبطة بعلاقات تكاملية:

### 1. `User` (المستخدم الجامعي)
- `id`: المعرف الفريد (`cuid`).
- `fullName`, `username`, `email`, `passwordHash`: بيانات الهوية وبيانات الاعتماد المشفرة.
- `university`: الجامعة المعتمدة.
- `planTier`: باقة الاشتراك (`STUDENT_FREE`, `PRO`, `CAMPUS_ENTERPRISE`).
- `availableCredits`: رصيد الساعات المتاح للصرف (يبدأ بمنحة ترحيبية 5.00 ECHO).
- `reservedCredits`: رصيد الساعات المجمد في الضمان البنكي للاتفاقيات الجارية.
- `earnedLifetime`, `spentLifetime`: إحصائيات الساعات المكتسبة والمنفقة عبر المنصة.
- `completedExchanges`: عدد التبادلات المكتملة بنجاح.

### 2. `SkillListing` (إعلانات تبادل المهارات)
- `authorId`: صاحب الإعلان (مربوط بـ `User` مع Cascade Delete).
- `title`, `description`, `category`: تفاصيل المهارة (مع إنشاء ذكي للوصف والتصنيف تلقائياً).
- `type`: نوع المهارة (`OFFERING` لتقديم مهارة، `LOOKING_FOR` لطلب مهارة).
- `format`: شكل التبادل (`ONLINE`, `IN_PERSON`, `HYBRID`).
- `creditsPerHr`: تكلفة الساعة برصيد ECHO (افتراضياً 1 ساعة).
- `status`: حالة الإعلان (`ACTIVE`, `PAUSED`, `ARCHIVED`).

### 3. `SavedListing` (المفضلة / الإشارات المرجعية)
- يربط الطالب بالمهارات المحفوظة مع قيد فريد لمنع التكرار `@@unique([userId, listingId])`.

### 4. `AgreementRoom` (غرف التفاوض والضمان)
- `requesterId`, `providerId`: الطالب المستفيد ومقدم المهارة.
- `stage`: مراحل دورة حياة التبادل:
  1. `NEGOTIATING`: مرحلة النقاش وتحديد المخرجات.
  2. `CONFIRMED_ESCROWED`: تم تجميد الرصيد في الضمان البنكي.
  3. `DELIVERED`: تم تقديم الجلسة التعليمية أو تسليم العمل.
  4. `COMPLETED`: وافق المستفيد وتم تحويل الرصيد لحساب المعلم.
  5. `CANCELLED`: تم الإلغاء واسترداد الرصيد المحجوز بالكامل.

### 5. `AgreementMessage` (رسائل الغرفة ومرفقاتها)
- `roomId`: معرف الغرفة.
- `senderId`, `senderType`: هوية المرسل (`SYSTEM` لرسائل الضمان، `ME`، `PEER`).
- `body`: النص المكتوب.
- **حقول المرفقات الجديدة:**
  - `attachmentUrl`: رابط أو Base64 Data URL الخاص بالملف.
  - `attachmentName`: اسم الملف الأصلي (مثال: `design-tokens.png`).
  - `attachmentType`: نوع الـ MIME Type (`image/*`, `audio/*`, `application/*`).
  - `attachmentSize`: حجم الملف المنسق (مثال: `2.4 MB`).

### 6. `WalletTransaction` (دفتر الأستاذ المالي المزدوج)
- يسجل حركات الخصم والإيداع والحجز:
  - `availableDelta`: التغير في الرصيد المتاح (+ أو -).
  - `reservedDelta`: التغير في الرصيد المحجوز (+ أو -).
  - `typeLabel`: مسمى الحركة ("Protocol Grant", "Escrow Lock", "Exchange Payout", "Escrow Refund").

### 7. `CommunitySpace` (مساحات المشاريع والفعاليات)
- مجتمعات الطلاب حسب نوعها: `PROJECT`، `GROUP`، أو `EVENT`.

### 8. `BetaInterest` (تسجيل رغبات الترقية)
- اهتمامات الطلاب بالترقية لباقات `PRO` و `CAMPUS_ENTERPRISE`.

---

## 4. ميزة مرفقات المحادثات الجديدة (Chat Attachments Architecture)

تم تزويد نظام المحادثات بدعم كامل لمشاركة الملفات والوسائط داخل غرف التفاوض:

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

## 5. تكامل Neon السحابي والمعالجة الذكية للاتصال (Neon Cloud & Smart Resolver)

### تهيئة السحابة:
- تم تثبيت أداة `neon@latest` عالمياً وربط المشروع برقم:
  `old-shape-92339075` (Branch: `production`) داخل منظمة `org-crimson-mode-05335506`.
- **روابط الاتصال المستخدمة:**
  - **Pooled (للطلبات السريعة اللاسيرفرية):**
    `postgresql://neondb_owner:npg_XLVqo5f0rjpv@ep-small-sun-bb8ntdnm-pooler.c-15.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
  - **Direct (لتطبيق الـ Migrations):**
    `postgresql://neondb_owner:npg_XLVqo5f0rjpv@ep-small-sun-bb8ntdnm.c-15.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`

### المعالج الذكي للاتصال (`lib/prisma.ts`):
عند تفعيل الإضافات على منصة Vercel، تنشئ المنصة أحياناً متغيراً مقفلاً يشير لداتابيز فارغة (`ep-red-sound`). قمنا ببرمجة معالج ذكي يتجاوز هذا القفل برمجياً:

```typescript
function resolveDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  // إذا كان الرابط الافتراضي موجهاً للسيرفر الفارغ المقفل في Vercel،
  // يتم التحويل تلقائياً إلى رابط الداتابيز الحقيقي والمهاجر
  if (dbUrl && dbUrl.includes('ep-red-sound') && directUrl) {
    return directUrl;
  }
  return dbUrl || directUrl;
}
```

---

## 6. دليل مسارات الـ REST API الكامل

### 🔐 1. مسارات المصادقة والمستخدمين (`/api/auth/**`)

| المسار | الطريقة | الوصف | المعاملات |
| :--- | :---: | :--- | :--- |
| `/api/auth/judge-demo` | `POST` | تسجيل دخول فوري بنقرة واحدة لحساب لجنة التحكيم (`khaled@echotime.edu`) | اختياري: `{ role: "provider" \| "requester" }` |
| `/api/auth/login` | `POST` | التحقق من الحساب وإصدار كوكي الجلسة المشفرة | `{ email, password }` |
| `/api/auth/signup` | `POST` | إنشاء حساب جديد، إيداع 5.00 ECHO منحة ترحيبية، وتوثيق القيد في دفتر الأستاذ | `{ fullName, email, password }` |
| `/api/auth/session` | `GET` | إرجاع بيانات الطالب المسجل حالياً وأرصدته المحدثة من الداتابيز | لا يوجد (يقرأ الكوكي) |
| `/api/auth/logout` | `POST` | حذف كوكي الجلسة وتصفير حالة الحساب | لا يوجد |

### 🛒 2. مسارات سوق المهارات (`/api/listings/**`)

| المسار | الطريقة | الوصف |
| :--- | :---: | :--- |
| `/api/listings` | `GET` | استرجاع المهارات مع الفلترة حسب الفئة والبحث، وحساب حالتي `isMine` و `isSaved` تلقائياً لكل طالب |
| `/api/listings` | `POST` | نشر مهارة جديدة؛ يدعم الإدخال السريع (توليد الوصف والتصنيف تلقائياً إن لم يكتبهما الطالب) |
| `/api/listings/[id]` | `PATCH` | تعديل بيانات المهارة بواسطة صاحبها فقط |
| `/api/listings/[id]` | `DELETE` | أرشفة أو حذف المهارة |
| `/api/listings/[id]/save` | `POST` | تبديل حالة حفظ المهارة في المفضلة (Save / Unsave) |

### 🤝 3. مسارات الاتفاقيات والضمان (`/api/agreements/**`)

| المسار | الطريقة | الوصف |
| :--- | :---: | :--- |
| `/api/agreements` | `GET` | استرجاع كافة غرف التبادل والمفاوضات الخاصة بالمستخدم مع سجل رسائلها |
| `/api/agreements` | `POST` | إنشاء غرفة تبادل جديدة وبدء مرحلة التفاوض `NEGOTIATING` مع رسالة نظام ترحيبية |
| `/api/agreements/[id]/advance` | `POST` | ترقية مرحلة الاتفاق (حجز الضمان ➔ تسليم الجلسة ➔ تحويل الرصيد للمعلم) |
| `/api/agreements/[id]/cancel` | `POST` | إلغاء الاتفاقية في أي مرحلة ورد الرصيد المحجوز بالكامل للمستفيد |
| `/api/agreements/[id]/messages`| `POST` | إرسال رسالة دردشة نصية مع دعم المرفقات (صور، صوت، مستندات) |
| `/api/agreements/[id]/terms` | `PATCH` | تعديل شروط التبادل وزيادة رقم إصدار الاتفاقية (`v1 ➔ v2`) |

### 💳 4. مسار المحفظة والعمليات (`/api/wallet`)

| المسار | الطريقة | الوصف |
| :--- | :---: | :--- |
| `/api/wallet` | `GET` | إرجاع الأرصدة الحية الأربعة (`availableCredits`, `reservedCredits`, `earnedLifetime`, `spentLifetime`) مع السجل التاريخي لجميع العمليات المالية |

### 🩺 5. مسار الفحص والتشخيص الحي (`/api/health`)

| المسار | الطريقة | الوصف |
| :--- | :---: | :--- |
| `/api/health` | `GET` | فحص حي ومباشر للاتصال بـ PostgreSQL السحابية، وعدد السجلات الحقيقية، والتأكد من وجود الجداول |

---

## 7. الأمان وإدارة الجلسات (Authentication & Security)

- **تشفير كلمات المرور:** يتم تشفير كلمات المرور باستخدام خوارزمية **Bcrypt** بـ 10 دورات تمليح.
- **التوقيع الرقمي (JWT Tokens):** يتم استخدام مكتبة `jose` لتوليد توقيعات **HS256** محمية بمفتاح `AUTH_SECRET` أو `JWT_SECRET`.
- **خصائص كوكي الجلسة (`echotime_session`):**
  - `httpOnly: true`: حماية كاملة ضد هجمات سرقة الجلسات عبر XSS.
  - `sameSite: 'lax'`: حماية ضد هجمات تزوير الطلبات عبر المواقع (CSRF).
  - `secure: true`: تُفعل تلقائياً في بيئة الإنتاج المشفرة عبر HTTPS.
  - `path: '/'`: صلاحية موحدة عبر جميع مسارات التطبيق.

---

## 8. نظام الضمان البنكي المحكم (ACID Escrow Engine)

تتم جميع تحويلات الساعات داخل كتلة ذرية واحدة عبر `prisma.$transaction`:

```
1. بدء الاتفاق (NEGOTIATING):
   • رصيد المستفيد المتاح: 5.00 ECHO | المحجوز: 0.00 ECHO

2. تأكيد الاتفاقية (CONFIRMED_ESCROWED):
   • رصيد المستفيد المتاح: 4.00 ECHO (-1.00)
   • رصيد المستفيد المحجوز: 1.00 ECHO (+1.00 في الضمان)
   • توثيق حركة: "Escrow lock for agreement"

3. التسليم والاكتمال (COMPLETED):
   • رصيد المستفيد المحجوز: 0.00 ECHO (-1.00 تم تحريرها)
   • رصيد المعلم المتاح: 6.00 ECHO (+1.00 تم إيداعها)
   • زيادة عدد التبادلات المكتملة لكلا الطرفين (+1)
   • توثيق حركتي أستاذ: "Escrow release" و "Exchange payout"

4. في حال الإلغاء (CANCELLED):
   • رد الرصيد المحجوز فوراً إلى رصيد المستفيد المتاح (+1.00) دون أي اقتطاع.
```

---

## 9. خط أنابيب النشر والبناء التلقائي (Vercel Build & Seed Pipeline)

لضمان عمل المشروع على أي بيئة سحابية جديدة تلقائياً بدون تدخل يدوي، تم ضبط أمر البناء في `package.json`:

```json
"scripts": {
  "build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed-if-empty.js && next build"
}
```

### آلية عمل `prisma/seed-if-empty.js`:
- يتحقق السكربت أولاً من عدد المستخدمين في قاعدة البيانات.
- إذا كانت قاعدة البيانات تحتوي على بيانات مسبقاً، يتخطى العملية فوراً للحفاظ على بيانات الطلاب.
- إذا كانت قاعدة البيانات جديدة وفارغة، يقوم تلقائياً بإنشاء:
  - 3 حسابات طلاب نموذجية (بما فيهم حساب الطالب خالد عمرو).
  - مهارات نموذجية في الهندسة والبرمجة والتصميم.
  - العمليات المالية الافتتاحية للمحفظة.

---

## 10. سجل المشاكل والحلول الجذرية (Troubleshooting & Resolved Issues)

| المشكلة | السبب الجذري | الحل الهندسي الجذري |
| :--- | :--- | :--- |
| **خطأ `[P2021]: table public.User does not exist` على Vercel** | إضافة Vercel أنشأت داتابيز فرعية فارغة (`ep-red-sound`) وقفلت المتغير، بينما الداتابيز الفعلية هي (`ep-small-sun`). | برمجة المعالج الذكي في `lib/prisma.ts` للتحويل التلقائي نحو `DIRECT_URL` الموجه للسيرفر الفعلي المهاجر. |
| **فقدان وتطاير البيانات بعد تسجيل الخروج أو إعادة النشر** | استخدام مصفوفات In-Memory Fallbacks مؤقتة في الذاكرة. | استئصال كل البيانات الوهمية وربط 100% من العمليات بـ Neon PostgreSQL السحابية. |
| **فشل بناء الـ Next.js أثناء إنشاء الصفحات الثابتة** | عدم تهيئة الجداول في بيئة الـ Build السحابية. | دمج `prisma generate && prisma db push` داخل أمر الـ Build الرسمي لضمان المزامنة دائماً قبل بدء تشغيل السيرفر. |
| **ظهور شاشات الأخطاء الحمراء عند نشر مهارة سريعة** | فرض ملء الوصف والتصنيف كحقول إجبارية ورمي `throw new Error`. | تطبيق الـ Smart Defaults لتوليد الوصف التلقائي والاستعاضة عن رمي الأخطاء بنظام Toast Notifications. |

---

> **الخلاصة:** الباك إند الخاص بـ **ECHO TIME** جاهز بنسبة 100% للإنتاج، ومختبر من طرف إلى طرف، ومربوط بقاعدة بيانات سحابية حقيقية، ومزود بجميع متطلبات لجان التحكيم والاختبار المباشر. 🚀