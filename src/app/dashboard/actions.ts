"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthenticatedProfile } from "@/lib/auth/user";
import { isRedirectError } from "@/lib/next/redirect";
import { QrDuplicateSlugError, QrOwnershipError } from "@/lib/qr/service";
import { createOwnedQrCode, updateOwnedQrCode } from "@/lib/qr/service";
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
    redirect("/?auth=signin&next=/dashboard");
  }

  return profile;
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
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
    if (isRedirectError(error)) {
      throw error;
    }

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
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      redirectWithMessage(returnTo, "error", error.issues[0]?.message ?? "Invalid input.");
    }

    if (error instanceof QrDuplicateSlugError || error instanceof QrOwnershipError) {
      redirectWithMessage(returnTo, "error", error.message);
    }

    redirectWithMessage(returnTo, "error", "Unable to update QR code.");
  }
}
