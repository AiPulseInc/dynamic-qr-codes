import { describe, expect, it } from "vitest";

import {
  parseQrCodeFormInput,
  parseQrCodeJsonInput,
  parseQrSearchTerm,
  parseQrStatusFilter,
} from "@/lib/qr/validation";

describe("parseQrCodeFormInput", () => {
  it("normalizes valid form values", () => {
    const input = parseQrCodeFormInput({
      name: " Launch QR ",
      slug: " Launch-Page ",
      destinationUrl: "https://example.com/start",
      isActive: "true",
    });

    expect(input).toEqual({
      name: "Launch QR",
      slug: "launch-page",
      destinationUrl: "https://example.com/start",
      isActive: true,
    });
  });

  it("rejects invalid slugs", () => {
    expect(() =>
      parseQrCodeFormInput({
        name: "Promo",
        slug: "promo qr",
        destinationUrl: "https://example.com",
        isActive: "true",
      }),
    ).toThrow(/Slug may contain lowercase letters, numbers, and hyphens/);
  });
});

describe("parseQrCodeJsonInput", () => {
  it("accepts valid payloads", () => {
    const input = parseQrCodeJsonInput({
      name: "Promo",
      slug: "promo-2026",
      destinationUrl: "https://example.com/promo",
      isActive: true,
    });

    expect(input.slug).toBe("promo-2026");
    expect(input.isActive).toBe(true);
  });

  it("rejects unsupported URL schemes", () => {
    expect(() =>
      parseQrCodeJsonInput({
        name: "Promo",
        slug: "promo-2026",
        destinationUrl: "ftp://example.com/promo",
        isActive: true,
      }),
    ).toThrow(/Destination URL must start with http:\/\/ or https:\/\//);
  });
});

describe("filter helpers", () => {
  it("parses status and trims search", () => {
    expect(parseQrStatusFilter("active")).toBe("active");
    expect(parseQrStatusFilter("bad-value")).toBe("all");
    expect(parseQrSearchTerm("  launch  ")).toBe("launch");
  });
});
