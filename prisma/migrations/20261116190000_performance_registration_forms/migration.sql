BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '15s';

CREATE TABLE "public"."performance_registration_forms" (
    "performance_id" INTEGER PRIMARY KEY REFERENCES "public"."performances"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "closes_on" DATE NOT NULL,
    "time_zone" VARCHAR(80) NOT NULL,
    "closes_at" TIMESTAMP(3) NOT NULL
);

COMMIT;
