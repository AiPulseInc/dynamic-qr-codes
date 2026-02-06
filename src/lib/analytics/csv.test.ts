import { describe, expect, it } from "vitest";

import { formatAnalyticsCsv } from "@/lib/analytics/csv";

describe("formatAnalyticsCsv", () => {
  it("produces header and rows", () => {
    const csv = formatAnalyticsCsv([
      {
        scannedAt: new Date("2026-02-06T12:00:00.000Z"),
        ipHash: "abc",
        isBot: false,
        country: "DE",
        city: "Berlin",
        referrer: "https://example.com",
        userAgent: "Mozilla/5.0",
        qrCode: {
          id: "q1",
          name: "Welcome",
          slug: "welcome",
          destinationUrl: "https://example.com/welcome",
        },
      },
    ]);

    const lines = csv.split("\n");
    expect(lines[0]).toContain("scanned_at,qr_code_id");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("q1,Welcome,welcome");
  });

  it("escapes quotes and commas", () => {
    const csv = formatAnalyticsCsv([
      {
        scannedAt: new Date("2026-02-06T12:00:00.000Z"),
        ipHash: null,
        isBot: false,
        country: null,
        city: null,
        referrer: null,
        userAgent: "Agent, \"quoted\"",
        qrCode: {
          id: "q1",
          name: "Name, One",
          slug: "slug",
          destinationUrl: "https://example.com",
        },
      },
    ]);

    expect(csv).toContain("\"Name, One\"");
    expect(csv).toContain("\"Agent, \"\"quoted\"\"\"");
  });
});
