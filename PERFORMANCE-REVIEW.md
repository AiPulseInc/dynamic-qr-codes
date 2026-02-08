# Performance Optimizer Report — DynamicQR

**Date:** 2026-02-08
**Methodology:** Static analysis + build output profiling
**Overall Assessment:** Good for MVP. A few targeted fixes will prepare for scale.

---

## 1. Bundle Analysis

### Build Output

| Metric | Value | Status |
|--------|-------|--------|
| Total JS chunks | 816 KB (uncompressed) | ✅ Good |
| Largest chunk | 220 KB | ⚠️ Acceptable, monitor |
| CSS | 52 KB (single file) | ✅ Good |
| Static routes | 2 (`/_not-found`, `/sitemap.xml`) | ✅ |
| Dynamic routes | 10 | ✅ All SSR |
| Runtime dependencies | 8 | ✅ Minimal |

### Client Components (12 total)

| Component | Lines | Concern |
|-----------|-------|---------|
| `LandingContent.tsx` | 360 | ⚠️ Large client bundle — entire landing page is client-rendered |
| `DashboardMockup.tsx` | 426 | ⚠️ Large, ships mock data + 5 inline SVG icons to client |
| `AuthModal.tsx` | ~200 | ✅ Reasonable for modal |
| `qr-edit-modal.tsx` | ~80 | ✅ Small |
| `qr-list-item.tsx` | ~60 | ✅ Small |
| Others (7) | <50 each | ✅ Small |

**No `next/dynamic` imports found** — no lazy loading of client components.

---

## 2. Findings

### 🔴 P1 — CSV Export Loads All Events Into Memory

**File:** `src/lib/analytics/service.ts:201-228`

`getUserAnalyticsCsvRows()` calls `prisma.scanEvent.findMany()` with **no limit**. A Pro user with 500K scan events will load all rows into Node.js memory, serialize to CSV, and send as response.

**Impact:** OOM crash for large datasets. This is the same class of bug that was fixed for analytics KPIs (H-4) but was missed for CSV export.

**Fix:** Stream rows using Prisma cursor-based pagination or add a hard cap (e.g., 50K rows max). For very large exports, consider background job + download link.

---

### 🔴 P2 — `listOwnedQrCodeOptions()` Has No Limit

**File:** `src/lib/analytics/service.ts:33-48`

Called on every dashboard page load to populate the QR code filter dropdown. No `take` limit — a Pro user with 5,000 QR codes loads all of them into the dropdown.

**Impact:** Slow dashboard load, large SSR payload.

**Fix:** Add `take: 100` or implement a searchable dropdown that fetches on-demand.

---

### 🟡 P3 — Landing Page Is Entirely Client-Rendered

**Files:** `src/app/page.tsx`, `src/app/components/LandingContent.tsx`

The entire landing page (360 lines) is a `"use client"` component. This means:
- All HTML is generated client-side (no SSR benefit for SEO)
- Full JS bundle must download + hydrate before content is visible
- LCP is delayed by JS execution time

**Impact:** Poor LCP on slow connections. SEO crawlers may not index content.

**Fix (future):** Extract static sections (hero, features, pricing, footer) into server components. Only interactive parts (auth buttons, language switcher, mockup) need `"use client"`.

---

### 🟡 P4 — `DashboardMockup.tsx` Ships 426 Lines of Mock Data to Client

**File:** `src/app/components/DashboardMockup.tsx`

This is a landing page visual — a fake dashboard preview. It's 426 lines of client JS including:
- 5 inline SVG icon components (duplicated from `icons.tsx`)
- Hardcoded mock data arrays
- Full table rendering

**Impact:** ~15-20 KB of unnecessary client JS for a decorative component.

**Fix:** Extract icons to shared `icons.tsx` (same as was done for `LandingContent.tsx`). Consider making this a static image or server component with no interactivity (the tab switching is cosmetic).

---

### 🟡 P5 — No `select` on `listOwnedQrCodes` Query

**File:** `src/lib/qr/service.ts:79-87`

`findMany` returns all columns (`id`, `name`, `slug`, `destinationUrl`, `isActive`, `createdAt`, `updatedAt`, `userId`). The dashboard list only needs `id`, `name`, `slug`, `destinationUrl`, `isActive`, `createdAt`.

**Impact:** Minor — extra `updatedAt` and `userId` fields transferred per row. Becomes noticeable at scale.

**Fix:** Add `select` clause matching `QrCodeListItem` type.

---

### 🟡 P6 — Dashboard Fetches Both Tabs' Data on Every Load

**File:** `src/app/dashboard/page.tsx:57-80`

Every dashboard page load fetches:
- QR codes list (with count query)
- QR code options (for analytics dropdown)
- Analytics snapshot (3 SQL queries)

Even when the user is on the QR tab, all analytics queries run. And vice versa.

**Impact:** ~6 database queries per page load regardless of which tab is active.

**Fix:** Conditionally fetch based on `activeTab`:
```typescript
const [qrResult, qrCodeOptions, analytics] = await Promise.all([
  activeTab === "qr" ? listOwnedQrCodes(...) : null,
  listOwnedQrCodeOptions(...),
  activeTab === "analytics" ? getUserAnalyticsSnapshot(...) : null,
]);
```

---

### 🟢 P7 — Fonts Load Two Weights Each

**File:** `src/app/layout.tsx:5-17`

`Fira_Sans` loads 5 weights (300, 400, 500, 600, 700) and `Fira_Code` loads 4 weights (400, 500, 600, 700). Each weight is a separate font file.

**Impact:** 9 font files to download. Most pages only use 2-3 weights.

**Fix:** Reduce to only used weights. Audit which weights are actually referenced in Tailwind classes:
- `Fira_Sans`: likely only needs 400, 500, 600, 700 (drop 300)
- `Fira_Code`: likely only needs 400 (used in monospace slug display)

---

### 🟢 P8 — No Cache Headers on API Routes

**Files:** All API routes in `src/app/api/`

No `Cache-Control` headers set on any API response. The health endpoints, QR code list, and analytics could benefit from short-lived caching.

**Impact:** Every API call hits the server fresh.

**Fix:**
- `/api/health`: `Cache-Control: public, max-age=30`
- `/api/qr-codes` (GET): `Cache-Control: private, max-age=5` (stale-while-revalidate)
- Analytics: `Cache-Control: private, max-age=60`

---

### ✅ What's Already Good

| Area | Status |
|------|--------|
| **Redirect route (`/r/[slug]`)** | ✅ Excellent — `select` clause, fire-and-forget scan logging, no blocking |
| **Analytics queries** | ✅ SQL aggregations with `Promise.all` parallelism |
| **Rate limiter** | ✅ O(1) lookup, LRU eviction, bounded memory |
| **Prisma singleton** | ✅ Correct `globalThis` pattern |
| **Security headers** | ✅ HSTS, X-Frame-Options, nosniff |
| **Pagination** | ✅ QR code list paginated with offset |
| **Loading boundaries** | ✅ Skeleton UI for dashboard |
| **CSS** | ✅ Single 52KB file, Tailwind purged |
| **No `next/image` needed** | ✅ No user-uploaded images, only SVG icons |

---

## 3. Prioritized Action Plan

| # | Issue | Impact | Effort | Priority |
|---|-------|--------|--------|----------|
| P1 | Cap CSV export rows or stream | OOM prevention | 30 min | 🔴 High |
| P2 | Limit `listOwnedQrCodeOptions` | Dashboard speed | 5 min | 🔴 High |
| P6 | Conditional tab data fetching | -3 queries/load | 15 min | 🟡 Medium |
| P5 | Add `select` to QR list query | Reduced payload | 5 min | 🟡 Medium |
| P4 | Clean up `DashboardMockup.tsx` | -15KB client JS | 20 min | 🟡 Medium |
| P3 | Extract static landing sections | Better LCP/SEO | 2-3 hours | 🟡 Medium (future) |
| P7 | Reduce font weights | Faster font load | 10 min | 🟢 Low |
| P8 | Add cache headers to API routes | Reduced server load | 15 min | 🟢 Low |

**Total quick wins (P1, P2, P5, P6): ~55 min for significant improvement.**

---

> *"Users don't care about benchmarks. They care about feeling fast."*
> — This app already feels fast. These fixes prevent it from slowing down at scale.
