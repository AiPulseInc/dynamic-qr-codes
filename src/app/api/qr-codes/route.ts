import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import { createRequestLogContext, logError, logInfo, logWarn } from "@/lib/observability/log";
import { createOwnedQrCode, listOwnedQrCodes, QrDuplicateSlugError } from "@/lib/qr/service";
import { extractClientIp } from "@/lib/redirect/scan-utils";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { parseQrCodeJsonInput, parseQrSearchTerm, parseQrStatusFilter } from "@/lib/qr/validation";

function toUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function toRateLimitedResponse(retryAfterSeconds: number, requestId: string) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "retry-after": String(retryAfterSeconds),
        "x-request-id": requestId,
      },
    },
  );
}

function toQrJson(qrCode: {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: qrCode.id,
    name: qrCode.name,
    slug: qrCode.slug,
    destinationUrl: qrCode.destinationUrl,
    isActive: qrCode.isActive,
    createdAt: qrCode.createdAt.toISOString(),
    updatedAt: qrCode.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const logContext = createRequestLogContext({
    route: "/api/qr-codes",
    request,
  });
  const ipAddress = extractClientIp(request.headers) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `qr-codes:get:${ipAddress}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    logWarn("qr_codes.list.rate_limited", logContext, {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return toRateLimitedResponse(rateLimit.retryAfterSeconds, logContext.requestId);
  }

  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  const url = new URL(request.url);
  const search = parseQrSearchTerm(url.searchParams.get("q"));
  const status = parseQrStatusFilter(url.searchParams.get("status"));

  const qrCodes = await listOwnedQrCodes(profile.id, {
    search,
    status,
  });

  logInfo("qr_codes.list.success", { ...logContext, userId: profile.id }, { count: qrCodes.length });
  return NextResponse.json({
    items: qrCodes.map(toQrJson),
  });
}

export async function POST(request: Request) {
  const logContext = createRequestLogContext({
    route: "/api/qr-codes",
    request,
  });
  const ipAddress = extractClientIp(request.headers) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `qr-codes:post:${ipAddress}`,
    limit: 40,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    logWarn("qr_codes.create.rate_limited", logContext, {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return toRateLimitedResponse(rateLimit.retryAfterSeconds, logContext.requestId);
  }

  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const input = parseQrCodeJsonInput(payload);
    const qrCode = await createOwnedQrCode(profile.id, input);
    logInfo("qr_codes.create.success", { ...logContext, userId: profile.id }, { qrCodeId: qrCode.id });

    return NextResponse.json(
      {
        item: toQrJson(qrCode),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    if (error instanceof QrDuplicateSlugError) {
      logWarn("qr_codes.create.duplicate_slug", { ...logContext, userId: profile.id }, {
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logError("qr_codes.create.failed", { ...logContext, userId: profile.id }, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Unable to create QR code." }, { status: 500 });
  }
}
