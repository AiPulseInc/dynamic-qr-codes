import { NextResponse } from "next/server";

import { createRequestLogContext, logError, logInfo, logWarn } from "@/lib/observability/log";
import { getServerEnv } from "@/lib/env/server";
import { prisma } from "@/lib/prisma";
import {
  extractClientIp,
  extractGeo,
  hashIpAddress,
  isLikelyBot,
  normalizeSlug,
} from "@/lib/redirect/scan-utils";
import { consumeRateLimit } from "@/lib/security/rate-limit";

function notFoundResponse(requestId?: string) {
  return NextResponse.json(
    { error: "QR code not found or inactive." },
    {
      status: 404,
      headers: requestId
        ? {
            "x-request-id": requestId,
          }
        : undefined,
    },
  );
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  },
) {
  const params = await context.params;
  const normalizedSlug = normalizeSlug(params.slug);
  const ipAddress = extractClientIp(request.headers) ?? "unknown";
  const logContext = createRequestLogContext({
    route: "/r/[slug]",
    request,
  });
  const rateLimit = consumeRateLimit({
    key: `redirect:${ipAddress}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    logWarn("redirect.rate_limited", logContext, {
      slug: normalizedSlug || null,
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

  if (!normalizedSlug) {
    logWarn("redirect.invalid_slug", logContext);
    return notFoundResponse(logContext.requestId);
  }

  const qrCode = await prisma.qrCode.findUnique({
    where: {
      slug: normalizedSlug,
    },
    select: {
      id: true,
      userId: true,
      destinationUrl: true,
      isActive: true,
    },
  });

  if (!qrCode || !qrCode.isActive) {
    logWarn("redirect.slug_not_found", logContext, {
      slug: normalizedSlug,
    });
    return notFoundResponse(logContext.requestId);
  }

  const destinationUrl = qrCode.destinationUrl;
  let redirectTarget: URL;

  try {
    redirectTarget = new URL(destinationUrl);
  } catch {
    logError("redirect.invalid_destination", logContext, {
      slug: normalizedSlug,
    });
    return NextResponse.json(
      { error: "Invalid destination URL configuration." },
      {
        status: 500,
        headers: {
          "x-request-id": logContext.requestId,
        },
      },
    );
  }

  const headers = request.headers;
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  const ipHash = hashIpAddress(ipAddress, SUPABASE_SERVICE_ROLE_KEY);
  const userAgent = headers.get("user-agent");
  const referrer = headers.get("referer");
  const { country, city } = extractGeo(headers);
  const isBot = isLikelyBot(userAgent);

  // Do not block redirect path on logging failures.
  void prisma.scanEvent
    .create({
      data: {
        qrCodeId: qrCode.id,
        userId: qrCode.userId,
        ipHash,
        userAgent,
        referrer,
        country,
        city,
        isBot,
      },
    })
    .catch((error) => {
      logError("redirect.scan_log_failed", logContext, {
        error: error instanceof Error ? error.message : String(error),
        slug: normalizedSlug,
      });
    });

  logInfo("redirect.success", logContext, {
    slug: normalizedSlug,
    qrCodeId: qrCode.id,
  });
  return NextResponse.redirect(redirectTarget, {
    status: 302,
    headers: {
      "x-request-id": logContext.requestId,
      "x-rate-limit-remaining": String(rateLimit.remaining),
    },
  });
}
