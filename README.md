# ECHO TIME — Swiss Editorial University Time Bank

> **"Trade Hours, Not Tuition."**  
> A production-grade Swiss Editorial university time-banking platform built on Next.js 15+ App Router, GSAP ScrollTrigger, Lenis Smooth Scroll, Tailwind CSS, and the Web Audio API.

---

## 🏛️ Executive Summary

**ECHO TIME** eliminates the double-coincidence-of-wants barter problem across university campuses. Instead of 1-to-1 direct swaps, students trade their academic and technical skills into a zero-sum, verified credit ledger where:

$$\text{1.00 Hour of Peer Mentorship} = \text{1.00 ECHO Credit}$$

Credits are cryptographically locked in an atomic escrow vault, settled upon dual sign-off, backed by 48-hour dispute protection, and completely free of tuition inflation or platform fees.

---

## 📐 Swiss Editorial Design Philosophy

The interface follows rigorous Swiss International Typographic principles combined with tactile retro-futuristic telemetry:
- **Strict Color Tokens:**
  - **Dark World (Chamber & Terminal):** `#1A1B17` (Base), `#23251F` (Surface), `#F1EFE8` (Ink), `#989A8E` (Muted), `#C9E54B` (Acid Lime Accent), `#6B84FF` (Pop Blue)
  - **Light World (Thesis & Marketplace):** `#C9E54B` (Acid Lime Base), `#F1EFE8` (Bone Surface), `#1A1B17` (Ink), `#46493D` (Muted Olive), `#1E3AE0` (International Cobalt Accent)
  - **Act VIII Finale:** `#C9E54B` canvas with monumental `#0D0E0B` interactive liquid-distorted wordmark.
- **Typography Matrix:**
  - Display: **Inter** (900/800/700) + **Anton** (Monumental Wordmark)
  - Data & Telemetry: **IBM Plex Mono** (Tabular numbers & ledger timestamps)
  - Zero layout shift loaded via `next/font/google`.

---

## 🎭 8-Act Storytelling Architecture

1. **Act I — 3D Dual-Leaf Architectural Door (`#act-hero`)**
   - Perspective 3D swinging shutter leaves with latch release physics.
   - Screen-shake camera rig using sine/cosine oscillator decay without breaking GSAP pin alignment.
2. **Act II — Swiss Parity Guillotine (`#act-thesis`)**
   - Dual-layer cutaway demonstrating traditional exploitative tutor pricing (\$65–\$120/hr) vs. ECHO 1:1 parity.
   - Interactive draggable blade with pointer capture, keyboard navigation, and synchronized numerical counters.
3. **Act III — Campus Skill Patchboard (`#act-workflow`)**
   - Multi-hop routing matrix eliminating direct barter deadlock.
   - Dynamic SVG cubic Bézier patch cables recalculating in real time.
   - Capstone Guild shared treasury module with interactive hour pledges.
4. **Act IV — Swiss SBB Split-Flap Marketplace (`#act-marketplace`)**
   - Mechanical split-flap departure board inspired by Swiss Federal Railways (SBB CFF FFS).
   - Category filtering, real-time search, sorting, and perforated warm-bone ticket stubs.
5. **Bridge — Rising Carbon Vault Slab & Velocity-Reactive Marquee**
   - Slab radius morph into the atomic ledger chamber.
   - Kinetic marquee with velocity-reactive skew and infinite loops.
6. **Act V — Pinned Thermal Audit Tape (`#act-escrow`)**
   - Pinned thermal ledger printer simulating atomic transaction feeds.
   - Interactive tear-to-settle perforated voucher with tactile noise synthesis.
7. **Act VI — Judge Stress-Test Console (`#act-architecture`)**
   - Live fault-injection switches (Double-Spend Replay, Flash-Run Runaway, Network Partition).
   - Oscilloscope telemetry graph with animated limit thresholds and streaming audit terminal.
8. **Act VII — 3D Founding Student Pass Studio (`#act-pass`)**
   - Interactive 3D tilting card with specular shine tracking pointer position.
   - Deterministic serial generator (`computePassSerial`), embossed Swiss seal, and particle confetti burst.
9. **Act VIII — Interactive Liquid Distortion Finale (`#act-finale`)**
   - SVG `feTurbulence` and `feDisplacementMap` animated at 60fps on pointer velocity.
   - Rotating Swiss colophon seal and back-to-top navigational anchor.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (`strict: true`)
- **Animation:** GSAP 3.12+ (ScrollTrigger, MatchMedia, Context)
- **Smooth Scrolling:** Lenis 1.1+
- **Styling:** Tailwind CSS + Handcrafted Swiss Micro-interactions
- **Audio:** Web Audio API Synthesizer (`TactileAudioEngine`, zero external audio MP3 assets)

```
├── app/
│   ├── layout.tsx          # next/font/google, metadata, global html/body classes
│   ├── globals.css         # Tailwind directives + extracted Swiss Editorial CSS
│   ├── icon.svg            # Minimalist Swiss cross/time favicon
│   └── page.tsx            # Client entry assembling all 8 acts + master GSAP/Lenis choreography
├── types/
│   └── echo.ts             # All TypeScript interfaces
├── data/
│   └── echoData.ts         # CHAPTERS, NAV_LINKS, CIRCUITS, LISTINGS, STRESS_SCENARIOS, PASS_PRESETS
├── lib/
│   ├── audio.ts            # TactileAudioEngine (Web Audio API synth)
│   └── serial.ts           # computePassSerial deterministic hash helper
└── components/
    ├── Preloader.tsx
    ├── CustomCursor.tsx
    ├── ChapterRail.tsx
    ├── Navbar.tsx
    ├── AgreementDrawer.tsx
    ├── ToastStack.tsx
    └── sections/
        ├── Act1HeroDoor.tsx         # 3D Dual-Leaf Opening Door + Mechanical Screen Shake
        ├── Act2Guillotine.tsx       # Scroll + Drag Parity Guillotine Cutaway
        ├── Act3Patchboard.tsx       # Campus Skill Patchboard (SVG Bezier Cables + Guild Bus)
        ├── Act4Marketplace.tsx      # Swiss SBB Split-Flap Board + Perforated Stubs
        ├── VaultMarqueeBridge.tsx   # Rising Carbon Vault Slab + Velocity-Reactive Kinetic Marquee
        ├── Act5AuditTape.tsx        # Pinned Thermal Escrow Printer + Tear-to-Settle Stub
        ├── Act6StressTest.tsx       # Judge Stress-Test Console (3 Faults + Oscilloscope + Terminal)
        ├── Act7PassStudio.tsx       # 3D Tilting Founding Pass + Embossed Seal + Canvas Burst
        ├── Act8EchoFinale.tsx       # #C9E54B Interactive SVG feTurbulence Liquid "ECHO" + Rotating Seal
        └── FooterColophon.tsx
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js 18.18+ or 20+ (Node 24 tested)
- npm 9+ or pnpm / yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at
# http://localhost:3000
```

### Verification Commands
```bash
# Run ESLint validation
npm run lint

# Run production build and static page generation
npm run build
```

---

## 🚢 Vercel Deployment Guide

Deploying ECHO TIME to Vercel requires zero custom environment variables:

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New Project** and import your repository.
3. Ensure Framework Preset is detected as **Next.js**.
4. Leave Build & Output Settings as default (`npm run build`).
5. Click **Deploy**.

---

## ⚖️ License
Proprietary & Confidential. Designed and engineered for the ECHO TIME University Platform.
