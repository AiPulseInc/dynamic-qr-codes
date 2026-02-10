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
    it("returns a valid SVG data URL", async () => {
      const dataUrl = await generateQrDataUrl("https://example.com", "test");
      expect(dataUrl).toMatch(/^data:image\/svg\+xml/);
    });

    it("contains gradient definition for green-to-teal", async () => {
      const dataUrl = await generateQrDataUrl("https://example.com", "my-slug");
      const svg = decodeURIComponent(dataUrl.split(",")[1]);
      expect(svg).toContain("linearGradient");
      expect(svg).toContain("#10B981");
      expect(svg).toContain("#06B6D4");
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

  it("listens to both slug and destinationUrl inputs", () => {
    expect(previewSrc).toContain('input[name="slug"]');
    expect(previewSrc).toContain('input[name="destinationUrl"]');
  });

  it("has corner brackets with thick borders (border-*-[4px])", () => {
    expect(previewSrc).toContain("border-l-[4px]");
    expect(previewSrc).toContain("border-t-[4px]");
  });

  it("has corner brackets that are long enough (h-10 w-10)", () => {
    expect(previewSrc).toContain("h-10 w-10");
  });

  it("renders a real QR code img tag", () => {
    expect(previewSrc).toContain('alt="QR code preview"');
  });
});

describe("QrShareModal component structure", () => {
  const shareSrc = fs.readFileSync(
    path.resolve(__dirname, "../../components/qr-share-modal.tsx"),
    "utf-8",
  );

  it("has error correction options (L, M, H)", () => {
    expect(shareSrc).toContain("Low 7%");
    expect(shareSrc).toContain("Medium 15%");
    expect(shareSrc).toContain("High 30%");
  });

  it("has QR size options (150, 200, 300)", () => {
    expect(shareSrc).toContain("Small 150px");
    expect(shareSrc).toContain("Medium 200px");
    expect(shareSrc).toContain("Large 300px");
  });

  it("has copy, share, and save action buttons", () => {
    expect(shareSrc).toContain("Copy to clipboard");
    expect(shareSrc).toContain("handleShare");
    expect(shareSrc).toContain("handleSave");
  });

  it("uses shared CornerBrackets and generateQrDataUrl", () => {
    expect(shareSrc).toContain("CornerBrackets");
    expect(shareSrc).toContain("generateQrDataUrl");
  });

  it("renders a Share button trigger with gradient styling", () => {
    expect(shareSrc).toContain("from-primary to-accent-teal");
    expect(shareSrc).toContain("Share QR Code");
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

  it("has a live QR code preview with shared CornerBrackets", () => {
    expect(modalSrc).toContain("QR code preview");
    expect(modalSrc).toContain("generateQrDataUrl");
    expect(modalSrc).toContain("CornerBrackets");
  });
});
