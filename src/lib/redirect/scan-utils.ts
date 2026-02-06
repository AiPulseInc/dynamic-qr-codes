import crypto from "node:crypto";

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /headless/i,
  /preview/i,
  /facebookexternalhit/i,
  /whatsapp/i,
];

function takeFirstCsvValue(rawValue: string | null): string | null {
  if (!rawValue) {
    return null;
  }

  const firstValue = rawValue.split(",")[0]?.trim();
  return firstValue || null;
}

export function normalizeSlug(rawSlug: string): string {
  const decodedSlug = decodeURIComponent(rawSlug).trim().toLowerCase();
  return decodedSlug.replace(/^\/+|\/+$/g, "");
}

export function extractClientIp(headers: Headers): string | null {
  const candidateHeaders = [
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("cf-connecting-ip"),
    headers.get("x-client-ip"),
  ];

  const firstCandidate = candidateHeaders
    .map((value) => takeFirstCsvValue(value))
    .find((value) => Boolean(value));

  if (!firstCandidate) {
    return null;
  }

  return firstCandidate.replace(/^\[(.*)\]$/, "$1");
}

export function hashIpAddress(ipAddress: string | null, secret: string): string | null {
  if (!ipAddress) {
    return null;
  }

  return crypto.createHmac("sha256", secret).update(ipAddress).digest("hex");
}

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) {
    return false;
  }

  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function extractGeo(headers: Headers): {
  country: string | null;
  city: string | null;
} {
  const country =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code");

  const city = headers.get("x-vercel-ip-city") ?? headers.get("x-city");

  return {
    country: country || null,
    city: city || null,
  };
}
