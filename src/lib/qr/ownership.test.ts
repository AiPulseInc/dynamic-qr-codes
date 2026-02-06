import { describe, expect, it } from "vitest";

import { assertOwnership, isOwner, QrOwnershipError } from "@/lib/qr/ownership";

describe("isOwner", () => {
  it("returns true when IDs match", () => {
    expect(isOwner("user-a", "user-a")).toBe(true);
  });

  it("returns false when IDs differ", () => {
    expect(isOwner("user-a", "user-b")).toBe(false);
  });
});

describe("assertOwnership", () => {
  it("does not throw for owner matches", () => {
    expect(() => assertOwnership("user-a", "user-a")).not.toThrow();
  });

  it("throws QrOwnershipError for mismatched owner", () => {
    expect(() => assertOwnership("user-a", "user-b")).toThrow(QrOwnershipError);
  });
});
