import { beforeEach, describe, expect, it } from "vitest";

import { consumeRateLimit, resetRateLimitState } from "@/lib/security/rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("allows requests until limit and blocks afterward", () => {
    expect(
      consumeRateLimit({
        key: "k1",
        limit: 2,
        windowMs: 10_000,
        nowMs: 1_000,
      }).allowed,
    ).toBe(true);

    expect(
      consumeRateLimit({
        key: "k1",
        limit: 2,
        windowMs: 10_000,
        nowMs: 2_000,
      }).allowed,
    ).toBe(true);

    const blocked = consumeRateLimit({
      key: "k1",
      limit: 2,
      windowMs: 10_000,
      nowMs: 3_000,
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets quota after window passes", () => {
    consumeRateLimit({
      key: "k2",
      limit: 1,
      windowMs: 1_000,
      nowMs: 1_000,
    });

    expect(
      consumeRateLimit({
        key: "k2",
        limit: 1,
        windowMs: 1_000,
        nowMs: 1_500,
      }).allowed,
    ).toBe(false);

    expect(
      consumeRateLimit({
        key: "k2",
        limit: 1,
        windowMs: 1_000,
        nowMs: 2_100,
      }).allowed,
    ).toBe(true);
  });
});
