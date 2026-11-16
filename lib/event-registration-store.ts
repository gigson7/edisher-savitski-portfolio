import { isConcertPerformance, legacyConcertMatch } from "@/data/concert";
import { eventRegistrationEnabled, eventRegistrationKey, eventRegistrationPath, parseRegistrationSettings } from "@/lib/event-registration";
import type { RegistrationInput } from "@/lib/concert-registration";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

const notLegacyConcert = Prisma.sql`NOT (
  "date"::date = ${legacyConcertMatch.date}::date
  AND regexp_replace(venue, '^\\s+|\\s+$', '', 'g') ~* ${legacyConcertMatch.venue}
  AND regexp_replace(location, '^\\s+|\\s+$', '', 'g') ~* ${legacyConcertMatch.location}
)`;

type Settings = NonNullable<ReturnType<typeof parseRegistrationSettings>>;

export async function saveRegistrationSettings(id: number, settings: Settings): Promise<boolean> {
  // Probe the offsets on either side of local midnight. Use its first occurrence
  // if repeated and reject a skipped midnight rather than extending the deadline.
  // Persist UTC because the HTTP adapter reads timestamp fields as UTC.
  const affected = await prisma.$executeRaw`
    WITH eligible_performance AS MATERIALIZED (
      SELECT id FROM performances WHERE id = ${id} AND ${notLegacyConcert} FOR SHARE
    )
    INSERT INTO performance_registration_forms (performance_id, enabled, closes_on, time_zone, closes_at)
    SELECT p.id, ${settings.enabled}, ${settings.closesOn}::date, z.name,
           cutoff.instant AT TIME ZONE 'UTC'
    FROM eligible_performance p
    CROSS JOIN pg_timezone_names z
    CROSS JOIN LATERAL (
      SELECT (${settings.closesOn}::date + 1)::timestamp AS midnight
    ) local_time
    CROSS JOIN LATERAL (
      SELECT MIN(candidate) AS instant
      FROM (
        SELECT (local_time.midnight AT TIME ZONE 'UTC')
          - ((probe AT TIME ZONE z.name) - (probe AT TIME ZONE 'UTC')) AS candidate
        FROM (VALUES
          ((local_time.midnight AT TIME ZONE 'UTC') - INTERVAL '24 hours'),
          ((local_time.midnight AT TIME ZONE 'UTC') + INTERVAL '24 hours')
        ) probes(probe)
      ) options
      WHERE candidate AT TIME ZONE z.name = local_time.midnight
    ) cutoff
    WHERE lower(z.name) = lower(${settings.timeZone}) AND cutoff.instant IS NOT NULL
    ORDER BY (z.name = ${settings.timeZone}) DESC
    LIMIT 1
    ON CONFLICT (performance_id) DO UPDATE SET
      enabled = EXCLUDED.enabled,
      closes_on = EXCLUDED.closes_on,
      time_zone = EXCLUDED.time_zone,
      closes_at = EXCLUDED.closes_at
  `;
  return affected === 1;
}

export async function savePerformanceRegistration(id: number, input: RegistrationInput): Promise<boolean> {
  const [result] = await prisma.$queryRaw<Array<{ open: boolean }>>`
    WITH eligible_performance AS MATERIALIZED (
      SELECT id FROM performances WHERE id = ${id} AND ${notLegacyConcert} FOR SHARE
    ), settings AS MATERIALIZED (
      SELECT f.enabled, f.closes_at FROM eligible_performance p
      JOIN performance_registration_forms f ON f.performance_id = p.id
      FOR SHARE OF f
    ), admission AS MATERIALIZED (
      SELECT enabled AND (clock_timestamp() AT TIME ZONE 'UTC') < closes_at AS open FROM settings
    ), inserted AS (
      INSERT INTO concert_registrations (event_slug, first_name, last_name, email, consent_version)
      SELECT ${eventRegistrationKey(id)}, ${input.firstName}, ${input.lastName}, ${input.email}, 'event-admission-v1'
      FROM admission WHERE open
      ON CONFLICT (event_slug, email) DO NOTHING
    ) SELECT open FROM admission
  `;
  return result?.open === true;
}

export async function getEventRegistration(id: number) {
  if (!eventRegistrationEnabled()) return null;
  const form = await prisma.performanceRegistrationForm.findUnique({
    where: { performanceId: id },
    include: { performance: { select: { id: true, title: true, date: true, venue: true, location: true } } },
  });
  return form && !isConcertPerformance(form.performance) ? form : null;
}

export async function getOpenRegistrationLinks(performances: { id: number | string }[]): Promise<Record<number, string>> {
  if (!eventRegistrationEnabled()) return {};
  const ids = performances.flatMap(({ id }) => typeof id === "number" ? [id] : []);
  if (ids.length === 0) return {};
  try {
    const forms = await prisma.performanceRegistrationForm.findMany({
      where: { performanceId: { in: ids }, enabled: true, closesAt: { gt: new Date() } },
      select: { performanceId: true },
    });
    return Object.fromEntries(forms.map(({ performanceId }) => [performanceId, eventRegistrationPath(performanceId)]));
  } catch {
    return {};
  }
}
