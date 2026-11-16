import assert from "node:assert/strict";
import { test } from "node:test";
import { readPerformanceLinkFields, validatePerformanceLink } from "../lib/performance-link";

test("link pairs use a canonical HTTPS destination and a plain Unicode title", () => {
  assert.deepEqual(validatePerformanceLink(" HTTPS://TKT.GE/event/508983/edisher-savicki-50 ", "  ბილეთები 🎟 "), {
    values: { linkUrl: "https://tkt.ge/event/508983/edisher-savicki-50", linkTitle: "ბილეთები 🎟" },
  });
});

test("the parser rejects unsafe, partial and oversized link pairs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "http://example.org",
    "//example.org",
    "/relative",
    "https:example.org",
    "https:///example.org",
    "https://a:b@example.org",
    "https://example.org\\@other.example",
    "https://exa\tmple.org",
    "https://",
    "https://example.org/" + "წ".repeat(230),
  ]) assert.ok(validatePerformanceLink(url, "Buy Tickets").error, url);
  assert.ok(validatePerformanceLink("https://example.org", "").error);
  assert.ok(validatePerformanceLink("", "Buy Tickets").error);
  assert.ok(validatePerformanceLink("https://example.org", "a".repeat(81)).error);
  assert.ok(validatePerformanceLink("https://example.org", "Buy\0Tickets").error);
  assert.ok(validatePerformanceLink("https://example.org", "\ud800").error);
});

test("omitting both fields preserves an existing pair, while explicitly blanking both clears it", () => {
  const data = new FormData();
  assert.deepEqual(readPerformanceLinkFields(data), { values: undefined });
  data.set("linkUrl", "");
  assert.ok(readPerformanceLinkFields(data).error);
  data.set("linkTitle", " ");
  assert.deepEqual(readPerformanceLinkFields(data), { values: { linkUrl: null, linkTitle: null } });
  data.append("linkTitle", "Duplicate");
  assert.ok(readPerformanceLinkFields(data).error);
  data.set("linkTitle", new Blob(["not a text field"]));
  assert.ok(readPerformanceLinkFields(data).error);
});
