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
  /curl/i,
  /wget/i,
  /python/i,
  /go-http/i,
  /java\//i,
  /libwww/i,
  /httpunit/i,
  /nutch/i,
  /phpcrawl/i,
  /msnbot/i,
  /adidxbot/i,
  /blekkobot/i,
  /teoma/i,
  /gigabot/i,
  /dotbot/i,
  /yandex/i,
  /baiduspider/i,
];

// Desktop OS patterns - QR codes should be scanned by mobile devices
const DESKTOP_OS_PATTERNS = [
  /Windows NT/i,
  /Macintosh.*Mac OS X/i,
  /Linux(?!.*Android)/i,  // Linux but not Android
  /X11/i,
  /CrOS/i,  // ChromeOS
];

// Mobile device patterns - legitimate QR scanners
const MOBILE_PATTERNS = [
  /iPhone/i,
  /iPad/i,
  /Android/i,
  /Mobile/i,
  /webOS/i,
  /BlackBerry/i,
  /Opera Mini/i,
  /IEMobile/i,
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

  // Check for known bot patterns
  if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return true;
  }

  // Check if it's a mobile device (legitimate QR scan)
  const isMobile = MOBILE_PATTERNS.some((pattern) => pattern.test(userAgent));
  if (isMobile) {
    return false;
  }

  // Desktop browsers are suspicious for QR scans
  const isDesktop = DESKTOP_OS_PATTERNS.some((pattern) => pattern.test(userAgent));
  if (isDesktop) {
    return true;
  }

  return false;
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
