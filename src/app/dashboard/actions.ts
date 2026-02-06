"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import { QrDuplicateSlugError, QrOwnershipError, QrValidationError } from "@/lib/qr/service";
import {
  createOwnedQrCode,
  setOwnedQrCodeStatus,
  updateOwnedQrCode,
} from "@/lib/qr/service";
import { parseQrCodeFormInput } from "@/lib/qr/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const qrCodeIdSchema = z.string().uuid("Invalid QR code id.");

function safeReturnTo(rawReturnTo: string | null): string {
  if (!rawReturnTo || !rawReturnTo.startsWith("/dashboard")) {
    return "/dashboard";
  }

  return rawReturnTo;
}

function redirectWithMessage(path: string, type: "notice" | "error", message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set(type, message);
  redirect(`${url.pathname}${url.search}`);
}

async function requireUserProfileOrRedirect() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createQrCode(formData: FormData) {
  const profile = await requireUserProfileOrRedirect();
  const returnTo = safeReturnTo(formData.get("returnTo")?.toString() ?? null);

  try {
    const input = parseQrCodeFormInput({
      name: formData.get("name"),
      slug: formData.get("slug"),
      destinationUrl: formData.get("destinationUrl"),
      isActive: formData.get("isActive"),
    });

    await createOwnedQrCode(profile.id, input);
    revalidatePath("/dashboard");
    redirectWithMessage(returnTo, "notice", "QR code created.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirectWithMessage(returnTo, "error", error.issues[0]?.message ?? "Invalid input.");
    }

    if (error instanceof QrDuplicateSlugError) {
      redirectWithMessage(returnTo, "error", error.message);
    }

    redirectWithMessage(returnTo, "error", "Unable to create QR code.");
  }
}

export async function updateQrCode(formData: FormData) {
  const profile = await requireUserProfileOrRedirect();
  const returnTo = safeReturnTo(formData.get("returnTo")?.toString() ?? null);

  try {
    const qrCodeId = qrCodeIdSchema.parse(formData.get("qrCodeId")?.toString());
    const input = parseQrCodeFormInput({
      name: formData.get("name"),
      slug: formData.get("slug"),
      destinationUrl: formData.get("destinationUrl"),
      isActive: formData.get("isActive"),
    });

    await updateOwnedQrCode(profile.id, qrCodeId, input);
    revalidatePath("/dashboard");
    redirectWithMessage(returnTo, "notice", "QR code updated.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirectWithMessage(returnTo, "error", error.issues[0]?.message ?? "Invalid input.");
    }

    if (error instanceof QrDuplicateSlugError || error instanceof QrOwnershipError) {
      redirectWithMessage(returnTo, "error", error.message);
    }

    redirectWithMessage(returnTo, "error", "Unable to update QR code.");
  }
}

export async function disableQrCode(formData: FormData) {
  const profile = await requireUserProfileOrRedirect();
  const returnTo = safeReturnTo(formData.get("returnTo")?.toString() ?? null);

  try {
    const qrCodeId = qrCodeIdSchema.parse(formData.get("qrCodeId")?.toString());
    await setOwnedQrCodeStatus(profile.id, qrCodeId, false);
    revalidatePath("/dashboard");
    redirectWithMessage(returnTo, "notice", "QR code disabled.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirectWithMessage(returnTo, "error", error.issues[0]?.message ?? "Invalid request.");
    }

    if (error instanceof QrOwnershipError || error instanceof QrValidationError) {
      redirectWithMessage(returnTo, "error", error.message);
    }

    redirectWithMessage(returnTo, "error", "Unable to disable QR code.");
  }
}

export async function enableQrCode(formData: FormData) {
  const profile = await requireUserProfileOrRedirect();
  const returnTo = safeReturnTo(formData.get("returnTo")?.toString() ?? null);

  try {
    const qrCodeId = qrCodeIdSchema.parse(formData.get("qrCodeId")?.toString());
    await setOwnedQrCodeStatus(profile.id, qrCodeId, true);
    revalidatePath("/dashboard");
    redirectWithMessage(returnTo, "notice", "QR code enabled.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirectWithMessage(returnTo, "error", error.issues[0]?.message ?? "Invalid request.");
    }

    if (error instanceof QrOwnershipError || error instanceof QrValidationError) {
      redirectWithMessage(returnTo, "error", error.message);
    }

    redirectWithMessage(returnTo, "error", "Unable to enable QR code.");
  }
}
