import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import {
  getOwnedQrCodeById,
  QrDuplicateSlugError,
  QrOwnershipError,
  updateOwnedQrCode,
} from "@/lib/qr/service";
import { toQrJson } from "@/lib/qr/types";
import { toUnauthorizedResponse } from "@/lib/security/responses";
import { parseQrCodeJsonInput } from "@/lib/qr/validation";

const routeParamsSchema = z.object({
  id: z.string().uuid("Invalid QR code id."),
});

export async function GET(
  _: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  try {
    const params = routeParamsSchema.parse(await context.params);
    const qrCode = await getOwnedQrCodeById(profile.id, params.id);
    return NextResponse.json({ item: toQrJson(qrCode) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid QR code id." },
        { status: 400 },
      );
    }

    if (error instanceof QrOwnershipError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to load QR code." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    return toUnauthorizedResponse();
  }

  try {
    const params = routeParamsSchema.parse(await context.params);
    const existing = await getOwnedQrCodeById(profile.id, params.id);
    const payload = await request.json();
    const input = parseQrCodeJsonInput({
      name: payload.name ?? existing.name,
      slug: payload.slug ?? existing.slug,
      destinationUrl: payload.destinationUrl ?? existing.destinationUrl,
      isActive: payload.isActive ?? existing.isActive,
    });
    const qrCode = await updateOwnedQrCode(profile.id, params.id, input);
    return NextResponse.json({ item: toQrJson(qrCode) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    if (error instanceof QrDuplicateSlugError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof QrOwnershipError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to update QR code." }, { status: 500 });
  }
}

