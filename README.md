# Dynamic QR Codes

Web dashboard for creating and managing dynamic QR codes.

## MVP scope
- User authentication (email/password + Google OAuth; each user sees only own data).
- Create, edit, disable, and download dynamic QR codes.
- Redirect endpoint for QR scans (`/r/[slug]`).
- Scan-event logging to database.
- User-scoped analytics for QR performance.

## Planned stack
- Frontend + backend: Next.js (TypeScript)
- Database + auth: Supabase (PostgreSQL + Auth)
- ORM: Prisma
- Hosting: Railway
- Package manager: npm

## Project docs
- Sprint plan: `IMPLEMENTATION_SPRINT_PLAN.md`
- Integration prep: `EXTERNAL_INTEGRATIONS_PREP_PLAN.md`
- Sprint test ledger: `test-result.md`
- Ops runbook: `OPERATIONS_RUNBOOK.md`

## Quick start
1. Install dependencies:
```bash
npm install
```
2. Copy environment template and fill values:
```bash
cp .env.example .env
```
3. Generate Prisma client:
```bash
npm run prisma:generate
```
4. Start local app:
```bash
npm run dev
```
5. Run quality checks:
```bash
npm run lint
npm run typecheck
npm run test
```

6. Run operations checks:
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

## Production
- **URL**: https://dynamic-qr-codes-production.up.railway.app
- **Hosting**: Railway
- **Database**: Supabase PostgreSQL

## Status
All sprints complete:
- Sprint 1: Foundation, auth, and schema
- Sprint 2: Dynamic redirect and scan capture
- Sprint 3: User QR management dashboard
- Sprint 4: User analytics and reporting
- Sprint 5: Hardening and production readiness

Features implemented:
- Next.js app with TypeScript
- Supabase auth flow (email/password + Google OAuth)
- Protected dashboard with user-scoped QR management
- Dynamic redirect endpoint (`/r/[slug]`) with scan logging
- Analytics dashboard with KPIs, trends, and CSV export
- Rate limiting and structured logging
- Health endpoints (`/api/health` and `/api/health/db`)
- CI workflow for lint/typecheck/test
