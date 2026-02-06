CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "profiles" (
  "id" UUID PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "qr_codes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "destination_url" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "scan_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "qr_code_id" UUID NOT NULL REFERENCES "qr_codes"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "is_bot" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX "idx_qr_codes_user_id" ON "qr_codes"("user_id");
CREATE INDEX "idx_scan_events_qr_code_id_scanned_at" ON "scan_events"("qr_code_id", "scanned_at");
CREATE INDEX "idx_scan_events_user_id_scanned_at" ON "scan_events"("user_id", "scanned_at");
