-- Additive only: existing portfolio and administrator tables are unchanged.
CREATE TABLE "concert_registrations" (
    "id" SERIAL NOT NULL,
    "event_slug" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "consent_version" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    CONSTRAINT "concert_registrations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "concert_registrations_event_slug_email_key"
    ON "concert_registrations"("event_slug", "email");
CREATE INDEX "concert_registrations_event_slug_created_at_id_idx"
    ON "concert_registrations"("event_slug", "created_at", "id");

-- One bounded, non-personal bucket per concert; no IP addresses are collected.
CREATE TABLE "concert_registration_limits" (
    "key" VARCHAR(100) NOT NULL,
    "attempts" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "concert_registration_limits_pkey" PRIMARY KEY ("key")
);
