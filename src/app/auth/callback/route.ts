import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env/server";

function safeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/")) {
    return "/dashboard";
  }

  return rawNext;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"));
  const env = getServerEnv();

  // Use APP_BASE_URL instead of url.origin to avoid Railway proxy issues
  const baseUrl = env.APP_BASE_URL;
  const redirectUrl = new URL(nextPath, baseUrl);

  if (code) {
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split("; ")
            .map((c) => {
              const [name, ...rest] = c.split("=");
              return { name, value: rest.join("=") };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL("/login", baseUrl);
      errorUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(errorUrl);
    }

    return response;
  }

  return NextResponse.redirect(redirectUrl);
}
