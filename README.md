# Dynamic QR Codes — v0.93

Web dashboard for creating and managing dynamic QR codes with real-time analytics.

## Features

- **Authentication** — Email/password + Google OAuth; each user sees only own data
- **QR code management** — Create, edit, disable, and export dynamic QR codes
- **Live QR preview** — Gradient SVG preview (green → teal) updates as you type slug or destination URL
- **Export modal** — Configurable error correction (L/M/H), size (150/200/300px), with Copy, Share, and Save actions
- **Dynamic redirect** — `/r/[slug]` endpoint with scan-event logging
- **Analytics dashboard** — KPI cards, daily scans, top QR codes, date/QR/bot filters, CSV export
- **Landing page** — Dark-themed SaaS landing with EN/PL language switcher, auth modal, pricing tiers
- **Security** — Rate limiting, structured logging, health endpoints

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + Auth) |
| ORM | Prisma |
| Styling | Tailwind CSS v4 |
| Hosting | Railway |
| Package manager | npm |

## Quick start

```bash
npm install                # 1. Install dependencies
cp .env.example .env       # 2. Copy env template and fill values
npm run prisma:generate    # 3. Generate Prisma client
npm run dev                # 4. Start local app
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run test               # 48 tests (vitest)
```

Operations checks:

```bash
npm run ops:monitoring-check
npm run ops:backup-restore-validation
```

## Environment variables (minimum)

- `APP_BASE_URL`
- `SHORT_LINK_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## Project structure

```
src/
├── app/
│   ├── api/                    # API routes (health, QR, analytics)
│   ├── components/             # Landing page components
│   ├── dashboard/
│   │   ├── components/         # AnalyticsTab, QrCodesTab, KpiCards, QrPreview
│   │   ├── actions.ts          # Server actions (create/update QR)
│   │   ├── page.tsx            # Dashboard page (~175 lines)
│   │   └── url.ts              # URL builder utility
│   ├── i18n/                   # EN/PL translations + context
│   └── r/[slug]/               # Dynamic redirect route
├── components/                 # Shared UI (qr-edit-modal, qr-share-modal, qr-list-item)
└── lib/
    ├── analytics/              # Summary, filters, CSV export
    ├── auth/                   # User authentication
    ├── env/                    # Server env validation
    ├── qr/                     # Types, validation, ownership, preview utils
    ├── redirect/               # Scan utilities
    └── security/               # Rate limiting, response helpers
```

## Production

- **URL**: https://dynamic-qr-codes-production.up.railway.app
- **Hosting**: Railway
- **Database**: Supabase PostgreSQL

## Project docs

- Sprint plan: [`docs/IMPLEMENTATION_SPRINT_PLAN.md`](docs/IMPLEMENTATION_SPRINT_PLAN.md)
- Integration prep: [`docs/EXTERNAL_INTEGRATIONS_PREP_PLAN.md`](docs/EXTERNAL_INTEGRATIONS_PREP_PLAN.md)
- Sprint test ledger: [`docs/test-result.md`](docs/test-result.md)
- Ops runbook: [`docs/OPERATIONS_RUNBOOK.md`](docs/OPERATIONS_RUNBOOK.md)

## Version history

| Version | Date | Highlights |
|---------|------|-----------|
| v0.93 | 2026-02-10 | Export modal, consistent button styling, KPI cards at top, analytics button layout |
| v0.91 | 2026-02-10 | Gradient QR preview, form rearrangement, live QR from destination URL, default QR tab |
| v0.90 | 2026-02-09 | Performance fixes, Sprint 0 refactoring, dashboard split, SQL analytics |
| v0.1 | 2026-02-06 | MVP — all 5 sprints complete |
