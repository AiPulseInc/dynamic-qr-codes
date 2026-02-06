"use server";

import { redirect } from "next/navigation";

import { getServerEnv } from "@/lib/env/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/")) {
    return "/dashboard";
  }

  return rawNext;
}

function toErrorPath(message: string, nextPath: string) {
  const encodedError = encodeURIComponent(message);
  const encodedNext = encodeURIComponent(nextPath);
  return `/login?error=${encodedError}&next=${encodedNext}`;
}

export async function signInWithPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next")?.toString() ?? null);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(toErrorPath(error.message, nextPath));
  }

  redirect(nextPath);
}

export async function signUpWithPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next")?.toString() ?? null);
  const env = getServerEnv();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.APP_BASE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    redirect(toErrorPath(error.message, nextPath));
  }

  const encodedMessage = encodeURIComponent("Account created. Verify your email, then sign in.");
  redirect(`/login?message=${encodedMessage}&next=${encodeURIComponent(nextPath)}`);
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const env = getServerEnv();
  const nextPath = safeNextPath(formData.get("next")?.toString() ?? null);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.APP_BASE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data.url) {
    redirect(toErrorPath(error?.message ?? "Unable to start Google sign-in.", nextPath));
  }

  redirect(data.url);
}
