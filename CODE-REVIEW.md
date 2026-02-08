# 🏺 Code Archaeologist Report — DynamicQR

**Date:** 2026-02-08
**Codebase Age:** Modern (Next.js 16, React 19, Prisma 6, Zod 4, Tailwind 4)
**Overall Health:** ⭐⭐⭐⭐½ (4.5/5) — Clean MVP with solid foundations. Sprint 0 refactoring completed 2026-02-08.

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

#### ~~H-1: `toQrJson()` duplicated across 2 files~~ ✅ RESOLVED
- **Resolution:** Extracted to `src/lib/qr/types.ts` with shared `QrCodeRecord`, `QrCodeListItem`, `QrCodeJson` types and `toQrJson()` function. All API routes now import from single source.

#### ~~H-2: `toUnauthorizedResponse()` duplicated across 3 files~~ ✅ RESOLVED
- **Resolution:** Extracted `toUnauthorizedResponse()` and `toRateLimitedResponse()` to `src/lib/security/responses.ts`. Used by 4 API routes.

#### ~~H-3: `isRedirectError()` duplicated in 2 files~~ ✅ RESOLVED
- **Resolution:** Extracted to `src/lib/next/redirect.ts`. Both `AuthModal.tsx` and `dashboard/actions.ts` now import from shared util.

#### ~~H-4: Analytics loads ALL scan events into memory~~ ✅ RESOLVED
- **Resolution:** Replaced `findMany()` + in-memory computation with 3 parallel raw SQL queries:
  - KPIs (`COUNT(*)`, `COUNT(DISTINCT ip_hash)`, `COUNT(*) FILTER`) in one query
  - Daily series via `GROUP BY to_char(scanned_at, 'YYYY-MM-DD')`
  - Top QR codes via `GROUP BY qr_code_id` with `JOIN qr_codes` and `LIMIT 5`
- Analytics now scales to millions of events without OOM risk. `summary.ts` retained for its tests only.

#### ~~H-5: Dashboard page is a 491-line monolith~~ ✅ RESOLVED
- **Resolution:** Split into 4 files:
  - `src/app/dashboard/page.tsx` — 174 lines (data fetching + layout only)
  - `src/app/dashboard/components/AnalyticsTab.tsx` — filters, KPIs, tables
  - `src/app/dashboard/components/QrCodesTab.tsx` — create form + QR list
  - `src/app/dashboard/components/KpiCards.tsx` — 4 KPI cards
- Ready for feature gating in Pro plan.

#### ~~H-6: `QrCode` type duplicated in 3 places~~ ✅ RESOLVED
- **Resolution:** Created `src/lib/qr/types.ts` with `QrCodeRecord` (full) and `QrCodeListItem` (without `updatedAt`). Both `qr-list-item.tsx` and `qr-edit-modal.tsx` now import shared types.

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

#### ~~M-4: Login page (`/login/page.tsx`) uses light theme, rest of app is dark~~ ✅ RESOLVED
- **Resolution:** Deleted `src/app/login/page.tsx` (dead code — middleware redirects all traffic away). Server actions in `src/app/login/actions.ts` retained (used by `AuthModal`).

#### ~~M-5: `buildReturnToPath()` and `buildTabHref()` are near-identical~~ ✅ RESOLVED
- **Resolution:** Replaced both with `buildDashboardUrl()` in `src/app/dashboard/url.ts`. Single function handles all dashboard URL construction.

#### M-6: No CSRF protection on server actions
- **Impact:** Next.js 16 server actions have some built-in protection (origin check), but explicit CSRF tokens would be safer for the billing endpoints coming in Pro plan.
- **Fix:** Add CSRF token validation for sensitive mutations (billing, admin)

#### ~~M-7: `getAuthenticatedProfile()` does an upsert on every call~~ ✅ RESOLVED
- **Resolution:** `getAuthenticatedProfile()` now does `findUnique` first (read-only). Falls back to `ensureProfile()` (upsert) only when profile doesn't exist yet. Eliminates unnecessary DB writes on every authenticated request.

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

## 6. ~~File Clutter in Project Root~~ ✅ RESOLVED

All planning/documentation files organized into `docs/` folder:

| File | New Location |
|------|-------------|
| `SECURITY-AUDIT.md` | Root (kept) |
| `CODE-REVIEW.md` | Root (kept) |
| `README.md` | Root (kept) |
| `pro-billing-feature-gating.md` | `docs/` ✅ |
| `IMPLEMENTATION_SPRINT_PLAN.md` | `docs/` ✅ |
| `EXTERNAL_INTEGRATIONS_PREP_PLAN.md` | `docs/` ✅ |
| `OPERATIONS_RUNBOOK.md` | `docs/` ✅ |
| `authentication-setup-guide.md` | `docs/` ✅ |
| `session-summary.md` | `docs/` ✅ |
| `test-result.md` | `docs/` ✅ |
| `img-*.png` (4 files) | `docs/images/` ✅ |
| `sprint-implementation-planner/` | `docs/` ✅ |

---

## 7. Refactoring Plan (Prioritized)

### ~~Before Pro Plan Implementation (Sprint 0)~~ ✅ COMPLETED (2026-02-08)

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Extract `toQrJson()` → `src/lib/qr/types.ts` (H-1) | ✅ Done | `33342b2` |
| 2 | Extract `toUnauthorizedResponse()` → `src/lib/security/responses.ts` (H-2) | ✅ Done | `33342b2` |
| 3 | Extract `isRedirectError()` → `src/lib/next/redirect.ts` (H-3) | ✅ Done | `33342b2` |
| 4 | Replace in-memory analytics with SQL aggregations (H-4) | ✅ Done | `33342b2` |
| 5 | Split dashboard into `AnalyticsTab`, `QrCodesTab`, `KpiCards` (H-5) | ✅ Done | `33342b2` |
| 6 | Create shared QR types `QrCodeRecord`, `QrCodeListItem` (H-6) | ✅ Done | `33342b2` |
| 7 | Merge URL builders → `buildDashboardUrl()` (M-5) | ✅ Done | `33342b2` |
| 8 | Delete dead `/login` page (M-4) | ✅ Done | `33342b2` |
| 9 | Split `getAuthenticatedProfile` → read-first + upsert fallback (M-7) | ✅ Done | `33342b2` |
| 10 | Organize root docs into `docs/` folder | ✅ Done | `33342b2` |

**All 10 Sprint 0 items completed.** Build ✅, TypeScript ✅, 29/29 tests ✅.

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
├── DashboardPage (dashboard/page.tsx) [SSC] ← 174 lines (data + layout)
│   ├── AnalyticsTab [SSC] ← filters, KPIs, tables
│   │   └── KpiCards [SSC] ← 4 metric cards
│   ├── QrCodesTab [SSC] ← create form + list
│   │   └── QrListItem [Client]
│   │       └── QrEditModal [Client] ← uses <dialog>
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

This is a **well-structured MVP** with clean code, good separation of concerns, and solid security practices.

### Post-Sprint 0 Status
All HIGH findings resolved. The remaining open items are:
- **M-1**: In-memory rate limiting (acceptable for single instance)
- **M-2**: No pagination on QR code list (needed for Pro)
- **M-3**: `LandingContent.tsx` has inline SVG icons (cosmetic)
- **M-6**: No explicit CSRF tokens (needed for billing endpoints)
- **L-1 through L-6**: Low-priority nice-to-haves

The codebase is **ready for Pro plan implementation**. Dashboard is modular, analytics scales, shared utilities prevent divergence.

> *"Every line of legacy code was someone's best effort. Understand before you judge."*
> — This codebase shows clear intent and good engineering decisions throughout.

---

## Appendix: Sprint 0 Changelog

**Commit:** `33342b2` (2026-02-08)

### New files created
| File | Purpose |
|------|--------|
| `src/lib/qr/types.ts` | Shared QR code types + `toQrJson()` serializer |
| `src/lib/security/responses.ts` | Shared `toUnauthorizedResponse()`, `toRateLimitedResponse()` |
| `src/lib/next/redirect.ts` | Shared `isRedirectError()` |
| `src/app/dashboard/url.ts` | Shared `buildDashboardUrl()` |
| `src/app/dashboard/components/AnalyticsTab.tsx` | Analytics filters, KPIs, daily/top tables |
| `src/app/dashboard/components/QrCodesTab.tsx` | QR create form + list |
| `src/app/dashboard/components/KpiCards.tsx` | 4 KPI metric cards |

### Files modified
| File | Change |
|------|-------|
| `src/app/api/qr-codes/route.ts` | Removed 36 lines of duplicated helpers, imports shared utils |
| `src/app/api/qr-codes/[id]/route.ts` | Removed 22 lines of duplicated helpers, imports shared utils |
| `src/app/api/qr/[slug]/route.ts` | Removed `toUnauthorizedResponse()`, imports shared |
| `src/app/api/analytics/export/route.ts` | Uses shared `toUnauthorizedResponse()` |
| `src/app/components/AuthModal.tsx` | Removed inline `isRedirectError()`, imports shared |
| `src/app/dashboard/actions.ts` | Removed inline `isRedirectError()`, imports shared |
| `src/app/dashboard/page.tsx` | 491 → 174 lines, delegates to sub-components |
| `src/components/qr-list-item.tsx` | Uses shared `QrCodeListItem` type |
| `src/components/qr-edit-modal.tsx` | Uses shared `QrCodeListItem` type |
| `src/lib/analytics/service.ts` | Replaced `findMany` + JS computation with 3 raw SQL queries |
| `src/lib/auth/user.ts` | `getAuthenticatedProfile()` → `findUnique` first, `ensureProfile()` fallback |

### Files deleted
| File | Reason |
|------|-------|
| `src/app/login/page.tsx` | Dead code — middleware redirects all traffic away |

### Files moved
| From | To |
|------|----|
| `pro-billing-feature-gating.md` | `docs/` |
| `IMPLEMENTATION_SPRINT_PLAN.md` | `docs/` |
| `EXTERNAL_INTEGRATIONS_PREP_PLAN.md` | `docs/` |
| `OPERATIONS_RUNBOOK.md` | `docs/` |
| `authentication-setup-guide.md` | `docs/` |
| `session-summary.md` | `docs/` |
| `test-result.md` | `docs/` |
| `img-*.png` (4 files) | `docs/images/` |
| `sprint-implementation-planner/` | `docs/` |
