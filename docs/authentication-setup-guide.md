# Authentication Setup Guide

This guide documents the exact setup flow for authentication in this project:
- Supabase Auth (email/password + Google OAuth)
- Next.js callback handling
- Local-first configuration with later production switch

## 1) Prerequisites
- Supabase project created.
- Google Cloud project access for OAuth credentials.
- Local `.env` file present in project root.

## 2) Supabase values to collect
From Supabase dashboard:

1. `SUPABASE_URL`
- Project URL, e.g. `https://<project-ref>.supabase.co`

2. `SUPABASE_ANON_KEY`
- In `Settings -> API Keys` as **Publishable key**.

3. `SUPABASE_SERVICE_ROLE_KEY`
- In `Settings -> API Keys` as **Secret key**.
- Server-only. Never expose in frontend.

4. `SUPABASE_DB_URL`
- From "Connect to your project" -> `Connection String` -> `Type: URI`.

## 3) Configure Supabase Auth URLs (local first)
In `Authentication -> URL Configuration`:

- `Site URL`: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`

You can add production URLs later.

## 4) Enable auth providers
In `Authentication -> Sign In / Providers`:

1. Enable `Email` provider.
2. Enable `Google` provider (credentials added in next steps).

## 5) Create Google OAuth credentials
In Google Cloud:

1. Configure OAuth consent screen.
2. Create OAuth client (`Web application`).
3. Add authorized redirect URI:
- `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 6) Connect Google provider in Supabase
Back in `Authentication -> Sign In / Providers -> Google`:

- Paste `Client ID`
- Paste `Client Secret`
- Save

## 7) Local `.env` values
Set at minimum:

```env
APP_BASE_URL=http://localhost:3000
SHORT_LINK_BASE_URL=http://localhost:3000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-key>
SUPABASE_DB_URL=<postgres-uri>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

## 8) Critical DB URL rules
These are required to avoid Prisma connection errors:

1. Use a real URI (no placeholders).
- Remove `<project-ref>`, `[YOUR-PASSWORD]`, etc.

2. Do not wrap the URL in quotes.
- Good: `SUPABASE_DB_URL=postgresql://...`
- Bad: `SUPABASE_DB_URL="postgresql://..."`

3. URL-encode password special characters.
- Example: `#` must be `%23`.

4. Include SSL mode.
- Add `?sslmode=require` (or `&sslmode=require` if query already exists).

5. If direct connection is unreachable in your network, use Session Pooler URI.
- Example host pattern: `aws-...pooler.supabase.com`

## 9) Verify setup
Run:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Check:
- `http://localhost:3000/login`
- `http://localhost:3000/dashboard` (redirect to `/login` when logged out)
- `http://localhost:3000/api/health` returns 200
- `http://localhost:3000/api/health/db` returns 200

## 10) Switch to production (Railway)
Production domain: `https://dynamic-qr-codes-production.up.railway.app`

1. Set Railway env vars:
- `APP_BASE_URL=https://dynamic-qr-codes-production.up.railway.app`
- `SHORT_LINK_BASE_URL=https://dynamic-qr-codes-production.up.railway.app`

2. Update Supabase `Authentication -> URL Configuration`:
- Site URL: `https://dynamic-qr-codes-production.up.railway.app`
- Redirect URLs (add):
  - `https://dynamic-qr-codes-production.up.railway.app/auth/callback`

3. Update Google OAuth authorized redirect URIs (if using Google sign-in):
- Keep: `https://<project-ref>.supabase.co/auth/v1/callback`

4. Verify production deployment:
```bash
APP_BASE_URL=https://dynamic-qr-codes-production.up.railway.app npm run ops:monitoring-check
```

## 11) Troubleshooting quick map
- `P1013 invalid port number`: malformed DB URL (placeholders/quotes/special chars not encoded).
- `P1001 can't reach database`: network/direct-host issue; try Session Pooler URI.
- `/dashboard` returns 500 with env error: invalid/missing `APP_BASE_URL` or `SHORT_LINK_BASE_URL`.
- `/api/health/db` returns 500: DB URL or DB connectivity issue.

