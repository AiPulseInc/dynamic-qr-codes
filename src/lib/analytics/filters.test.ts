import { describe, expect, it } from "vitest";

import { parseAnalyticsFilters } from "@/lib/analytics/filters";

describe("parseAnalyticsFilters", () => {
  it("parses explicit filter values", () => {
    const parsed = parseAnalyticsFilters({
      from: "2026-02-01",
      to: "2026-02-06",
      qr: "1234",
      bots: "0",
    });

    expect(parsed.fromInput).toBe("2026-02-01");
    expect(parsed.toInput).toBe("2026-02-06");
    expect(parsed.qrCodeId).toBe("1234");
    expect(parsed.excludeBots).toBe(false);
  });

  it("falls back to defaults for invalid values", () => {
    const parsed = parseAnalyticsFilters({
      from: "not-a-date",
      to: "nope",
      qr: "   ",
      bots: "1",
    });

    expect(parsed.qrCodeId).toBeNull();
    expect(parsed.excludeBots).toBe(true);
    expect(parsed.from <= parsed.to).toBe(true);
  });
});
