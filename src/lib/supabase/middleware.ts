import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env/server";

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/r/")) {
    return NextResponse.next({
      request,
    });
  }

  const env = getServerEnv();

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;

  try {
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser();
    user = resolvedUser;
  } catch {
    user = null;
  }

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("auth", "signin");
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && request.nextUrl.pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    const nextParam = request.nextUrl.searchParams.get("next") || "/dashboard";
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("auth", "signin");
    redirectUrl.searchParams.set("next", nextParam);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
