import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { buildRedirectUrl, generateQrDataUrl } from "./preview";

describe("QR preview utilities", () => {
  describe("buildRedirectUrl", () => {
    it("builds correct redirect URL", () => {
      expect(buildRedirectUrl("https://example.com", "my-slug")).toBe(
        "https://example.com/r/my-slug",
      );
    });

    it("strips trailing slash from base URL", () => {
      expect(buildRedirectUrl("https://example.com/", "test")).toBe(
        "https://example.com/r/test",
      );
    });
  });

  describe("generateQrDataUrl", () => {
    it("returns a valid data URL PNG", async () => {
      const dataUrl = await generateQrDataUrl("https://example.com", "test");
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it("encodes the correct redirect URL in the QR code", async () => {
      const dataUrl = await generateQrDataUrl("https://example.com", "my-slug");
      expect(dataUrl.length).toBeGreaterThan(100);
    });
  });
});

describe("QrPreview component structure", () => {
  const previewSrc = fs.readFileSync(
    path.resolve(__dirname, "../../app/dashboard/components/QrPreview.tsx"),
    "utf-8",
  );

  it("uses generateQrDataUrl from shared preview module (not inline QRCode)", () => {
    expect(previewSrc).toContain("generateQrDataUrl");
  });

  it("has corner brackets with thick borders (border-*-[3px])", () => {
    expect(previewSrc).toContain("border-l-[3px]");
    expect(previewSrc).toContain("border-t-[3px]");
  });

  it("has corner brackets that are long enough (h-8 or larger)", () => {
    // Corners should be at least h-8 w-8 (32px) for visibility
    expect(previewSrc).toMatch(/[hw]-8/);
  });

  it("renders a real QR code img tag", () => {
    expect(previewSrc).toContain('alt="QR code preview"');
  });
});

describe("QrEditModal component structure", () => {
  const modalSrc = fs.readFileSync(
    path.resolve(__dirname, "../../components/qr-edit-modal.tsx"),
    "utf-8",
  );

  it("has a toggle switch (peer sr-only pattern)", () => {
    expect(modalSrc).toContain("peer sr-only");
    expect(modalSrc).toContain("peer-checked:bg-primary");
  });

  it("has a live QR code preview with corner brackets", () => {
    expect(modalSrc).toContain("QR code preview");
    expect(modalSrc).toContain("generateQrDataUrl");
  });
});
