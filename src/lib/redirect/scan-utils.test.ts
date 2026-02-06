import { describe, expect, it } from "vitest";

import {
  extractClientIp,
  extractGeo,
  hashIpAddress,
  isLikelyBot,
  normalizeSlug,
} from "@/lib/redirect/scan-utils";

describe("normalizeSlug", () => {
  it("trims, decodes, and lowercases slug values", () => {
    expect(normalizeSlug("  Welcome-QR%20Code ")).toBe("welcome-qr code");
  });

  it("removes leading and trailing slashes", () => {
    expect(normalizeSlug("/promo-qr/")).toBe("promo-qr");
  });
});

describe("extractClientIp", () => {
  it("uses the first x-forwarded-for value", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });

    expect(extractClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({
      "x-real-ip": "9.9.9.9",
    });

    expect(extractClientIp(headers)).toBe("9.9.9.9");
  });
});

describe("hashIpAddress", () => {
  it("creates deterministic hashes for the same input", () => {
    const firstHash = hashIpAddress("1.2.3.4", "secret");
    const secondHash = hashIpAddress("1.2.3.4", "secret");

    expect(firstHash).toBe(secondHash);
    expect(firstHash).toHaveLength(64);
  });

  it("returns null for missing IP", () => {
    expect(hashIpAddress(null, "secret")).toBeNull();
  });
});

describe("isLikelyBot", () => {
  it("flags common bot user agents", () => {
    expect(isLikelyBot("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
  });

  it("flags desktop browsers as bots (QR codes should be scanned by mobile)", () => {
    expect(isLikelyBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/605.1.15")).toBe(true);
    expect(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0")).toBe(true);
  });

  it("returns false for mobile browser user agents", () => {
    expect(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")).toBe(false);
    expect(isLikelyBot("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile")).toBe(false);
  });
});

describe("extractGeo", () => {
  it("extracts vercel geo headers when present", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "DE",
      "x-vercel-ip-city": "Berlin",
    });

    expect(extractGeo(headers)).toEqual({
      country: "DE",
      city: "Berlin",
    });
  });
});
