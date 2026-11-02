import assert from "node:assert/strict";
import { test } from "node:test";
import { concert, isConcertPerformance, registrationIsClosed } from "../data/concert";
import { handleConcertRegistration, parseRegistration, csvCell, registrationsCsv } from "../lib/concert-registration";
import { dropConcertTelemetry, isConcertPrivate } from "../lib/concert-telemetry";

const valid = { firstName: "  ნუცა ", lastName: "O’Neill", email: " Guest@Example.COM ", consent: true, website: "" };
const origin = "https://edishersavitski.com";

test("only the Nov24 New York YASI recital receives its registration link", () => {
  const performance = { date: new Date("2026-11-24T12:00:00Z"), venue: "YASI", location: "New York" };
  assert.equal(isConcertPerformance(performance), true);
  assert.equal(isConcertPerformance({ ...performance, date: "2026-11-24T12:00:00.000Z", venue: "Yamaha Artist Services", location: "New York, NY" }), true);
  for (const changes of [{ date: "2026-11-23T12:00:00Z" }, { date: "2025-11-24" }, { date: "invalid" }, { venue: "YASI other venue" }, { location: "New Yorkville" }, { venue: "Carnegie Hall" }]) assert.equal(isConcertPerformance({ ...performance, ...changes }), false);
});
function request(body: unknown = valid, headers: Record<string, string> = {}) {
  return new Request(origin + "/api/concert-registration", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
}
function dependencies(overrides: Record<string, unknown> = {}) {
  return { enabled: true, allowedOrigin: origin, now: () => Date.parse("2026-11-02T10:00:00Z"), takeRateLimit: async () => ({ allowed: true, retryAfter: 900 }), save: async () => true, ...overrides };
}

test("normalizes addresses, preserves international names, requires consent and bounded valid fields", () => {
  assert.deepEqual(parseRegistration(valid), { firstName: "ნუცა", lastName: "O’Neill", email: "guest@example.com" });
  for (const changes of [{ firstName: " " }, { lastName: "x\nInjected" }, { firstName: "a".repeat(101) }, { email: "a..b@example.com" }, { email: ".a@example.com" }, { email: "guest@localhost" }, { email: "a".repeat(65) + "@example.com" }, { email: "a@" + "b".repeat(64) + ".com" }, { consent: "true" }, { website: "spam" }, { email: {} }]) {
    assert.equal(parseRegistration({ ...valid, ...changes }), null, JSON.stringify(changes));
  }
  for (const body of [null, [], "text", true]) assert.equal(parseRegistration(body), null);
});

test("deadline is midnight after Nov22 New York time, with an exclusive boundary", () => {
  const deadline = Date.parse(concert.registrationClosesAt);
  assert.equal(registrationIsClosed(deadline - 1), false);
  assert.equal(registrationIsClosed(deadline), true);
  assert.equal(new Date(deadline).toLocaleString("en-US", { timeZone: "America/New_York" }), "11/23/2026, 12:00:00 AM");
});

test("rejects disabled, closed, foreign/missing origin, wrong content type and malformed inputs before storage", async () => {
  let calls = 0;
  const deps = dependencies({ save: async () => { calls++; return true; }, takeRateLimit: async () => { calls++; return { allowed: true, retryAfter: 900 }; } });
  assert.equal((await handleConcertRegistration(request(), { ...deps, enabled: false })).status, 503);
  assert.equal((await handleConcertRegistration(request(), { ...deps, now: () => Date.parse(concert.registrationClosesAt) })).status, 410);
  assert.equal((await handleConcertRegistration(request(valid, { Origin: "https://untrusted.example" }), deps)).status, 403);
  assert.equal((await handleConcertRegistration(request(valid, { Origin: "null" }), deps)).status, 403);
  const noOrigin = request(); noOrigin.headers.delete("Origin");
  assert.equal((await handleConcertRegistration(noOrigin, deps)).status, 403);
  assert.equal((await handleConcertRegistration(request(valid, { "Content-Type": "text/plain" }), deps)).status, 415);
  assert.equal((await handleConcertRegistration(request({ ...valid, consent: false }), deps)).status, 400);
  const malformed = new Request(origin, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{" });
  assert.equal((await handleConcertRegistration(malformed, deps)).status, 400);
  assert.equal(calls, 0);
});

test("enforces body byte cap without Content-Length, including multi-byte names", async () => {
  const result = await handleConcertRegistration(request({ ...valid, extra: "ა".repeat(2000) }), dependencies());
  assert.equal(result.status, 413);
  assert.match(result.headers.get("cache-control")!, /no-store/);
});

test("save is awaited, limiter failure and storage failures never claim success or leak details", async () => {
  let saved = false;
  const result = await handleConcertRegistration(request(), dependencies({ save: async () => { await Promise.resolve(); saved = true; return true; } }));
  assert.equal(saved, true);
  assert.deepEqual(await result.json(), { success: true });
  assert.match(result.headers.get("cache-control")!, /private.*no-store/);
  const limited = await handleConcertRegistration(request(), dependencies({ takeRateLimit: async () => ({ allowed: false, retryAfter: 42 }), save: async () => { assert.fail("must not save when limited"); } }));
  assert.equal(limited.status, 429); assert.equal(limited.headers.get("retry-after"), "42");
  for (const key of ["save", "takeRateLimit"]) {
    const failed = await handleConcertRegistration(request(), dependencies({ [key]: async () => { throw new Error("secret-person@example.com"); } }));
    assert.equal(failed.status, 503); assert.equal((await failed.text()).includes("secret-person"), false);
  }
});

test("rechecks cutoff after limiter and honors the database closure decision", async () => {
  let now = Date.parse(concert.registrationClosesAt) - 1;
  const deps = dependencies({ now: () => now, takeRateLimit: async () => { now++; return { allowed: true, retryAfter: 1 }; }, save: async () => { assert.fail("must not insert after cutoff"); } });
  assert.equal((await handleConcertRegistration(request(), deps)).status, 410);
  assert.equal((await handleConcertRegistration(request(), dependencies({ save: async () => false }))).status, 410);
});

test("CSV handles Unicode, quotes, commas, CRLF and formula prefixes after whitespace", () => {
  for (const value of ["=2+2", "+cmd", "-1+2", "@SUM(A1)", "  =1", "\tformula", " \rformula", "\nformula"]) assert.ok(csvCell(value).startsWith('"\''), value);
  assert.equal(csvCell('ნუცა, "N"'), '"ნუცა, ""N"""');
  const csv = registrationsCsv([{ firstName: "ნუცა", lastName: "O’Neill", email: "guest@example.com", createdAt: new Date("2026-11-02T10:00:00Z") }]);
  assert.ok(csv.startsWith("\uFEFF")); assert.ok(csv.endsWith("\r\n")); assert.ok(csv.includes('"2026-11-02T10:00:00.000Z"'));
});

test("client, server and edge telemetry filters reject every private route and descendant", () => {
  for (const path of [concert.path, "/api/concert-registration", "/admin/registrations", "/admin/registrations/export", "/admin/registrations?page=2"]) {
    assert.equal(isConcertPrivate(path), true);
    assert.equal(dropConcertTelemetry({ request: { url: origin + path } }), null);
    assert.equal(dropConcertTelemetry({ transaction: "GET " + path }), null);
  }
  const normal = { request: { url: origin + "/about" } };
  assert.equal(dropConcertTelemetry(normal), normal);
});
