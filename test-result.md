# Test Results

Use this file as the running validation ledger for all sprints.
Append new sprint blocks in chronological order.

## Project
- Name: Dynamic QR Dashboard
- Repo/Path: /Users/mk/code-sandbox/qr-app/qr-code-dynamic-links
- Owner: mk
- MVP requirement: Authorization enabled; each user can access only own QR codes and own scan logs.

## Sprint 1: Foundation, auth, and schema
- Date:
- Status: `PARTIAL`
- Summary: Planned. Awaiting sprint execution and test run.

### Executed Tests
| ID | Category | Test description | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| T1 | Unit | Session/auth helper and env validation tests | Invalid states handled and valid sessions resolved | Not executed yet | PENDING |
| T2 | Integration | Schema migration with `user_id` ownership constraints | Migration succeeds and FK constraints enforce ownership model | Not executed yet | PENDING |
| T3 | E2E | Sign-up, sign-in, protected route access, sign-out | Auth flow works and protected routes blocked after logout | Not executed yet | PENDING |
| T4 | Regression | Re-run migration after DB reset | Deterministic schema and auth-related tables intact | Not executed yet | PENDING |
| T5 | Non-functional | CI quality checks | Lint/type-check/tests pass with no critical dependency issues | Not executed yet | PENDING |

### Issues and Fixes
| Issue ID | Description | Severity | Fix plan | Retest result | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | No execution data yet | Low | Run sprint tests at completion and update this table | PENDING | Open |

### Sign-off
- Reviewer:
- Decision: `Needs rework`
- Notes: Update after sprint completion.

## Sprint 2: Dynamic redirect and scan capture
- Date:
- Status: `PARTIAL`
- Summary: Planned. Awaiting sprint execution and test run.

### Executed Tests
| ID | Category | Test description | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| T1 | Unit | Slug resolver, IP hash, and bot-flag utility tests | Stable behavior across valid/invalid inputs | Not executed yet | PENDING |
| T2 | Integration | Redirect endpoint writes owner-linked scan event rows | Valid scans persist complete events with owner linkage | Not executed yet | PENDING |
| T3 | E2E | Scan QR and verify redirect and event creation | Destination opens and event stored with expected fields | Not executed yet | PENDING |
| T4 | Regression | Inactive QR and destination updates | Route behavior follows latest active status and target URL | Not executed yet | PENDING |
| T5 | Non-functional | Redirect latency/load test | p95 latency meets defined threshold | Not executed yet | PENDING |

### Issues and Fixes
| Issue ID | Description | Severity | Fix plan | Retest result | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | No execution data yet | Low | Run sprint tests at completion and update this table | PENDING | Open |

### Sign-off
- Reviewer:
- Decision: `Needs rework`
- Notes: Update after sprint completion.

## Sprint 3: User QR management dashboard
- Date:
- Status: `PARTIAL`
- Summary: Planned. Awaiting sprint execution and test run.

### Executed Tests
| ID | Category | Test description | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| T1 | Unit | Form validation, slug rules, and ownership guard helper tests | Invalid payloads rejected and authorization checks enforced | Not executed yet | PENDING |
| T2 | Integration | Authenticated CRUD API tests with cross-user access attempts | Users can manage own QRs; cross-user access denied | Not executed yet | PENDING |
| T3 | E2E | User A create/edit QR and User B isolation check | User B cannot read or modify User A QR data | Not executed yet | PENDING |
| T4 | Regression | CRUD changes on one user should not affect another user data | No cross-user side effects | Not executed yet | PENDING |
| T5 | Non-functional | Dashboard performance at expected dataset size | Page/API latency within target | Not executed yet | PENDING |

### Issues and Fixes
| Issue ID | Description | Severity | Fix plan | Retest result | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | No execution data yet | Low | Run sprint tests at completion and update this table | PENDING | Open |

### Sign-off
- Reviewer:
- Decision: `Needs rework`
- Notes: Update after sprint completion.

## Sprint 4: User analytics and reporting
- Date:
- Status: `PARTIAL`
- Summary: Planned. Awaiting sprint execution and test run.

### Executed Tests
| ID | Category | Test description | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| T1 | Unit | Aggregate calculator edge-case tests | Accurate totals for empty/boundary datasets | Not executed yet | PENDING |
| T2 | Integration | User-scoped analytics query tests | Returned metrics include only authenticated user data | Not executed yet | PENDING |
| T3 | E2E | Apply filters and export CSV for authenticated user | UI and CSV counts match scoped results | Not executed yet | PENDING |
| T4 | Regression | Index/migration updates with fixed fixture dataset | No data drift in metric calculations | Not executed yet | PENDING |
| T5 | Non-functional | Analytics query performance test | p95 response within target | Not executed yet | PENDING |

### Issues and Fixes
| Issue ID | Description | Severity | Fix plan | Retest result | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | No execution data yet | Low | Run sprint tests at completion and update this table | PENDING | Open |

### Sign-off
- Reviewer:
- Decision: `Needs rework`
- Notes: Update after sprint completion.

## Sprint 5: Hardening and production readiness
- Date:
- Status: `PARTIAL`
- Summary: Planned. Awaiting sprint execution and test run.

### Executed Tests
| ID | Category | Test description | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| T1 | Unit | Rate-limit and audit logging utility tests | Correct thresholding and log structure | Not executed yet | PENDING |
| T2 | Integration | Alerting and failure-path handling tests | Expected alerts/logs triggered on injected failures | Not executed yet | PENDING |
| T3 | E2E | Staging smoke test across auth/QR/redirect/analytics | Critical user journeys pass | Not executed yet | PENDING |
| T4 | Regression | Full pre-release regression suite | No release-blocking defects | Not executed yet | PENDING |
| T5 | Non-functional | Security and reliability validation | No critical findings and SLO goals met | Not executed yet | PENDING |

### Issues and Fixes
| Issue ID | Description | Severity | Fix plan | Retest result | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | No execution data yet | Low | Run sprint tests at completion and update this table | PENDING | Open |

### Sign-off
- Reviewer:
- Decision: `Needs rework`
- Notes: Update after sprint completion.
