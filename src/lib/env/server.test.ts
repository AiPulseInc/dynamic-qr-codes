import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/env/server";

const validEnv = {
  APP_BASE_URL: "http://localhost:3000",
  SHORT_LINK_BASE_URL: "http://localhost:3000",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_example",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_example",
  SUPABASE_DB_URL: "postgresql://postgres:password@localhost:5432/postgres",
};

describe("parseServerEnv", () => {
  it("parses a valid environment object", () => {
    const parsed = parseServerEnv(validEnv);

    expect(parsed.SUPABASE_URL).toBe("https://example.supabase.co");
    expect(parsed.SUPABASE_ANON_KEY).toBe("sb_publishable_example");
  });

  it("throws when required keys are missing", () => {
    expect(() =>
      parseServerEnv({
        APP_BASE_URL: "http://localhost:3000",
      }),
    ).toThrow(/Invalid server environment variables/);
  });
});
