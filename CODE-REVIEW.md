# 🏺 Code Archaeologist Report — DynamicQR

**Date:** 2026-02-08
**Codebase Age:** Modern (Next.js 16, React 19, Prisma 6, Zod 4, Tailwind 4)
**Overall Health:** ⭐⭐⭐⭐ (4/5) — Clean MVP with solid foundations, some structural debt to address before scaling.

---

## 1. Architecture Overview

```
Landing Page (SSC) → AuthModal (Client) → Server Actions → Supabase Auth
                                                          → Prisma/PostgreSQL

Dashboard (SSC) → Server Actions → Prisma CRUD
               → API Routes     → Prisma Queries → CSV Export

/r/[slug] (API Route) → Prisma Lookup → 302 Redirect + async ScanEvent insert
```

**Key patterns:**
- Server Components for pages, Client Components only where needed (modals, interactivity)
- Server Actions for form mutations (create/update QR, auth)
- REST API routes for programmatic access + QR image generation
- Zod validation at every boundary (env, forms, JSON, URL params)
- Structured JSON logging via custom observability layer
- In-memory rate limiting per IP

---

## 2. What's Done Well ✅

### Architecture
- **Clean separation of concerns** — `lib/` is well-organized by domain (`qr/`, `analytics/`, `auth/`, `redirect/`, `security/`, `env/`, `observability/`)
- **Ownership checks everywhere** — `assertOwnership()` is called before every QR code mutation/read
- **Prisma singleton** — correct `globalThis` pattern prevents connection pool exhaustion in dev
- **Env validation** — Zod schema validates all env vars at startup, not at usage time
- **Error classes** — `QrOwnershipError`, `QrDuplicateSlugError`, `QrValidationError` give clear domain semantics
- **IP hashing** — HMAC-SHA256 with server secret, not raw IPs stored
- **Bot detection** — thoughtful heuristic (bot patterns + desktop OS = suspicious for QR scans)
- **Redirect route bypasses middleware** — `/r/` routes skip auth middleware for speed
- **Fire-and-forget scan logging** — `void prisma.scanEvent.create(...)` doesn't block the redirect

### Code Quality
- **Consistent code style** — uniform formatting, naming conventions, file structure
- **TypeScript strict** — no `any` types found, proper type narrowing
- **Zod at boundaries** — form input, JSON input, URL params all validated
- **Minimal dependencies** — only 8 runtime deps, no bloat
- **Test coverage for pure functions** — `summary.ts`, `csv.ts`, `filters.ts`, `ownership.ts`, `validation.ts`, `rate-limit.ts`, `scan-utils.ts` all have tests
- **Security headers** — X-Frame-Options, HSTS, nosniff, Permissions-Policy
- **Sanitized error responses** — health endpoint doesn't leak DB errors

### UX
- **i18n ready** — EN/PL with context-based language switching
- **Accessible animations** — `prefers-reduced-motion` respected
- **Dark theme** — consistent design tokens via CSS custom properties

---

## 3. Risk Factors & Issues

### 🔴 HIGH — Fix Before Scaling

#### H-1: `toQrJson()` duplicated across 2 files
- **Files:** `src/app/api/qr-codes/route.ts:28-46` and `src/app/api/qr-codes/[id]/route.ts:23-41`
- **Risk:** Divergence when adding fields (e.g., `expiresAt` for the billing plan)
- **Fix:** Extract to `src/lib/qr/serialization.ts`

#### H-2: `toUnauthorizedResponse()` duplicated across 3 files
- **Files:** `src/app/api/qr-codes/route.ts:11`, `src/app/api/qr-codes/[id]/route.ts:19`, `src/app/api/qr/[slug]/route.ts:9`
- **Fix:** Extract to `src/lib/security/responses.ts`

#### H-3: `isRedirectError()` duplicated in 2 files
- **Files:** `src/app/components/AuthModal.tsx:57-64` and `src/app/dashboard/actions.ts:45-52`
- **Risk:** Custom implementation may break with Next.js updates. Next.js exports `isRedirectError` from `next/dist/client/components/redirect-error`.
- **Fix:** Extract to `src/lib/next/redirect.ts` or import from Next.js directly

#### H-4: Analytics loads ALL scan events into memory
- **File:** `src/lib/analytics/service.ts:53-74`
- **Risk:** `prisma.scanEvent.findMany()` with no pagination. A user with 100K scans will OOM the server.
- **Fix:** Use Prisma `groupBy` + raw SQL aggregations for KPIs, daily series, and top QR codes instead of loading all events and computing in JS.

#### H-5: Dashboard page is a 491-line monolith
- **File:** `src/app/dashboard/page.tsx`
- **Risk:** Hard to maintain, test, or gate features (needed for Pro plan). Mixes data fetching, URL building, and UI rendering.
- **Fix:** Extract into sub-components: `<AnalyticsTab />`, `<QrCodesTab />`, `<QrCreateForm />`, `<AnalyticsFilters />`, `<KpiCards />`

#### H-6: `QrCode` type duplicated in 3 places
- **Files:** `src/components/qr-list-item.tsx:7-14`, `src/components/qr-edit-modal.tsx:8-15`, `src/lib/qr/service.ts:26-31`
- **Risk:** Type drift when schema changes
- **Fix:** Use Prisma-generated types or a shared type in `src/lib/qr/types.ts`

### 🟡 MEDIUM — Address Before Pro Plan

#### M-1: In-memory rate limiting doesn't survive restarts or scale horizontally
- **File:** `src/lib/security/rate-limit.ts`
- **Impact:** Rate limits reset on deploy. Multiple Railway instances = no shared state.
- **Fix:** Move to Redis (Upstash) or Supabase-backed rate limiting when scaling. Acceptable for single-instance MVP.

#### M-2: No pagination on QR code list
- **File:** `src/lib/qr/service.ts:75-81` — `findMany` with no `take`/`skip`
- **Impact:** Free users capped at 10, but Pro users could have thousands.
- **Fix:** Add cursor-based pagination before Pro launch.

#### M-3: `LandingContent.tsx` is 426 lines
- **File:** `src/app/components/LandingContent.tsx`
- **Impact:** Hard to maintain. Contains 6 inline SVG icon components (lines 16-83).
- **Fix:** Extract icons to `src/app/components/icons/` directory.

#### M-4: Login page (`/login/page.tsx`) uses light theme, rest of app is dark
- **File:** `src/app/login/page.tsx` — `bg-white`, `text-zinc-900`, `border-zinc-200`
- **Impact:** Jarring UX if user lands on `/login` directly. Middleware redirects `/login` → `/?auth=signin` but the page still exists.
- **Fix:** Either delete the page (middleware already redirects) or restyle to dark theme. Since middleware redirects both authenticated and unauthenticated users away from `/login`, this page is effectively dead code.

#### M-5: `buildReturnToPath()` and `buildTabHref()` are near-identical
- **File:** `src/app/dashboard/page.tsx:34-91`
- **Impact:** 58 lines of duplicated URL-building logic
- **Fix:** Merge into a single `buildDashboardUrl()` helper

#### M-6: No CSRF protection on server actions
- **Impact:** Next.js 16 server actions have some built-in protection (origin check), but explicit CSRF tokens would be safer for the billing endpoints coming in Pro plan.
- **Fix:** Add CSRF token validation for sensitive mutations (billing, admin)

#### M-7: `getAuthenticatedProfile()` does an upsert on every call
- **File:** `src/lib/auth/user.ts:32-43`
- **Impact:** Every authenticated page load does a `prisma.profile.upsert()`. This is fine for MVP but adds unnecessary DB writes on every request.
- **Fix:** Split into `getProfile()` (read-only, cached) and `ensureProfile()` (upsert, called only on first sign-in)

### 🟢 LOW — Nice to Have

#### L-1: No `DELETE` endpoint for QR codes
- **File:** `src/app/api/qr-codes/[id]/route.ts:119-153`
- **Impact:** `DELETE` actually calls `setOwnedQrCodeStatus(false)` — it deactivates, not deletes. The HTTP semantics are misleading.
- **Fix:** Rename to `PATCH` with `{ isActive: false }`, or add actual delete functionality.

#### L-2: `@types/qrcode` in `dependencies` instead of `devDependencies`
- **File:** `package.json:24`
- **Impact:** Ships type definitions to production unnecessarily.
- **Fix:** Move to `devDependencies`.

#### L-3: No `robots.txt` or `sitemap.xml`
- **Impact:** SEO basics missing for the landing page.
- **Fix:** Add `public/robots.txt` and a dynamic sitemap route.

#### L-4: `html lang="en"` hardcoded despite i18n support
- **File:** `src/app/layout.tsx:31`
- **Impact:** Screen readers always announce English regardless of selected language.
- **Fix:** Pass locale from `LanguageProvider` to `<html lang={locale}>` (requires lifting state to layout).

#### L-5: No loading/error boundaries
- **Impact:** No `loading.tsx` or `error.tsx` in `/dashboard` or `/` routes. Users see blank screen during SSR.
- **Fix:** Add `loading.tsx` with skeleton UI and `error.tsx` with retry button.

#### L-6: CSS animation classes defined manually instead of Tailwind plugin
- **File:** `src/app/globals.css:47-112`
- **Impact:** 65 lines of custom CSS that could be Tailwind utilities.
- **Fix:** Low priority — works fine, just not idiomatic Tailwind 4.

---

## 4. Dependency Analysis

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `next` | 16.1.6 | ✅ Current | Using new `proxy.ts` convention |
| `react` | 19.2.3 | ✅ Current | |
| `@prisma/client` | ^6.16.2 | ✅ Current | |
| `@supabase/ssr` | ^0.8.0 | ✅ Current | |
| `@supabase/supabase-js` | ^2.95.3 | ✅ Current | |
| `qrcode` | ^1.5.4 | ✅ Stable | |
| `zod` | ^4.3.6 | ✅ Current | Zod 4 (latest) |
| `server-only` | ^0.0.1 | ✅ | Not actually imported anywhere — verify if needed |
| `vitest` | ^4.0.18 | ✅ Current | |

**No circular dependencies detected.**
**No vulnerable packages detected** (based on version analysis).

### Unused dependency check
- `server-only` — not imported in any source file. Can be removed unless planned for future use.

---

## 5. Test Coverage Assessment

| Module | Has Tests | Coverage Quality |
|--------|-----------|-----------------|
| `lib/analytics/summary.ts` | ✅ | Good — tests KPIs, daily series, top QR |
| `lib/analytics/csv.ts` | ✅ | Good — tests escaping, formatting |
| `lib/analytics/filters.ts` | ✅ | Good — tests date parsing, defaults |
| `lib/qr/ownership.ts` | ✅ | Good — tests ownership assertion |
| `lib/qr/validation.ts` | ✅ | Good — tests slug, URL, name validation |
| `lib/redirect/scan-utils.ts` | ✅ | Good — tests IP extraction, bot detection |
| `lib/security/rate-limit.ts` | ✅ | Good — tests window, limits, reset |
| `lib/env/server.ts` | ✅ | Good — tests env parsing |
| **API routes** | ❌ | No integration tests |
| **Server actions** | ❌ | No tests |
| **Components** | ❌ | No component tests |
| **Middleware (proxy.ts)** | ❌ | No tests |

**Estimated branch coverage:** ~40% (pure functions well-tested, integration layer untested)

---

## 6. File Clutter in Project Root

The project root has accumulated several planning/documentation files that should be organized:

| File | Size | Recommendation |
|------|------|---------------|
| `SECURITY-AUDIT.md` | 10KB | ✅ Keep |
| `CODE-REVIEW.md` | This file | ✅ Keep |
| `README.md` | 2KB | ✅ Keep |
| `pro-billing-feature-gating.md` | 28KB | Move to `docs/` |
| `IMPLEMENTATION_SPRINT_PLAN.md` | 10KB | Move to `docs/` |
| `EXTERNAL_INTEGRATIONS_PREP_PLAN.md` | 6KB | Move to `docs/` |
| `OPERATIONS_RUNBOOK.md` | 3KB | Move to `docs/` |
| `authentication-setup-guide.md` | 4KB | Move to `docs/` |
| `session-summary.md` | 6KB | Move to `docs/` or delete |
| `test-result.md` | 12KB | Move to `docs/` or delete |
| `img-*.png` (4 files) | ~3.4MB | Move to `docs/images/` or delete |
| `sprint-implementation-planner/` | 3 items | Move to `docs/` |

---

## 7. Refactoring Plan (Prioritized)

### Before Pro Plan Implementation (Sprint 0)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Extract `toQrJson()` to shared serializer (H-1) | 15 min | Prevents divergence |
| 2 | Extract `toUnauthorizedResponse()` to shared helper (H-2) | 10 min | DRY |
| 3 | Extract `isRedirectError()` to shared util (H-3) | 10 min | Prevents breakage |
| 4 | Replace in-memory analytics with SQL aggregations (H-4) | 2-3 hours | Prevents OOM |
| 5 | Split dashboard page into sub-components (H-5) | 1-2 hours | Enables feature gating |
| 6 | Create shared QR code types from Prisma (H-6) | 15 min | Type safety |
| 7 | Merge `buildReturnToPath`/`buildTabHref` (M-5) | 15 min | DRY |
| 8 | Delete or restyle `/login` page (M-4) | 15 min | Dead code removal |
| 9 | Split `getAuthenticatedProfile` into read/write (M-7) | 30 min | Performance |
| 10 | Organize root docs into `docs/` folder | 10 min | Clean workspace |

**Total Sprint 0 effort: ~5-6 hours**

### During Pro Plan (as needed)
- Add pagination to QR code list (M-2)
- Add CSRF tokens for billing endpoints (M-6)
- Move rate limiting to Redis (M-1)
- Add loading/error boundaries (L-5)
- Fix `html lang` attribute (L-4)

---

## 8. Component Tree

```
RootLayout (layout.tsx)
├── HomePage (page.tsx) [SSC]
│   └── LanguageProvider [Client]
│       └── LandingContent [Client] ← 426 lines, has modal state
│           ├── LandingAuthButtons [Client] ← calls onOpenAuth()
│           ├── LandingHeroCTA [Client] ← calls onOpenAuth()
│           ├── DashboardMockup [Client]
│           ├── LanguageSwitcher [Client]
│           ├── LandingFinalCTA [Client] ← calls onOpenAuth()
│           └── AuthModal [Client] ← single instance at root level
│
├── DashboardPage (dashboard/page.tsx) [SSC] ← 491 lines
│   ├── QrListItem [Client]
│   │   └── QrEditModal [Client] ← uses <dialog>
│   └── (inline analytics/QR tabs)
│
├── LoginPage (login/page.tsx) [SSC] ← dead code (middleware redirects away)
│
└── API Routes
    ├── /r/[slug] ← redirect handler (public, no auth)
    ├── /api/qr-codes ← CRUD (authenticated)
    ├── /api/qr-codes/[id] ← GET/PATCH/DELETE (authenticated)
    ├── /api/qr/[slug] ← QR image generation (authenticated)
    ├── /api/analytics/export ← CSV export (authenticated)
    ├── /api/health ← health check (public)
    └── /api/health/db ← DB health check (public)
```

---

## 9. Global State Inventory

| State | Location | Scope | Risk |
|-------|----------|-------|------|
| Prisma client | `src/lib/prisma.ts` (globalThis) | Process | ✅ Standard pattern |
| Rate limit buckets | `src/lib/security/rate-limit.ts` (globalThis) | Process | ⚠️ Resets on deploy, no horizontal scaling |
| Language locale | `LanguageContext` (React state) | Client session | ✅ No persistence (resets on reload) |
| Auth modal state | `LandingContent` (React state) | Client session | ✅ Lifted correctly |

**No dangerous global mutations found.**

---

## 10. Summary Verdict

This is a **well-structured MVP** with clean code, good separation of concerns, and solid security practices. The main technical debt is:

1. **Duplication** — several helpers copy-pasted across files (easy fix)
2. **Monolithic dashboard** — needs splitting before feature gating
3. **Analytics scalability** — loading all events into memory won't scale
4. **Dead code** — `/login` page is unreachable

The codebase is in **good shape for the Pro plan implementation**. Spending ~5-6 hours on Sprint 0 refactoring will make the billing/feature-gating work significantly cleaner.

> *"Every line of legacy code was someone's best effort. Understand before you judge."*
> — This codebase shows clear intent and good engineering decisions throughout. The debt is normal for an MVP and well-contained.
