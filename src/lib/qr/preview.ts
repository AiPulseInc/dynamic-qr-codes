import QRCode from "qrcode";

export const QR_PREVIEW_OPTIONS = {
  width: 256,
  margin: 1,
  color: {
    dark: "#10B981",
    light: "#00000000",
  },
} as const;

export function buildRedirectUrl(shortLinkBaseUrl: string, slug: string): string {
  return `${shortLinkBaseUrl.replace(/\/$/, "")}/r/${slug}`;
}

export async function generateQrDataUrl(shortLinkBaseUrl: string, slug: string): Promise<string> {
  const redirectUrl = buildRedirectUrl(shortLinkBaseUrl, slug);
  return QRCode.toDataURL(redirectUrl, QR_PREVIEW_OPTIONS);
}
