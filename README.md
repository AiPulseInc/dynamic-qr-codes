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

## Environment variables (minimum)
- `APP_BASE_URL`
- `SHORT_LINK_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## Status
Sprint 1 scaffold is implemented:
- Next.js app baseline
- Supabase auth flow (email/password + Google OAuth callback route)
- Protected dashboard route
- Prisma schema and initial migration files
- Health endpoints (`/api/health` and `/api/health/db`)
- CI workflow for lint/typecheck/test
