import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEventId, parseRegistrationSettings } from "../lib/event-registration";

test("validates IDs and venue-local closing dates", () => {
  for (const id of [undefined, [1], "0", "-1", "01", "1.1", "2147483648", "1e0", "1 ", "1\n"]) {
    assert.equal(parseEventId(id), null, JSON.stringify(id));
  }
  assert.equal(parseEventId("2147483647"), 2147483647);
  const form = new FormData();
  form.set("closesOn", "2026-02-29");
  form.set("timeZone", "Asia/Tbilisi");
  assert.equal(parseRegistrationSettings(form), null);
  form.set("closesOn", "2026-11-22");
  for (const zone of ["+04:00", "Not/Real", "GMT+5"]) {
    form.set("timeZone", zone);
    assert.equal(parseRegistrationSettings(form), null);
  }
  form.set("timeZone", "America/New_York");
  assert.deepEqual(parseRegistrationSettings(form), { closesOn: "2026-11-22", timeZone: "America/New_York", enabled: false });
});

test("local PG: settings, real deadlines, event isolation and legacy exclusion", { skip: process.env.CONCERT_DATABASE_TEST !== "true" }, async () => {
  assert.equal(new URL(process.env.DATABASE_URL!).hostname, "concert-test.invalid");
  const { prisma } = await import("../lib/prisma");
  const { savePerformanceRegistration, saveRegistrationSettings } = await import("../lib/event-registration-store");
  const { takeRegistrationRateLimit, deleteConcertRegistration } = await import("../lib/concert-registration-store");
  const { eventRegistrationKey } = await import("../lib/event-registration");
  const input = { firstName: "Synthetic", lastName: "Attendee", email: "event-fixture@example.com" };
  const settings = { closesOn: "2098-03-09", timeZone: "America/New_York", enabled: true };
  const base = { title: "Fixture", venue: "Concert Hall", location: "Tbilisi", country: "GE", date: new Date("2098-04-01"), type: "solo" as const };
  const a = await prisma.performance.create({ data: base });
  const b = await prisma.performance.create({ data: base });
  const keys = [eventRegistrationKey(a.id), eventRegistrationKey(b.id)];
  try {
    assert.equal(await savePerformanceRegistration(a.id, input), false, "unconfigured cannot accept submissions");
    assert.equal(await saveRegistrationSettings(a.id, { ...settings, closesOn: "2026-03-08" }), true);
    const past = await prisma.performanceRegistrationForm.findUniqueOrThrow({ where: { performanceId: a.id } });
    assert.equal(past.closesAt.toISOString(), "2026-03-09T04:00:00.000Z", "local midnight uses post-DST offset");
    assert.equal(await savePerformanceRegistration(a.id, input), false);
    assert.equal(await saveRegistrationSettings(a.id, { ...settings, closesOn: "2026-10-31", timeZone: "America/Havana" }), true);
    const repeatedMidnight = await prisma.performanceRegistrationForm.findUniqueOrThrow({ where: { performanceId: a.id } });
    assert.equal(repeatedMidnight.closesAt.toISOString(), "2026-11-01T04:00:00.000Z", "close when the new day first starts");
    assert.equal(await saveRegistrationSettings(a.id, { ...settings, closesOn: "2011-12-29", timeZone: "Pacific/Apia" }), false, "reject a skipped local midnight");
    assert.equal(await saveRegistrationSettings(a.id, settings), true);
    assert.equal(await saveRegistrationSettings(b.id, { ...settings, timeZone: "Asia/Tbilisi" }), true);
    assert.deepEqual(await Promise.all(Array.from({ length: 8 }, () => savePerformanceRegistration(a.id, input))), Array(8).fill(true));
    assert.equal(await savePerformanceRegistration(b.id, input), true);
    assert.equal(await prisma.concertRegistration.count({ where: { eventSlug: { in: keys }, email: input.email } }), 2);
    const first = await prisma.concertRegistration.findFirstOrThrow({ where: { eventSlug: keys[0] } });
    await deleteConcertRegistration(first.id, keys[1]);
    assert.equal(await prisma.concertRegistration.count({ where: { id: first.id } }), 1);

    await prisma.concertRegistrationLimit.create({
      data: { key: keys[0], attempts: 300, expiresAt: new Date(Date.now() + 60000) },
    });
    assert.equal((await takeRegistrationRateLimit(keys[0])).allowed, false);
    assert.equal((await takeRegistrationRateLimit(keys[1])).allowed, true);
    assert.equal(await saveRegistrationSettings(a.id, { ...settings, enabled: false }), true);
    assert.equal(await savePerformanceRegistration(a.id, input), false);
    await assert.rejects(prisma.performance.delete({ where: { id: a.id } }), { code: /^(P2003|23503)$/ });

    await prisma.performance.update({
      where: { id: b.id },
      data: { date: new Date("2026-11-24T12:00:00Z"), venue: "\t Yamaha Artist Services, Studio", location: "New York, NY " },
    });
    assert.equal(await saveRegistrationSettings(b.id, settings), false, "legacy identity cannot save another form");
    assert.equal(await savePerformanceRegistration(b.id, { ...input, email: "stale@example.com" }), false);
    assert.equal(await prisma.concertRegistration.count({ where: { eventSlug: keys[1] } }), 1, "prior attendee history remains");
  } finally {
    await prisma.concertRegistration.deleteMany({ where: { eventSlug: { in: keys } } });
    await prisma.concertRegistrationLimit.deleteMany({ where: { key: { in: keys } } });
    await prisma.performanceRegistrationForm.deleteMany({ where: { performanceId: { in: [a.id, b.id] } } });
    await prisma.performance.deleteMany({ where: { id: { in: [a.id, b.id] } } });
  }
});
