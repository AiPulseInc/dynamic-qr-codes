import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import {
  getOwnedQrCodeById,
  QrDuplicateSlugError,
  QrOwnershipError,
  QrValidationError,
  setOwnedQrCodeStatus,
  updateOwnedQrCode,
} from "@/lib/qr/service";
import { parseQrCodeJsonInput } from "@/lib/qr/validation";

const routeParamsSchema = z.object({
  id: z.string().uuid("Invalid QR code id."),
});

function toUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function toQrJson(qrCode: {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: qrCode.id,
    name: qrCode.name,
    slug: qrCode.slug,
    destinationUrl: qrCode.destinationUrl,
    isActive: qrCode.isActive,
    createdAt: qrCode.createdAt.toISOString(),
    updatedAt: qrCode.updatedAt.toISOString(),
  };
}

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

export async function DELETE(
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
    await setOwnedQrCodeStatus(profile.id, params.id, false);
    return new NextResponse(null, { status: 204 });
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

    if (error instanceof QrValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to disable QR code." }, { status: 500 });
  }
}
