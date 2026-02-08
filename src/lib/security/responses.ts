import { NextResponse } from "next/server";

export function toUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export function toRateLimitedResponse(retryAfterSeconds: number, requestId: string) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "retry-after": String(retryAfterSeconds),
        "x-request-id": requestId,
      },
    },
  );
}
