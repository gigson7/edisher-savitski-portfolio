import assert from "node:assert/strict";
import { test } from "node:test";
import { concert } from "../data/concert";
import { prisma } from "../lib/prisma";
import { deleteConcertRegistration, saveConcertRegistration, takeRegistrationRateLimit } from "../lib/concert-registration-store";
import { registrationsCsv } from "../lib/concert-registration";
import { registrationsXlsx } from "../lib/concert-registration-xlsx";
import ExcelJS from "exceljs";

test("local PostgreSQL: migration, concurrent duplicates and atomic limiter reset/saturation", { skip: process.env.CONCERT_DATABASE_TEST !== "true" }, async () => {
  assert.equal(new URL(process.env.DATABASE_URL!).hostname, "concert-test.invalid", "Never test against a production database");
  await prisma.concertRegistration.deleteMany({ where: { eventSlug: concert.slug } });
  await prisma.concertRegistrationLimit.deleteMany({ where: { key: concert.slug } });
  const input = { firstName: "Synthetic", lastName: "Attendee", email: "test-concurrent@example.com" };
  assert.equal(await saveConcertRegistration(input), true);
  const results = await Promise.all(Array.from({ length: 20 }, () => saveConcertRegistration({ ...input, firstName: "Must not replace original" })));
  assert.ok(results.every(Boolean));
  assert.equal(await prisma.concertRegistration.count({ where: { eventSlug: concert.slug, email: input.email } }), 1);
  const row = await prisma.concertRegistration.findFirstOrThrow({ where: { email: input.email } });
  assert.equal(row.firstName, "Synthetic"); assert.equal(row.consentVersion, concert.consentVersion);
  assert.ok(Math.abs(row.createdAt.getTime() - Date.now()) < 10000, "createdAt is an absolute instant in non-UTC sessions");
  const [timezone] = await prisma.$queryRaw<Array<{ zone: string; before: boolean; at: boolean }>>`
    SELECT current_setting('TimeZone') AS zone,
      '2026-11-23T04:59:59.999Z'::timestamptz < ${concert.registrationClosesAt}::timestamptz AS before,
      '2026-11-23T05:00:00Z'::timestamptz < ${concert.registrationClosesAt}::timestamptz AS at
  `;
  assert.equal(timezone.zone, "Asia/Tbilisi"); assert.equal(timezone.before, true); assert.equal(timezone.at, false);

  await prisma.concertRegistrationLimit.create({ data: { key: concert.slug, attempts: 295, expiresAt: new Date(Date.now() + 60000) } });
  const limits = await Promise.all(Array.from({ length: 20 }, () => takeRegistrationRateLimit()));
  assert.equal(limits.filter((r) => r.allowed).length, 5);
  const limit = await prisma.concertRegistrationLimit.findUniqueOrThrow({ where: { key: concert.slug } });
  assert.equal(limit.attempts, 301);
  assert.ok(limits.every((r) => r.retryAfter >= 1 && r.retryAfter <= 60));
  await prisma.concertRegistrationLimit.update({ where: { key: concert.slug }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await takeRegistrationRateLimit()).allowed, true);
  assert.equal((await prisma.concertRegistrationLimit.findUniqueOrThrow({ where: { key: concert.slug } })).attempts, 1);
  const other = await prisma.concertRegistration.create({ data: { eventSlug: "other-test-event", ...input, consentVersion: "test" } });
  try {
    await deleteConcertRegistration(other.id);
    assert.equal(await prisma.concertRegistration.count({ where: { id: other.id } }), 1, "Never delete another event's row");
    await deleteConcertRegistration(row.id);
    await deleteConcertRegistration(row.id);
    const remaining = await prisma.concertRegistration.findMany({ where: { eventSlug: concert.slug } });
    assert.equal(remaining.length, 0);
    assert.ok(!registrationsCsv(remaining).includes(input.email));
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load((await registrationsXlsx(remaining)).buffer);
    assert.equal(workbook.getWorksheet("Registrations")!.rowCount, 1, "Deleted attendee is excluded from Excel");
    assert.equal(await saveConcertRegistration(input), true);
    assert.equal(await prisma.concertRegistration.count({ where: { eventSlug: concert.slug, email: input.email } }), 1, "Deleted email can register again");
  } finally {
    await prisma.concertRegistration.deleteMany({ where: { id: other.id, eventSlug: "other-test-event" } });
  }
  await prisma.concertRegistration.deleteMany({ where: { eventSlug: concert.slug } });
  await prisma.concertRegistrationLimit.deleteMany({ where: { key: concert.slug } });
});
