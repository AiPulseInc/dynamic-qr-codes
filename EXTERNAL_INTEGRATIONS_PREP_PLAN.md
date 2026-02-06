# External Integrations Preparation Plan

## Goal
Prepare all external services and access so implementation can proceed without blockers for:
- Dynamic QR redirect
- Scan-event logging
- Dashboard analytics
- User authorization and data isolation
- Deployment

## Recommended Integration Strategy
- `Supabase`: primary PostgreSQL database (and optional Auth/Storage).
- `Railway`: host the web app/runtime.
- `Domain + DNS provider` (Cloudflare/Namecheap/etc.): custom short link domain for QR redirects.
- `GitHub`: source control + CI integration.

Optional but strongly recommended:
- `Sentry`: error monitoring.
- `Upstash Redis`: rate limiting store.

## Required Resources and Access

### 1) Supabase
- Account with billing enabled (if needed for limits).
- Project created in target region.
- Required values:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
  - `SUPABASE_DB_URL` (or pooled connection string)
  - `SUPABASE_AUTH_JWT_SECRET` (if server-side JWT validation is implemented)
- Access required for implementation:
  - Project Admin or Owner (schema/migration management).
  - Ability to run SQL editor/migrations.
- Configuration needed:
  - Auth provider enabled (email/password minimum for MVP).
  - Auth URL settings configured (site URL and redirect URLs for dev/staging/prod).
  - Database backups enabled.
  - Network rules understood (if IP allowlist is used).

### 2) Railway
- Railway account + project.
- Service for web app deployment.
- Required values:
  - `RAILWAY_PROJECT_ID` (optional for CLI workflows)
  - `RAILWAY_ENVIRONMENT` (dev/staging/prod naming)
  - `RAILWAY_TOKEN` (if CLI automation is needed)
- Access required:
  - Project Admin or Maintainer (deploy/env var management).
- Configuration needed:
  - Environment variables support.
  - Build/start command confirmed.
  - Health check path defined.

### 3) Custom Domain + DNS
- Owned domain/subdomain for QR short links (example: `go.yourdomain.com`).
- DNS provider access (edit A/CNAME/TXT records).
- Configuration needed:
  - TLS/HTTPS enabled.
  - Redirect domain routed to Railway app.
  - Low TTL during setup for faster propagation.

### 4) GitHub
- Repository created and connected.
- Access required:
  - Write access for CI/workflow setup.
- Configuration needed:
  - Branch protection (recommended).
  - Secrets configured for deployment and app environment.

### 5) Optional Monitoring and Rate Limiting
- Sentry project:
  - `SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN` (only if CI release automation used)
- Upstash Redis:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

## Secret Inventory (Minimum)
- `APP_BASE_URL`
- `SHORT_LINK_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `SUPABASE_AUTH_JWT_SECRET` (if used by backend auth validation)
- `RAILWAY_TOKEN` (if CLI automation used)
- `SENTRY_DSN` (optional)
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

## Preparation Phases

### Phase 1: Architecture Decisions
Tasks:
- Confirm Supabase is source of truth for DB.
- Confirm Railway hosts app runtime.
- Confirm auth approach for MVP (`Supabase Auth`, email/password first).
- Confirm domain for QR redirect links.

Success criteria:
- One-page decision record approved with no open architecture questions.

### Phase 2: Account and Project Setup
Tasks:
- Create/verify Supabase project and Railway project.
- Create/verify GitHub repo and default branch strategy.
- Reserve/configure short-link domain and DNS provider access.

Success criteria:
- All projects exist and access permissions are granted to required collaborators.

### Phase 3: Secret and Access Provisioning
Tasks:
- Collect secrets into secure password manager.
- Add secrets to Railway environment variables.
- Add CI/CD secrets to GitHub Actions.
- Enforce rule: no secrets in source files or chat logs.
- Confirm auth redirect URLs are configured for each environment.

Success criteria:
- All required env vars populated in staging environment with validation pass.

### Phase 4: Connectivity Validation
Tasks:
- Validate app can connect to Supabase DB from Railway runtime.
- Validate auth sign-up/sign-in/sign-out and protected route behavior.
- Validate health endpoint and DB check endpoint.
- Validate domain resolves to app and HTTPS certificate is active.

Success criteria:
- Smoke checks pass: app up, DB reachable, auth working, domain live, HTTPS valid.

### Phase 5: Operational Readiness
Tasks:
- Enable backups and define restore contact/process.
- Configure error monitoring and alert routing.
- Confirm logging retention and privacy policy for scan events.

Success criteria:
- Monitoring and backup checks documented and tested once.

## What I Need From You Before I Connect Services
- Confirm chosen stack:
  - Supabase for DB: `Yes/No`
  - Railway for hosting: `Yes/No`
  - Custom short-link domain: `<domain>`
- Confirm MVP auth settings:
  - Auth method: `Email/Password` (recommended for MVP)
  - Social login now: `Yes/No`
- Provide secure access (not passwords in chat):
  - Invite me/service account to Supabase and Railway with required roles.
  - Add required tokens/secrets to environment managers.
- Confirm target environments:
  - `dev`, `staging`, `prod` (or your preferred set)

## Execution Note
Once this checklist is complete, integration can be done in order:
1. DB schema/migrations on Supabase
2. App deploy wiring on Railway
3. Domain routing for redirect links
4. Monitoring and rate limiting enablement
