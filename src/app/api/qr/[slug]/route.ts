import QRCode from "qrcode";
import { NextResponse } from "next/server";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import { getServerEnv } from "@/lib/env/server";
import { getOwnedQrCodeBySlug, QrOwnershipError } from "@/lib/qr/service";
import { normalizeSlug } from "@/lib/redirect/scan-utils";
import { toUnauthorizedResponse } from "@/lib/security/responses";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  },
) {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  try {
    const params = await context.params;
    const normalizedSlug = normalizeSlug(params.slug);

    if (!normalizedSlug) {
      return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
    }

    const qrCode = await getOwnedQrCodeBySlug(profile.id, normalizedSlug);
    const env = getServerEnv();
    const url = new URL(request.url);
    const redirectUrl = `${env.SHORT_LINK_BASE_URL.replace(/\/$/, "")}/r/${qrCode.slug}`;

    const eclParam = url.searchParams.get("ecl");
    const ecl = (["L", "M", "H"].includes(eclParam ?? "") ? eclParam : "M") as "L" | "M" | "H";

    const widthParam = parseInt(url.searchParams.get("width") ?? "", 10);
    const width = [150, 200, 300, 768].includes(widthParam) ? widthParam : 768;

    const pngBuffer = await QRCode.toBuffer(redirectUrl, {
      type: "png",
      width,
      margin: 1,
      errorCorrectionLevel: ecl,
    });

    const shouldDownload = url.searchParams.get("download") === "1";
    const headers = new Headers({
      "content-type": "image/png",
      "cache-control": "private, max-age=0, must-revalidate",
    });

    if (shouldDownload) {
      headers.set("content-disposition", `attachment; filename="${qrCode.slug}.png"`);
    }

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof QrOwnershipError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to generate QR image." }, { status: 500 });
  }
}
