# Operations Runbook

## Scope
- App: Dynamic QR Codes (Next.js + Prisma + Supabase + Railway)
- Environment targets: local, staging, production
- Primary objectives:
  - Keep redirect endpoint and dashboard available.
  - Detect auth/DB failures quickly.
  - Validate recoverability with periodic backup/restore checks.

## Monitoring Checks

### Automated health probes
- Command: `npm run ops:monitoring-check`
- Endpoints checked:
  - `GET /api/health` (expects `200`)
  - `GET /api/health/db` (expects `200`)
- Default base URL: `APP_BASE_URL` (fallback `http://localhost:3000`)
- Production URL: `https://dynamic-qr-codes-production.up.railway.app`

### Production health check
```bash
APP_BASE_URL=https://dynamic-qr-codes-production.up.railway.app npm run ops:monitoring-check
```

### Recommended schedule
- Production: every 5 minutes.
- Staging: every 15 minutes.
- Trigger check before deployments and right after deployments.

## Alert Thresholds
- `P1` (immediate action):
  - `ops:monitoring-check` fails for 2 consecutive runs.
  - Redirect route `/r/[slug]` returns non-`302` for active known slug.
  - Database health endpoint non-`200`.
- `P2` (same-day action):
  - Rate-limit responses (`429`) above normal baseline for sustained 15 minutes.
  - p95 analytics query latency above 250ms for 3 consecutive runs.
- `P3` (next business day):
  - Isolated transient probe failures that self-recover.

## Incident Response

### 1) Detect and classify
- Capture timestamp, failing route, and `x-request-id`.
- Classify severity (`P1`, `P2`, `P3`) based on thresholds above.

### 2) Contain
- If deployment-related, stop rollout and hold further releases.
- If route-specific, confirm scope with direct checks:
  - `curl -i "$APP_BASE_URL/api/health"`
  - `curl -i "$APP_BASE_URL/api/health/db"`
  - `curl -i "$APP_BASE_URL/r/<known-active-slug>"`

### 3) Recover
- Roll back to last known good Railway deploy if needed.
- Verify Supabase connectivity and credentials.
- Re-run smoke checks after changes.

### 4) Verify
- Confirm:
  - `/api/health` = `200`
  - `/api/health/db` = `200`
  - Active redirect slug = `302`
  - Auth-protected endpoints still return `401/307` when unauthenticated.

### 5) Close
- Record root cause, fix, validation evidence, and follow-ups in `test-result.md`.

## Backup and Restore Validation

### Validation command
- `npm run ops:backup-restore-validation`

### What it verifies
- Creates dedicated validation records (`profiles`, `qr_codes`, `scan_events`).
- Takes in-memory backup snapshot.
- Deletes created records.
- Restores from snapshot.
- Confirms restored values match expected fields.
- Cleans up validation records.

### Frequency
- Production: at least weekly.
- Staging: after schema changes.

## Release Readiness Checklist
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run ops:monitoring-check`
- `npm run ops:backup-restore-validation`
- Verify one known active redirect returns `302`.
- Verify dashboard unauthenticated protection still enforced.

## Rollback Procedure
- Use Railway deploy history.
- Roll back to previous successful deploy.
- Re-run:
  - `ops:monitoring-check`
  - redirect smoke check
  - auth guard smoke checks

## Ownership
- Primary owner: project maintainer.
- Backup owner: designated collaborator.
