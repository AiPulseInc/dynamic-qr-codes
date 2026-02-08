import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "__csrf";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_FORM_FIELD = "_csrf";

export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME);

  if (existing?.value) {
    return existing.value;
  }

  const token = generateToken();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });

  return token;
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) {
    return false;
  }

  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return timingSafeEqual(cookieToken, headerToken);
  }

  return false;
}

export async function validateCsrfFormToken(formData: FormData): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) {
    return false;
  }

  const formToken = formData.get(CSRF_FORM_FIELD);
  if (typeof formToken !== "string") {
    return false;
  }

  return timingSafeEqual(cookieToken, formToken);
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

export { CSRF_COOKIE_NAME, CSRF_FORM_FIELD, CSRF_HEADER_NAME };
