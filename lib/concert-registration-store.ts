import { prisma } from "@/lib/prisma";
import { concert } from "@/data/concert";
import type { RegistrationInput } from "@/lib/concert-registration";

export async function takeRegistrationRateLimit() {
  const [bucket] = await prisma.$queryRaw<Array<{ attempts: number; retryAfter: number }>>`
    INSERT INTO concert_registration_limits (key, attempts, expires_at)
    VALUES (${concert.slug}, 1, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN concert_registration_limits.expires_at <= CURRENT_TIMESTAMP
        THEN 1 ELSE LEAST(concert_registration_limits.attempts + 1, 301) END,
      expires_at = CASE WHEN concert_registration_limits.expires_at <= CURRENT_TIMESTAMP
        THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE concert_registration_limits.expires_at END
    RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (expires_at - CURRENT_TIMESTAMP))))::int AS "retryAfter"
  `;
  return { allowed: bucket.attempts <= 300, retryAfter: bucket.retryAfter };
}

export async function saveConcertRegistration(input: RegistrationInput): Promise<boolean> {
  // The DB clock enforces the deadline inside the insert, even if a request waited.
  // The unique constraint handles simultaneous retries without overwriting names.
  const [result] = await prisma.$queryRaw<Array<{ open: boolean }>>`
    WITH admission AS (
      SELECT CURRENT_TIMESTAMP < ${concert.registrationClosesAt}::timestamptz AS open
    ), inserted AS (
      INSERT INTO concert_registrations (event_slug, first_name, last_name, email, consent_version)
      SELECT ${concert.slug}, ${input.firstName}, ${input.lastName}, ${input.email}, ${concert.consentVersion}
      FROM admission WHERE open
      ON CONFLICT (event_slug, email) DO NOTHING
      RETURNING id
    ) SELECT open FROM admission
  `;
  return result.open;
}
