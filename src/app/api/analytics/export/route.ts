import { NextResponse } from "next/server";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import { formatAnalyticsCsv } from "@/lib/analytics/csv";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { getUserAnalyticsCsvRows } from "@/lib/analytics/service";
import { createRequestLogContext, logError, logInfo, logWarn } from "@/lib/observability/log";
import { extractClientIp } from "@/lib/redirect/scan-utils";
import { QrOwnershipError } from "@/lib/qr/service";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { toUnauthorizedResponse } from "@/lib/security/responses";

export async function GET(request: Request) {
  const logContext = createRequestLogContext({
    route: "/api/analytics/export",
    request,
  });
  const ipAddress = extractClientIp(request.headers) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `analytics-export:${ipAddress}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    logWarn("analytics.export.rate_limited", logContext, {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "retry-after": String(rateLimit.retryAfterSeconds),
          "x-request-id": logContext.requestId,
        },
      },
    );
  }

  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const filters = parseAnalyticsFilters({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      qr: url.searchParams.get("qr") ?? undefined,
      bots: url.searchParams.get("bots") ?? undefined,
    });
    const rows = await getUserAnalyticsCsvRows(profile.id, filters);
    const csv = formatAnalyticsCsv(rows);
    logInfo("analytics.export.success", { ...logContext, userId: profile.id }, { rows: rows.length });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="analytics-${filters.fromInput}-to-${filters.toInput}.csv"`,
        "cache-control": "private, max-age=0, must-revalidate",
        "x-request-id": logContext.requestId,
      },
    });
  } catch (error) {
    if (error instanceof QrOwnershipError) {
      logWarn("analytics.export.ownership_denied", { ...logContext, userId: profile.id }, {
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logError("analytics.export.failed", { ...logContext, userId: profile.id }, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Unable to export analytics." }, { status: 500 });
  }
}
