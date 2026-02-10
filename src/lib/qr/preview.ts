import QRCode from "qrcode";

export function buildRedirectUrl(shortLinkBaseUrl: string, slug: string): string {
  return `${shortLinkBaseUrl.replace(/\/$/, "")}/r/${slug}`;
}

const GRADIENT_DEFS = `<defs><linearGradient id="qr-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient></defs>`;

export async function generateQrDataUrl(shortLinkBaseUrl: string, slug: string): Promise<string> {
  const redirectUrl = buildRedirectUrl(shortLinkBaseUrl, slug);

  let svg = await QRCode.toString(redirectUrl, {
    type: "svg",
    margin: 1,
    color: {
      dark: "#10B981",
      light: "#00000000",
    },
  });

  // Inject gradient defs and replace stroke color with gradient reference
  svg = svg.replace("<path", `${GRADIENT_DEFS}<path`);
  svg = svg.replace(/stroke="[^"]*"/g, 'stroke="url(#qr-grad)"');

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
