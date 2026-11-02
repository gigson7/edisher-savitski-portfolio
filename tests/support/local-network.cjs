// Preload ONLY in local tests. No production secrets or network calls are required.
const http = require("node:http");
const https = require("node:https");
const originalFetch = globalThis.fetch;
globalThis.fetch = function (input, init) {
  const value = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(value);
  if (["concert-test.invalid", "api.concert-test.invalid", "api.invalid"].includes(url.hostname)) {
    return originalFetch("http://127.0.0.1:55437/sql", init);
  }
  if (url.hostname.endsWith("sentry.io")) return originalFetch("http://127.0.0.1:55437/telemetry", init);
  return originalFetch(input, init);
};
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;
https.request = function (input, ...args) {
  const hostname = typeof input === "string" ? new URL(input).hostname : input instanceof URL ? input.hostname : input.hostname ?? input.host ?? "";
  if (hostname.endsWith("sentry.io")) {
    if (typeof input === "string" || input instanceof URL) return originalHttpRequest.call(http, "http://127.0.0.1:55437/telemetry", ...args);
    return originalHttpRequest.call(http, { ...input, hostname: "127.0.0.1", host: "127.0.0.1", port: 55437, protocol: "http:", path: "/telemetry" }, ...args);
  }
  return originalHttpsRequest.call(https, input, ...args);
};
