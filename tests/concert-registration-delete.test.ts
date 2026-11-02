import assert from "node:assert/strict";
import { test } from "node:test";
import { handleDeleteConcertRegistration } from "../lib/concert-registration-delete";

const origin = "https://edishersavitski.com";
function request(value: string | null = origin) {
  return new Request(`${origin}/admin/registrations/1`, { method: "DELETE", headers: value === null ? {} : { Origin: value } });
}

test("deletion requires authentication and canonical Origin before any mutation", async () => {
  let calls = 0;
  const deps = { allowedOrigin: origin, isAuthenticated: async () => false, remove: async () => { calls++; } };
  assert.equal((await handleDeleteConcertRegistration(request(), "1", deps)).status, 401);
  for (const value of [null, "null", "https://example.com", `${origin}.example.com`, "http://edishersavitski.com"]) {
    assert.equal((await handleDeleteConcertRegistration(request(value), "1", { ...deps, isAuthenticated: async () => true })).status, 403);
  }
  assert.equal(calls, 0);
});

test("deletion rejects malformed, non-positive and overflowing IDs", async () => {
  let calls = 0;
  const deps = { allowedOrigin: origin, isAuthenticated: async () => true, remove: async () => { calls++; } };
  for (const id of ["", "0", "-1", "01", "1.0", "1e2", "+1", " 1", "1 ", "1x", "NaN", "Infinity", "2147483648", "99999999999999999999"]) {
    assert.equal((await handleDeleteConcertRegistration(request(), id, deps)).status, 400, id);
  }
  assert.equal(calls, 0);
  for (const id of ["1", "2147483647"]) {
    assert.equal((await handleDeleteConcertRegistration(request(), id, deps)).status, 200);
  }
  assert.equal(calls, 2);
});

test("deletion is repeatable and all responses stay private without leaking database errors", async () => {
  const removed: number[] = [];
  const deps = { allowedOrigin: origin, isAuthenticated: async () => true, remove: async (id: number) => { removed.push(id); } };
  const responses = [
    await handleDeleteConcertRegistration(request(), "17", deps),
    await handleDeleteConcertRegistration(request(), "17", deps),
    await handleDeleteConcertRegistration(request(), "17", { ...deps, isAuthenticated: async () => false }),
    await handleDeleteConcertRegistration(request(null), "17", deps),
    await handleDeleteConcertRegistration(request(), "bad", deps),
    await handleDeleteConcertRegistration(request(), "17", { ...deps, remove: async () => { throw Error("private@example.com database failure"); } }),
  ];
  assert.deepEqual(removed, [17, 17]);
  assert.deepEqual(responses.map(r => r.status), [200, 200, 401, 403, 400, 503]);
  for (const response of responses) {
    assert.match(response.headers.get("cache-control")!, /private.*no-store/);
    assert.equal(response.headers.get("vary"), "Cookie");
    assert.doesNotMatch(await response.text(), /private@example.com|database failure/);
  }
});
