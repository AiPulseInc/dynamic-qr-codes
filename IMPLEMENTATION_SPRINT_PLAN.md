# Dynamic QR Dashboard Implementation Plan

## Project assumptions
- Project goal: web dashboard to create and manage dynamic QR codes that redirect to editable links.
- Every QR scan must be logged to a database for analytics.
- MVP must include authorization so each user can manage only their own QR codes and view only their own logs.
- Team size: 1-2 developers.
- Delivery style: incremental sprints where each sprint leaves a working, deployable state.
- Baseline stack: Next.js (frontend + API routes), PostgreSQL via Supabase, Prisma ORM, Railway deploy.
- Package manager: `npm` (default, easiest onboarding, broad docs/ecosystem support).
- Billing and advanced organization/team plans are out of MVP scope.

## Sprint roadmap summary
- Sprint 1: Foundation, authentication, and ownership-aware data model.
- Sprint 2: Dynamic redirect and scan logging with ownership linkage.
- Sprint 3: User dashboard for QR CRUD and scoped access control.
- Sprint 4: User-scoped analytics and reporting.
- Sprint 5: Hardening, observability, and production launch readiness.

## Sprint breakdowns (detailed)

### Sprint 1: Foundation, auth, and schema
Goal:
Establish project baseline with working authentication and user-owned data model.

Scope:
- Next.js project setup and quality gates.
- Supabase Auth integration (email/password + Google OAuth via Supabase provider template).
- Initial schema with user ownership relations.

Tasks:
- [ ] Initialize Next.js app with TypeScript, ESLint, Prettier, and strict TS config.
- [ ] Configure Supabase project and connect auth client/server flows.
- [ ] Implement sign-up, sign-in, sign-out, and session persistence.
- [ ] Configure Google OAuth provider in Supabase and connect provider sign-in flow.
- [ ] Protect dashboard routes and redirect unauthenticated users.
- [ ] Create Prisma schema/migration for `profiles`, `qr_codes`, and `scan_events` with `user_id` ownership.
- [ ] Add `.env.example` and runtime env validation.
- [ ] Add CI for lint, type-check, and tests.

Success definition:
- Auth flows (email/password + Google sign-in/sign-out) work in local and staging.
- Unauthenticated users cannot access dashboard routes.
- Schema migration applies cleanly with ownership constraints.
- `npm run lint`, `npm run typecheck`, and `npm test` pass.

Test batch:
- Unit: Validate auth session helpers and env parsing behavior.
- Integration: Validate migration constraints for `user_id` ownership and profile linkage.
- E2E: User can login via email/password and Google provider, reach protected dashboard, and logout revokes access.
- Regression: Re-run migrations from empty DB and verify deterministic schema state.
- Non-functional: No high-severity dependency vulnerabilities and acceptable cold-start time.

Deliverables:
- Running app shell with auth.
- Database schema v1 with ownership relations.
- CI quality pipeline.

### Sprint 2: Dynamic redirect and scan capture
Goal:
Implement dynamic redirect endpoint and scan logging linked to QR owner.

Scope:
- Public redirect endpoint `/r/[slug]`.
- Slug resolution with active/inactive handling.
- Scan logging with privacy-safe event payload and owner linkage.

Tasks:
- [ ] Implement `GET /r/[slug]` resolver for active QR records.
- [ ] Return controlled 404 for missing/inactive slugs.
- [ ] Log scan event with timestamp, qr_code_id, owner `user_id`, hashed IP, user-agent, referrer, and coarse geo.
- [ ] Redirect using HTTP 302 to destination URL.
- [ ] Flag likely bot scans for analytics filtering.
- [ ] Ensure redirect is not blocked by transient logging failures.

Success definition:
- Valid slug returns HTTP 302 to configured destination URL.
- Invalid/inactive slug returns HTTP 404 with controlled response.
- Every valid scan writes a complete DB event linked to QR owner.
- Raw IP is not persisted.

Test batch:
- Unit: Validate slug parsing, IP hash helper, and bot flag classifier.
- Integration: Hit redirect route and verify event row completeness including owner linkage.
- E2E: Scan QR with device/emulator and verify redirect + event write.
- Regression: Toggle QR active state and destination URL; route behavior remains correct.
- Non-functional: Redirect p95 latency stays below target under concurrent load.

Deliverables:
- Production-ready redirect endpoint.
- Scan-event logging pipeline with privacy-safe fields.
- Backend tests for redirect and logging.

### Sprint 3: User QR management dashboard
Goal:
Enable authenticated users to create, edit, disable, and download their own dynamic QR codes.

Scope:
- User-scoped QR CRUD UI and APIs.
- QR image generation/download.
- Authorization checks for every QR mutation/read endpoint.

Tasks:
- [ ] Build user QR list page with search and status filter.
- [ ] Build create form with name, slug, destination URL, active toggle.
- [ ] Build edit/disable flows with confirmation UX.
- [ ] Generate QR image from short URL and support PNG download.
- [ ] Enforce unique slug and URL validation at API + DB layer.
- [ ] Enforce ownership checks so users cannot access or mutate other users' QR records.

Success definition:
- Authenticated user can create and manage their QR codes.
- User cannot read or mutate another user's QR records.
- QR updates change redirect destination without reprinting code.
- Duplicate slug attempts are rejected.

Test batch:
- Unit: Validate form schema, slug rules, and ownership guard helpers.
- Integration: Validate CRUD APIs enforce auth and ownership constraints.
- E2E: User A creates/updates QR; User B cannot access User A QR endpoints.
- Regression: Existing user QR records stay functional after CRUD operations on other rows.
- Non-functional: Dashboard p95 page/API latency remains within target for representative data size.

Deliverables:
- User-scoped QR management UI.
- Secured CRUD API with ownership checks.
- QR download capability.

### Sprint 4: User analytics and reporting
Goal:
Provide user-scoped scan analytics so each account sees only its own QR metrics.

Scope:
- KPI cards and trends filtered by authenticated user.
- Bot-exclusion toggle and date filters.
- CSV export for user-owned analytics data.

Tasks:
- [ ] Build KPI cards (total scans, unique scans, active QRs, last-24h scans) scoped to current user.
- [ ] Build time-series and top QR/destination views scoped to current user.
- [ ] Add date-range and QR filters.
- [ ] Add aggregation queries/indexes for analytics performance.
- [ ] Add CSV export endpoint with ownership guard.
- [ ] Add tests to ensure cross-user data isolation in analytics endpoints.

Success definition:
- User sees correct analytics for own QR data only.
- User cannot retrieve another user's analytics via UI or API.
- Filtered CSV exports match on-screen scoped totals.

Test batch:
- Unit: Validate aggregation logic for edge cases and empty datasets.
- Integration: Validate analytics queries enforce user scope and return expected fixture counts.
- E2E: User applies filters and exports CSV; results match visible metrics.
- Regression: Verify totals remain stable before/after index/migration changes.
- Non-functional: Analytics endpoints meet p95 response target on representative dataset.

Deliverables:
- User-scoped analytics dashboard.
- CSV reporting with authorization checks.
- Indexed query layer for analytics performance.

### Sprint 5: Hardening and launch readiness
Goal:
Secure and operationalize the platform for production traffic.

Scope:
- Abuse protection, auditability, and reliability controls.
- Monitoring, alerting, and incident readiness.
- Deployment, rollback, and operational runbooks.

Tasks:
- [ ] Add rate limiting for redirect and dashboard API routes.
- [ ] Add structured logs with request IDs and user IDs for audit tracing.
- [ ] Add monitoring and alerting for app health, DB health, and error spikes.
- [ ] Add backup and restore validation for database.
- [ ] Add release checklist, staged rollout steps, and rollback procedure.
- [ ] Execute pre-release security and load checks.

Success definition:
- Rate limits trigger correctly without breaking normal traffic.
- Alerting detects injected failure scenarios within target time.
- Backup restore test succeeds.
- Release checklist is complete and approved.

Test batch:
- Unit: Validate rate-limit and audit log utility behavior.
- Integration: Validate alert hooks and failure-path logging behavior.
- E2E: Run staging smoke tests for auth, QR CRUD, redirect, and analytics flows.
- Regression: Full test suite passes in production-like environment before release.
- Non-functional: No critical security findings and SLO targets are met.

Deliverables:
- Hardened, monitored production-ready system.
- Operations and rollback runbook.
- Final release readiness report.

## test-result.md update plan
- Use `test-result.md` as the single sprint verification ledger.
- After each sprint, append date, executed tests, expected vs actual, pass/fail, and reviewer sign-off.
- Track each defect with severity, fix plan, retest result, and closure state.
- Carry unresolved issues to the next sprint backlog.

## Risks and mitigation
- Risk: Cross-user data leakage in APIs or analytics queries.
- Mitigation: Enforce ownership checks in every query path and add explicit isolation tests.

- Risk: Auth/session misconfiguration causing dashboard lockout.
- Mitigation: Keep auth flow in Sprint 1 and validate with end-to-end session tests early.

- Risk: Redirect outages impact all printed QR codes.
- Mitigation: Add uptime monitoring, alerting, and rollback procedures before launch.

- Risk: Analytics performance degradation at scale.
- Mitigation: Add indexes in Sprint 4 and validate p95 performance targets with load tests.
