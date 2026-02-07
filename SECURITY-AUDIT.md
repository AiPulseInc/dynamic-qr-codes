# Security Audit Report — DynamicQR

**Date:** 2026-02-07
**Auditor:** Cascade (Security Auditor agent)
**Scope:** Full codebase review — `src/`, `prisma/`, config files, dependencies
**Framework:** OWASP Top 10:2025

---

## Executive Summary

The DynamicQR application is a Next.js 16 app with Supabase auth, Prisma/PostgreSQL, and a QR redirect service. Overall security posture is **solid for a beta product** — no critical vulnerabilities found. The codebase uses parameterized queries (Prisma), Zod input validation, ownership checks, rate limiting, and IP hashing. There are several **medium and low severity** items to address before GA.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 4 |
| Low      | 5 |

---

## Assets & Attack Surface

| Asset | Description | Exposure |
|-------|-------------|----------|
| User credentials | Supabase auth (email/password, Google OAuth) | Auth modal, server actions |
| QR codes | User-owned, contain destination URLs | Dashboard CRUD, API |
| Scan analytics | IP hashes, geo, user-agent, timestamps | Dashboard, CSV export |
| Redirect service | `/r/[slug]` — public, unauthenticated | Internet-facing |
| API keys | Supabase anon, service role, Google OAuth | Environment variables |
| Database | PostgreSQL via Prisma | Server-side only |

---

## Findings

### HIGH-1: Health endpoint exposes database error messages

**File:** `src/app/api/health/db/route.ts:13-21`
**OWASP:** A02 (Security Misconfiguration), A10 (Exceptional Conditions)
**Risk:** Database connection errors are returned verbatim to the caller, potentially leaking connection strings, hostnames, or internal infrastructure details.

```typescript
message: error instanceof Error ? error.message : "Unknown database error"
```

**Recommendation:** Return a generic error message. Log the detailed error server-side only.

```typescript
// Return generic message
{ status: "error", database: "unreachable" }
// Log details server-side
console.error("Health check DB error:", error);
```

**Additionally:** Consider restricting health endpoints behind an API key or internal network check. Currently `/api/health` and `/api/health/db` are fully public and unauthenticated.

---

### HIGH-2: No security headers configured

**File:** `next.config.ts`
**OWASP:** A02 (Security Misconfiguration)
**Risk:** The application sets no security headers. This leaves it vulnerable to clickjacking, MIME sniffing, and makes XSS exploitation easier if a vulnerability is found.

**Missing headers:**
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
- `X-XSS-Protection: 0` — disable legacy XSS filter (can cause issues)
- `Strict-Transport-Security` — enforce HTTPS
- `Content-Security-Policy` — restrict resource loading
- `Permissions-Policy` — restrict browser features

**Recommendation:** Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};
```

---

### MEDIUM-1: In-memory rate limiting does not survive restarts or scale horizontally

**File:** `src/lib/security/rate-limit.ts`
**OWASP:** A07 (Authentication Failures)
**Risk:** Rate limiting uses a `globalThis` in-memory Map. This resets on every deployment/restart and does not share state across multiple Railway replicas. An attacker can bypass rate limits by waiting for a deploy or targeting different instances.

**Recommendation:** For beta, this is acceptable. Before GA, migrate to Redis-based rate limiting (e.g., `@upstash/ratelimit`) or use Railway's built-in rate limiting if available.

---

### MEDIUM-2: Open redirect potential in QR destination URLs

**File:** `src/app/r/[slug]/route.ts:89-93`
**OWASP:** A01 (Broken Access Control)
**Risk:** The redirect service sends users to any URL stored in `destinationUrl`. While only authenticated users can set this value, a compromised account could create QR codes pointing to phishing sites. The `destinationUrl` validation only checks for `http://` or `https://` prefix.

**Recommendation:** Consider:
- Adding a blocklist for known phishing domains
- Displaying an interstitial warning page before redirecting ("You are leaving DynamicQR...")
- Logging and monitoring unusual destination URL patterns

---

### MEDIUM-3: CSV export has no pagination or size limit

**File:** `src/lib/analytics/service.ts:92-118`
**OWASP:** A02 (Security Misconfiguration)
**Risk:** `getUserAnalyticsCsvRows` fetches ALL scan events matching the filter with no `LIMIT`. A user with millions of scans could trigger an OOM or very slow query, effectively causing a self-DoS.

**Recommendation:** Add a hard limit (e.g., 50,000 rows) and inform the user if truncated:

```typescript
return prisma.scanEvent.findMany({
  where: whereClause,
  orderBy: { scannedAt: "desc" },
  take: 50_000, // hard cap
  select: { ... },
});
```

---

### MEDIUM-4: Analytics snapshot fetches unbounded events

**File:** `src/lib/analytics/service.ts:53-74`
**OWASP:** A02 (Security Misconfiguration)
**Risk:** Same issue as MEDIUM-3. `getUserAnalyticsSnapshot` loads all scan events into memory for the selected date range. A 1-year range with heavy traffic could be very large.

**Recommendation:** Add a `take` limit or implement server-side aggregation with SQL `GROUP BY` instead of loading raw events.

---

### LOW-1: `qrCodeId` filter in analytics not validated as UUID

**File:** `src/lib/analytics/filters.ts:58-59`
**Risk:** The `qr` query parameter is trimmed but not validated as a UUID before being passed to Prisma. Prisma will reject invalid UUIDs, but validation should happen at the input layer.

**Recommendation:** Add UUID validation:

```typescript
const qrCodeId = trimmedQrId.length > 0 && z.string().uuid().safeParse(trimmedQrId).success
  ? trimmedQrId
  : null;
```

---

### LOW-2: Middleware file named `proxy.ts` instead of `middleware.ts`

**File:** `proxy.ts` (project root)
**Risk:** Next.js expects `middleware.ts` at the project root. The file is named `proxy.ts` — verify this is actually being loaded by Next.js. If not, the auth guard middleware is not running, which would be a **critical** issue.

**Recommendation:** Verify middleware is active. If Next.js is not picking up `proxy.ts`, rename to `middleware.ts`.

---

### LOW-3: No CSRF protection on server actions

**File:** `src/app/dashboard/actions.ts`, `src/app/login/actions.ts`
**OWASP:** A01 (Broken Access Control)
**Risk:** Next.js server actions have built-in CSRF protection via the `x-action` header since Next.js 14. However, the form-based actions (createQrCode, updateQrCode, signOut) rely on this. Verify that the Next.js version in use (16.1.6) maintains this protection.

**Recommendation:** No immediate action needed — Next.js 16 includes CSRF protection for server actions. Document this assumption.

---

### LOW-4: No `.env.example` file

**OWASP:** A02 (Security Misconfiguration)
**Risk:** New developers may misconfigure environment variables. The `.gitignore` excludes `.env*` (good), but there's no `.env.example` documenting required variables.

**Recommendation:** Create `.env.example` with placeholder values:

```
APP_BASE_URL=http://localhost:3000
SHORT_LINK_BASE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
```

---

### LOW-5: `content-disposition` filename in CSV export not sanitized

**File:** `src/app/api/analytics/export/route.ts:62`
**Risk:** The filename includes `filters.fromInput` and `filters.toInput` which are date strings. These are already validated as dates by `parseAnalyticsFilters`, so injection risk is minimal. However, as a defense-in-depth measure, sanitize the filename.

**Recommendation:** Already safe due to date parsing, but consider explicit sanitization for future-proofing.

---

## What's Done Well

| Area | Assessment |
|------|------------|
| **SQL Injection** | Prisma ORM with parameterized queries throughout. Seed file uses `$executeRaw` with tagged template literals (safe). No string concatenation in queries. |
| **XSS** | No `dangerouslySetInnerHTML`, no `eval()`, no `new Function()`. React's default escaping handles output. |
| **Input Validation** | Comprehensive Zod schemas for all user input (slugs, URLs, names, form data, JSON payloads). |
| **Authorization** | Ownership checks (`assertOwnership`) on all QR code operations. Users can only access their own data. |
| **Secrets Management** | All secrets in environment variables, validated with Zod on startup. `.env*` gitignored. No hardcoded secrets. |
| **IP Privacy** | IP addresses are HMAC-SHA256 hashed before storage — good privacy practice. |
| **Rate Limiting** | Applied to redirect route, analytics export, and QR code API endpoints. |
| **Error Handling** | Errors fail secure — unauthorized returns 401, ownership errors return 404 (no information leakage about existence). |
| **Logging** | Structured JSON logging with request IDs, no PII in logs. |
| **Supply Chain** | Lock file present (`package-lock.json`). Minimal dependencies. No known vulnerable patterns. |

---

## Priority Remediation Roadmap

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| 1 | HIGH-2: Add security headers | 15 min | High |
| 2 | HIGH-1: Sanitize health endpoint errors | 5 min | Medium |
| 3 | LOW-2: Verify middleware file is loaded | 5 min | Critical if broken |
| 4 | MEDIUM-3/4: Add query limits | 15 min | Medium |
| 5 | MEDIUM-1: Redis rate limiting | 1-2 hrs | Medium (pre-GA) |
| 6 | MEDIUM-2: Open redirect mitigation | 1 hr | Low-Medium |
| 7 | LOW-4: Create .env.example | 5 min | Low |

---

*Report generated by Security Auditor agent. Review findings with your team before implementing changes.*
