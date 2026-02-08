# Pro Billing, Feature Gating & Admin Dashboard — Implementation Plan

**Date:** 2026-02-08
**Project Type:** WEB (Next.js 16 + Supabase + Prisma + Stripe)
**Version:** v1.0 (post-MVP)
**Status:** PLANNING

---

## Overview

Extend the existing DynamicQR MVP with a monetization layer:

1. **Free/Pro feature gating** — enforce plan limits across the app
2. **Stripe billing** — $9/mo (or €8/EUR, 36 PLN) subscription with 7-day free trial (no card required)
3. **Annual billing** — ~$90/year ($7.50/mo effective, ~17% discount)
4. **Promo codes** — admin-created, time-based Pro access grants
5. **Admin dashboard** — user management, promo codes, revenue overview
6. **Link expiration** — auto-disable QR codes after a configurable date
7. **Teaser analytics for Free users** — total scan count + upgrade CTA

### What This Plan Does NOT Cover (v2.0)

- Teams/organizations
- Custom QR styling (colors, logos)
- Custom domains
- API access
- Bulk QR creation
- Folders/tags
- Scan notifications
- Password-protected links
- A/B testing
- Branded scan pages
- Webhook integrations (Zapier, Slack)
- Usage-based billing

---

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | Free user cannot create >10 QR codes | Attempt #11 → error message + upgrade CTA |
| SC-2 | Free user sees teaser analytics (total scans) + upgrade CTA | Analytics tab shows limited view |
| SC-3 | Pro user has full access to all features | No restrictions on QR count, analytics, CSV, geo, bot filter |
| SC-4 | User can subscribe via Stripe Checkout | Redirect → pay → webhook → profile updated to Pro |
| SC-5 | User can cancel via Stripe Customer Portal | Cancel → webhook → downgrade at period end |
| SC-6 | Trial: 7 days Pro, no card required | Sign up → auto-trial → expires → downgrade to Free |
| SC-7 | Downgrade deactivates QR codes beyond limit of 10 | Codes 11+ set `isActive=false`, user notified |
| SC-8 | Promo code grants X days of Pro access | Redeem → `proExpiresAt` extended |
| SC-9 | Admin can manage users, promo codes, view revenue | `/admin` dashboard with role guard |
| SC-10 | QR codes with expiration date auto-disable | Redirect route checks `expiresAt` |
| SC-11 | 3 currencies supported (USD/EUR/PLN) | Auto-detected by geo or user choice |
| SC-12 | Billing history visible to users | `/dashboard/billing` page |

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Payments | **Stripe Checkout + Customer Portal** | Fastest to implement, PCI compliant, handles multi-currency, invoices, trials |
| Webhooks | **Next.js API route** (`/api/webhooks/stripe`) | Same codebase, Stripe retries for 3 days on failure |
| Subscription state | **Prisma `Profile` model** (extended) | Single source of truth, checked on every gated action |
| Admin UI | **Next.js pages** (`/admin/*`) | Same app, role-guarded, no extra infra |
| Cron/expiration | **Prisma query on redirect** + optional cron | Check `expiresAt` at redirect time; optional daily cleanup |
| Currency detection | **Geo header** (`x-vercel-ip-country` / `cf-ipcountry`) | Already extracted in `scan-utils.ts` |

### Stripe Integration Architecture

```
User clicks "Upgrade"
  → POST /api/billing/checkout
  → Creates Stripe Checkout Session (mode: subscription)
  → Redirect to Stripe
  → User pays
  → Stripe sends webhook to /api/webhooks/stripe
  → App updates Profile.plan = "pro", Profile.stripeSubscriptionId, etc.
  → User redirected back to /dashboard

User clicks "Manage Subscription"
  → POST /api/billing/portal
  → Creates Stripe Customer Portal session
  → Redirect to Stripe Portal
  → User cancels/changes plan
  → Stripe sends webhook
  → App updates Profile accordingly
```

---

## Database Schema Changes

### Extended `Profile` model

```prisma
model Profile {
  id                    String    @id @db.Uuid
  email                 String    @unique
  role                  Role      @default(FREE)
  stripeCustomerId      String?   @unique @map("stripe_customer_id")
  stripeSubscriptionId  String?   @unique @map("stripe_subscription_id")
  stripePriceId         String?   @map("stripe_price_id")
  subscriptionStatus    SubStatus @default(NONE) @map("subscription_status")
  trialEndsAt           DateTime? @map("trial_ends_at")
  proExpiresAt          DateTime? @map("pro_expires_at")
  currentPeriodEnd      DateTime? @map("current_period_end")
  currency              String?   @default("usd")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  qrCodes               QrCode[]
  scanEvents            ScanEvent[]
  promoRedemptions      PromoRedemption[]

  @@map("profiles")
}

enum Role {
  FREE
  PRO
  ADMIN
}

enum SubStatus {
  NONE
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}
```

### Extended `QrCode` model

```prisma
model QrCode {
  // ... existing fields ...
  expiresAt   DateTime? @map("expires_at")  // NEW: link expiration
  // ... existing relations ...
}
```

### New `PromoCode` model

```prisma
model PromoCode {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code          String    @unique
  description   String?
  grantDays     Int       @map("grant_days")          // days of Pro access
  maxUses       Int?      @map("max_uses")             // null = unlimited
  currentUses   Int       @default(0) @map("current_uses")
  expiresAt     DateTime? @map("expires_at")           // promo expiration
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  createdBy     String    @map("created_by") @db.Uuid  // admin user ID
  redemptions   PromoRedemption[]

  @@map("promo_codes")
}

model PromoRedemption {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  promoCodeId String   @map("promo_code_id") @db.Uuid
  redeemedAt  DateTime @default(now()) @map("redeemed_at")
  grantedDays Int      @map("granted_days")
  user        Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  promoCode   PromoCode @relation(fields: [promoCodeId], references: [id], onDelete: Cascade)

  @@unique([userId, promoCodeId])  // one redemption per user per code
  @@map("promo_redemptions")
}
```

---

## File Structure (New & Modified)

```
src/
├── lib/
│   ├── billing/
│   │   ├── stripe.ts              # Stripe client singleton
│   │   ├── checkout.ts            # Create checkout session
│   │   ├── portal.ts              # Create customer portal session
│   │   ├── webhook-handlers.ts    # Handle Stripe webhook events
│   │   ├── plans.ts               # Plan definitions, pricing, feature flags
│   │   └── subscription.ts        # Helper: isPro(), canCreateQr(), etc.
│   ├── promo/
│   │   ├── service.ts             # CRUD for promo codes
│   │   ├── redemption.ts          # Redeem promo code logic
│   │   └── validation.ts          # Zod schemas for promo input
│   ├── admin/
│   │   └── guard.ts               # Admin role check helper
│   └── env/
│       └── server.ts              # MODIFIED: add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
│
├── app/
│   ├── api/
│   │   ├── billing/
│   │   │   ├── checkout/route.ts  # POST: create Stripe Checkout session
│   │   │   └── portal/route.ts    # POST: create Stripe Customer Portal session
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts    # POST: Stripe webhook handler
│   │   └── promo/
│   │       └── redeem/route.ts    # POST: redeem promo code
│   │
│   ├── dashboard/
│   │   ├── page.tsx               # MODIFIED: feature gating, teaser analytics
│   │   ├── billing/
│   │   │   └── page.tsx           # Billing history, plan management
│   │   └── actions.ts             # MODIFIED: enforce QR code limits
│   │
│   ├── admin/
│   │   ├── page.tsx               # Admin dashboard overview
│   │   ├── users/
│   │   │   └── page.tsx           # User management
│   │   ├── promo/
│   │   │   └── page.tsx           # Promo code management
│   │   └── layout.tsx             # Admin layout with role guard
│   │
│   └── components/
│       ├── UpgradeCTA.tsx         # Reusable upgrade prompt
│       ├── PlanBadge.tsx          # Shows Free/Pro/Trial badge
│       └── PromoRedeemModal.tsx   # Promo code input modal
│
├── prisma/
│   ├── schema.prisma              # MODIFIED: new models + enums
│   └── migrations/                # New migration
│
└── package.json                   # MODIFIED: add stripe dependency
```

---

## Task Breakdown

### Phase 1: Database & Core Infrastructure (Foundation)

> **Milestone:** Schema deployed, Stripe configured, plan helpers available.

#### Task 1.1: Extend Prisma schema
- **task_id:** `P1-01`
- **agent:** `database-architect`
- **skills:** Prisma, PostgreSQL
- **priority:** P0 (blocker for everything)
- **dependencies:** none
- **INPUT:** Current `schema.prisma`
- **OUTPUT:** Updated schema with `Role`, `SubStatus` enums, extended `Profile`, `PromoCode`, `PromoRedemption` models, `expiresAt` on `QrCode`
- **VERIFY:** `npx prisma migrate dev` succeeds, `npx prisma generate` succeeds, existing data preserved

#### Task 1.2: Add Stripe dependency & env vars
- **task_id:** `P1-02`
- **agent:** `backend-specialist`
- **skills:** Node.js, environment config
- **priority:** P0
- **dependencies:** none
- **INPUT:** `package.json`, `src/lib/env/server.ts`
- **OUTPUT:** `stripe` package installed, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY_USD`, `STRIPE_PRICE_ID_MONTHLY_EUR`, `STRIPE_PRICE_ID_MONTHLY_PLN`, `STRIPE_PRICE_ID_ANNUAL_USD`, `STRIPE_PRICE_ID_ANNUAL_EUR`, `STRIPE_PRICE_ID_ANNUAL_PLN` added to Zod env schema (optional for dev, required for prod)
- **VERIFY:** App starts without Stripe keys in dev (graceful skip), validates in prod

#### Task 1.3: Create Stripe client singleton
- **task_id:** `P1-03`
- **agent:** `backend-specialist`
- **skills:** Stripe SDK
- **priority:** P0
- **dependencies:** `P1-02`
- **INPUT:** Stripe secret key from env
- **OUTPUT:** `src/lib/billing/stripe.ts` — exports configured Stripe instance
- **VERIFY:** Import works, TypeScript compiles

#### Task 1.4: Create plan definitions & subscription helpers
- **task_id:** `P1-04`
- **agent:** `backend-specialist`
- **skills:** TypeScript, business logic
- **priority:** P0
- **dependencies:** `P1-01`
- **INPUT:** Business rules (Free: 10 QR, no analytics; Pro: unlimited)
- **OUTPUT:** `src/lib/billing/plans.ts` (plan config), `src/lib/billing/subscription.ts` (helpers: `isPro(profile)`, `isTrialing(profile)`, `canCreateQrCode(profile, currentCount)`, `canAccessAnalytics(profile)`, `canExportCsv(profile)`, `getEffectivePlan(profile)`)
- **VERIFY:** Unit tests for all helpers with edge cases (trial expired, promo active, subscription canceled)

---

### Phase 2: Stripe Billing Integration

> **Milestone:** Users can subscribe, cancel, and manage billing.

#### Task 2.1: Stripe Checkout session endpoint
- **task_id:** `P2-01`
- **agent:** `backend-specialist`
- **skills:** Stripe Checkout API
- **priority:** P0
- **dependencies:** `P1-03`, `P1-04`
- **INPUT:** Authenticated user, selected plan (monthly/annual), currency
- **OUTPUT:** `POST /api/billing/checkout` → returns Stripe Checkout URL
- **VERIFY:** Stripe test mode checkout completes, redirects back to app

#### Task 2.2: Stripe Customer Portal endpoint
- **task_id:** `P2-02`
- **agent:** `backend-specialist`
- **skills:** Stripe Customer Portal API
- **priority:** P1
- **dependencies:** `P1-03`
- **INPUT:** Authenticated user with `stripeCustomerId`
- **OUTPUT:** `POST /api/billing/portal` → returns Stripe Portal URL
- **VERIFY:** Portal opens, shows subscription details

#### Task 2.3: Stripe webhook handler
- **task_id:** `P2-03`
- **agent:** `backend-specialist`
- **skills:** Stripe Webhooks, signature verification
- **priority:** P0
- **dependencies:** `P1-03`, `P1-01`
- **INPUT:** Stripe webhook events
- **OUTPUT:** `POST /api/webhooks/stripe` handling:
  - `checkout.session.completed` → set Pro + stripeCustomerId + stripeSubscriptionId
  - `customer.subscription.updated` → update status, period end
  - `customer.subscription.deleted` → downgrade to Free
  - `invoice.payment_failed` → set PAST_DUE
  - `invoice.paid` → confirm ACTIVE
- **VERIFY:** Stripe CLI `stripe listen --forward-to` test with all event types

#### Task 2.4: 7-day trial auto-activation on sign-up
- **task_id:** `P2-04`
- **agent:** `backend-specialist`
- **skills:** Prisma, auth hooks
- **priority:** P1
- **dependencies:** `P1-01`, `P1-04`
- **INPUT:** User sign-up flow (`src/lib/auth/user.ts` → `getAuthenticatedProfile`)
- **OUTPUT:** On first profile creation, set `subscriptionStatus=TRIALING`, `trialEndsAt=now+7days`
- **VERIFY:** New user gets trial, `isPro()` returns true during trial, false after expiry

#### Task 2.5: Downgrade logic — deactivate excess QR codes
- **task_id:** `P2-05`
- **agent:** `backend-specialist`
- **skills:** Prisma, business logic
- **priority:** P1
- **dependencies:** `P1-04`, `P2-03`
- **INPUT:** Webhook triggers downgrade
- **OUTPUT:** Function `handleDowngrade(userId)` — counts QR codes, deactivates newest beyond limit of 10, sets `role=FREE`
- **VERIFY:** User with 15 QR codes → downgrade → 5 newest deactivated, 10 oldest remain active

---

### Phase 3: Feature Gating in UI

> **Milestone:** Free and Pro experiences are visually distinct.

#### Task 3.1: Gate QR code creation
- **task_id:** `P3-01`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, server actions
- **priority:** P0
- **dependencies:** `P1-04`
- **INPUT:** `src/app/dashboard/page.tsx`, `src/app/dashboard/actions.ts`
- **OUTPUT:**
  - Server action `createQrCode` checks `canCreateQrCode()` before insert
  - UI shows count "3/10 QR codes" for Free, "15 QR codes" for Pro
  - When at limit, form replaced with `<UpgradeCTA />`
- **VERIFY:** Free user at 10 codes → cannot create 11th, sees upgrade prompt

#### Task 3.2: Teaser analytics for Free users
- **task_id:** `P3-02`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind
- **priority:** P1
- **dependencies:** `P1-04`
- **INPUT:** `src/app/dashboard/page.tsx` (analytics tab)
- **OUTPUT:**
  - Free users see: total scan count (number), "Upgrade to Pro for detailed analytics" CTA
  - Charts/filters/geo/device sections blurred or hidden with overlay
  - Pro users see full analytics (no change)
- **VERIFY:** Free user sees teaser, Pro user sees full dashboard

#### Task 3.3: Gate CSV export
- **task_id:** `P3-03`
- **agent:** `backend-specialist`
- **skills:** API routes
- **priority:** P1
- **dependencies:** `P1-04`
- **INPUT:** `src/app/api/analytics/export/route.ts`
- **OUTPUT:** Check `canExportCsv(profile)` → return 403 with upgrade message for Free users
- **VERIFY:** Free user gets 403, Pro user gets CSV

#### Task 3.4: Gate bot filtering
- **task_id:** `P3-04`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, API
- **priority:** P2
- **dependencies:** `P1-04`
- **INPUT:** Analytics filter UI
- **OUTPUT:** Bot filter toggle disabled for Free users with "Pro" badge
- **VERIFY:** Free user cannot toggle bot filter

#### Task 3.5: Plan badge & upgrade CTA components
- **task_id:** `P3-05`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind
- **priority:** P1
- **dependencies:** `P1-04`
- **INPUT:** Design system tokens
- **OUTPUT:** `<PlanBadge />` (shows Free/Pro/Trial in navbar), `<UpgradeCTA />` (reusable upgrade prompt with pricing)
- **VERIFY:** Badge renders correctly for all plan states

#### Task 3.6: Billing page in dashboard
- **task_id:** `P3-06`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, Stripe API
- **priority:** P1
- **dependencies:** `P2-01`, `P2-02`
- **INPUT:** User profile with Stripe data
- **OUTPUT:** `/dashboard/billing` page showing:
  - Current plan + status
  - Trial countdown (if trialing)
  - "Upgrade to Pro" button (→ Stripe Checkout)
  - "Manage Subscription" button (→ Stripe Portal)
  - Billing history (fetched from Stripe API)
  - Promo code redemption input
- **VERIFY:** All states render correctly (Free, Trial, Pro, Canceled, Past Due)

---

### Phase 4: Promo Codes

> **Milestone:** Admin can create promo codes, users can redeem them.

#### Task 4.1: Promo code service & validation
- **task_id:** `P4-01`
- **agent:** `backend-specialist`
- **skills:** Prisma, Zod
- **priority:** P1
- **dependencies:** `P1-01`
- **INPUT:** `PromoCode` schema
- **OUTPUT:** `src/lib/promo/service.ts` (CRUD), `src/lib/promo/validation.ts` (Zod schemas), `src/lib/promo/redemption.ts` (redeem logic)
- **VERIFY:** Create, list, deactivate promo codes; redeem with all edge cases (expired, max uses, already redeemed)

#### Task 4.2: Promo redemption API endpoint
- **task_id:** `P4-02`
- **agent:** `backend-specialist`
- **skills:** API routes, auth
- **priority:** P1
- **dependencies:** `P4-01`, `P1-04`
- **INPUT:** Authenticated user + promo code string
- **OUTPUT:** `POST /api/promo/redeem` → validates code, extends `proExpiresAt` by `grantDays`, records redemption
- **VERIFY:** Valid code → Pro access extended; invalid/expired/used → appropriate error

#### Task 4.3: Promo redemption UI
- **task_id:** `P4-03`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind
- **priority:** P2
- **dependencies:** `P4-02`
- **INPUT:** Design system
- **OUTPUT:** `<PromoRedeemModal />` accessible from billing page and upgrade CTA; shows success/error feedback
- **VERIFY:** Redeem flow works end-to-end

---

### Phase 5: Admin Dashboard

> **Milestone:** Admin can manage users, promo codes, and view revenue.

#### Task 5.1: Admin role guard
- **task_id:** `P5-01`
- **agent:** `security-auditor`
- **skills:** Auth, middleware
- **priority:** P0
- **dependencies:** `P1-01`
- **INPUT:** `Role` enum on Profile
- **OUTPUT:** `src/lib/admin/guard.ts` — `requireAdmin()` helper; `/admin/layout.tsx` with server-side role check → redirect non-admins
- **VERIFY:** Non-admin accessing `/admin` → redirected; admin → sees dashboard

#### Task 5.2: Admin overview page
- **task_id:** `P5-02`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind, Prisma
- **priority:** P1
- **dependencies:** `P5-01`
- **INPUT:** Prisma queries
- **OUTPUT:** `/admin/page.tsx` showing:
  - Total users (Free/Pro/Trial breakdown)
  - Active subscriptions count
  - Revenue this month (from Stripe or local tracking)
  - Recent sign-ups
- **VERIFY:** Numbers match database state

#### Task 5.3: Admin user management
- **task_id:** `P5-03`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, Prisma, server actions
- **priority:** P1
- **dependencies:** `P5-01`
- **INPUT:** Profile model
- **OUTPUT:** `/admin/users/page.tsx` — searchable user list with:
  - Email, plan, status, sign-up date, QR count
  - Actions: change role, grant Pro access, view details
- **VERIFY:** Admin can search users, change roles

#### Task 5.4: Admin promo code management
- **task_id:** `P5-04`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, Prisma, server actions
- **priority:** P1
- **dependencies:** `P5-01`, `P4-01`
- **INPUT:** PromoCode model
- **OUTPUT:** `/admin/promo/page.tsx` — CRUD interface:
  - Create: code, description, grant days, max uses, expiration
  - List: all codes with usage stats
  - Actions: activate/deactivate, view redemptions
- **VERIFY:** Full CRUD works, usage counts update on redemption

---

### Phase 6: Link Expiration

> **Milestone:** QR codes can auto-expire.

#### Task 6.1: Add expiration to QR code form
- **task_id:** `P6-01`
- **agent:** `frontend-specialist` + `backend-specialist`
- **skills:** React, Zod, Prisma
- **priority:** P2
- **dependencies:** `P1-01`
- **INPUT:** QR code create/edit forms, validation schemas
- **OUTPUT:**
  - Optional `expiresAt` date picker in create/edit form
  - Zod validation for expiration date (must be in future)
  - Prisma stores `expiresAt`
- **VERIFY:** Create QR with expiration, edit expiration, clear expiration

#### Task 6.2: Enforce expiration on redirect
- **task_id:** `P6-02`
- **agent:** `backend-specialist`
- **skills:** Next.js routes
- **priority:** P2
- **dependencies:** `P6-01`
- **INPUT:** `src/app/r/[slug]/route.ts`
- **OUTPUT:** Check `expiresAt` before redirect; if expired, show "This link has expired" page instead of redirecting
- **VERIFY:** Expired QR code → error page; active QR code → normal redirect

#### Task 6.3: Show expiration status in dashboard
- **task_id:** `P6-03`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind
- **priority:** P2
- **dependencies:** `P6-01`
- **INPUT:** QR list item component
- **OUTPUT:** Show expiration badge ("Expires in 3 days", "Expired") in QR list
- **VERIFY:** Visual indicators match actual expiration state

---

### Phase 7: Landing Page & Translations Update

> **Milestone:** Pricing section reflects real plans, all new strings translated.

#### Task 7.1: Update pricing section
- **task_id:** `P7-01`
- **agent:** `frontend-specialist`
- **skills:** React, Tailwind
- **priority:** P1
- **dependencies:** `P2-01`
- **INPUT:** `LandingContent.tsx` pricing section
- **OUTPUT:** Update pricing cards to reflect:
  - Starter: Free ($0) with correct feature list
  - Pro: $9/mo with correct feature list
  - Annual toggle: $90/year
  - "Start free trial" button → triggers trial activation
  - "Upgrade" button → Stripe Checkout
- **VERIFY:** Pricing matches business rules, buttons work

#### Task 7.2: Add all new translation keys
- **task_id:** `P7-02`
- **agent:** `frontend-specialist`
- **skills:** i18n
- **priority:** P1
- **dependencies:** all UI tasks
- **INPUT:** All new UI strings
- **OUTPUT:** EN + PL translations for: plan names, upgrade CTAs, billing page, admin pages, promo code UI, expiration labels, error messages
- **VERIFY:** Switch between EN/PL, no missing keys

---

### Phase X: Verification

> **Milestone:** Everything works, is secure, and is tested.

#### Task X.1: Security review of billing endpoints
- **task_id:** `PX-01`
- **agent:** `security-auditor`
- **skills:** OWASP, Stripe security
- **priority:** P0
- **dependencies:** Phase 2, Phase 4, Phase 5
- **INPUT:** All new API routes
- **OUTPUT:** Security review covering:
  - Stripe webhook signature verification
  - Admin route protection
  - No price/plan manipulation client-side
  - Promo code brute-force protection (rate limiting)
  - No sensitive data in client bundles
- **VERIFY:** No critical or high findings

#### Task X.2: End-to-end billing flow test
- **task_id:** `PX-02`
- **agent:** `test-engineer`
- **skills:** Playwright, Stripe test mode
- **priority:** P0
- **dependencies:** all phases
- **INPUT:** Full app running with Stripe test keys
- **OUTPUT:** Test scenarios:
  1. Sign up → trial active → 7 days pass → downgrade
  2. Free user → upgrade → Pro active → cancel → downgrade
  3. Free user → redeem promo → Pro for X days → expires → downgrade
  4. Pro user with 15 QR codes → cancel → 5 deactivated
  5. Admin creates promo → user redeems → admin sees usage
- **VERIFY:** All scenarios pass

#### Task X.3: Build & lint verification
- **task_id:** `PX-03`
- **agent:** `devops-engineer`
- **skills:** CI/CD
- **priority:** P0
- **dependencies:** all phases
- **INPUT:** Full codebase
- **OUTPUT:** `npm run build` passes, `npm run lint` passes, `npm run typecheck` passes
- **VERIFY:** Zero errors

---

## Dependency Graph

```
P1-01 (schema) ──┬── P1-04 (plan helpers) ──┬── P3-01 (gate QR create)
                 │                           ├── P3-02 (teaser analytics)
                 │                           ├── P3-03 (gate CSV)
                 │                           ├── P3-04 (gate bot filter)
                 │                           └── P2-04 (trial activation)
                 │
                 ├── P4-01 (promo service) ── P4-02 (promo API) ── P4-03 (promo UI)
                 ├── P5-01 (admin guard) ──┬── P5-02 (admin overview)
                 │                         ├── P5-03 (admin users)
                 │                         └── P5-04 (admin promo)
                 ├── P6-01 (expiration form) ── P6-02 (enforce redirect) ── P6-03 (expiration UI)
                 └── P2-05 (downgrade logic)

P1-02 (stripe env) ── P1-03 (stripe client) ──┬── P2-01 (checkout)
                                               ├── P2-02 (portal)
                                               └── P2-03 (webhooks) ── P2-05 (downgrade)

P3-05 (badge/CTA) ── used by P3-01, P3-02, P3-06
P3-06 (billing page) ── depends on P2-01, P2-02, P4-02
P7-01 (pricing update) ── depends on P2-01
P7-02 (translations) ── depends on all UI tasks
```

---

## Recommended Implementation Order

| Sprint | Tasks | Duration | Deliverable |
|--------|-------|----------|-------------|
| **Sprint 1** | P1-01, P1-02, P1-03, P1-04 | 3-4 days | Schema + infra ready |
| **Sprint 2** | P2-01, P2-02, P2-03, P2-04, P2-05 | 4-5 days | Stripe billing works end-to-end |
| **Sprint 3** | P3-01, P3-02, P3-03, P3-04, P3-05, P3-06 | 3-4 days | Feature gating visible in UI |
| **Sprint 4** | P4-01, P4-02, P4-03 | 2-3 days | Promo codes work |
| **Sprint 5** | P5-01, P5-02, P5-03, P5-04 | 3-4 days | Admin dashboard |
| **Sprint 6** | P6-01, P6-02, P6-03 | 1-2 days | Link expiration |
| **Sprint 7** | P7-01, P7-02, PX-01, PX-02, PX-03 | 2-3 days | Polish + verify |

**Total estimated: ~4-5 weeks**

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stripe webhook delivery failure | Users pay but don't get Pro | Stripe retries 3 days; add manual "Restore Purchase" button; admin can grant Pro |
| Trial abuse (multiple accounts) | Revenue loss | Track by email domain; rate limit sign-ups per IP |
| Promo code brute force | Free Pro access | Rate limit redemption endpoint; use long random codes |
| Currency mismatch | User charged wrong amount | Auto-detect from geo header, allow manual override |
| Downgrade data loss perception | User complaints | Clear messaging before cancel; deactivate (not delete) QR codes |
| Admin account compromise | Full system access | Require 2FA for admin (Supabase supports this); audit log |

---

## Environment Variables (New)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY_USD=price_...
STRIPE_PRICE_ID_MONTHLY_EUR=price_...
STRIPE_PRICE_ID_MONTHLY_PLN=price_...
STRIPE_PRICE_ID_ANNUAL_USD=price_...
STRIPE_PRICE_ID_ANNUAL_EUR=price_...
STRIPE_PRICE_ID_ANNUAL_PLN=price_...
```

---

*Plan created by Project Planner agent. Review with team before implementation.*
