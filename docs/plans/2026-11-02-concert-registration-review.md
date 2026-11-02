# Local review and verification record

Scope: full intended working-tree change from origin/main
`a0834354e3397164dae08ee56162e27c64d76387`, including new files.
Initial reviews and verification below were completed for local preview, before
commit/push/PR/merge/migration/deployment. The user subsequently explicitly requested
production publication; current authorization and gates are in the rollout plan.

## Review disposition

| # | Reviewer | Severity | Finding | Decision | Reasoning |
|---|---|---|---|---|---|
| 1 | Codex Extra High design | P1 | Test real Sentry behavior in production mode | Accepted | Added local production browser tests with an intercepted transport, blocked private DOM, synthetic markers and positive control. |
| 2 | Codex Extra High design | P2 | Define runtime rendering/CDN freshness | Accepted | Detail/home/events request-time rendering, no-store overrides, server-authoritative flag/cutoff and client closure. |
| 3 | Codex High complete integration | P2 | Database session timezone changes cutoff | Accepted | Explicit ISO UTC deadline cast to timestamptz; non-UTC SQL regression. Registration timestamps use explicit UTC default because installed Neon adapter assumes UTC when decoding timestamp fields. |

Design review original SHA-256:
`8837e9e25d25554214c09c25d5f245d8e4e7c1ef21d1d57b70bb3feac66b6511`.
The final plan includes accepted findings; no redesign or repeat review was needed.

Review tooling limitations: initial Codex CLI invocation failed before review because
its configured model is unsupported by that CLI account. The successful required
design review used the configured Codex model via read-only review agent at Extra High.
The Gemini 3.5 Flash High helper also failed before review because that exact model
is unavailable in installed Antigravity. The single successful integration review
used the configured Codex model at High as fallback. No extra review loop was run.
GitHub exact-head review remains a future shipping gate; local preview is not clearance.

## Verification

- Fresh original plus additive migrations applied to disposable loopback PostgreSQL.
  Final migration replayed in isolated schema/transaction and rolled back; UTC default
  verified in Asia/Tbilisi session. No production credentials loaded.
- Nine unit/integration tests pass, including 20 concurrent duplicate submissions,
  immutable original names, 20 competing limiter claims at the limit, saturation and
  expiry reset, cutoff/origin/consent/body validation, CSV formula defense and telemetry
  filters. Real PrismaNeonHttp tested through a local HTTP protocol bridge.
- TypeScript and full ESLint pass (existing warnings remain). Production build passes;
  existing jose Edge-runtime warnings and workspace-root warning remain.
- Browser valid submission saves in local PostgreSQL. 320px/390px pages have exactly
  matching document/viewport widths; fields stay within 24px margins. Poster preserved
  in full, unchanged from supplied Adobe rendition.
- Same production build started with flag false verifies unavailable form, no
  announcements, 503 intake and no-store headers; restarted true without rebuilding.
- Protected CSV denies unauthenticated requests, allows local signed session, returns
  private/no-store + Vary Cookie and neutralizes a formula-like synthetic attendee name.
- Browser verification covers missing fields, failed submission retaining values,
  successful retry, case-insensitive duplicate, admin list, export and client cutoff.
- Production-mode privacy verification passed: 26 intercepted browser Sentry envelopes,
  positive-control error received, private names/emails absent. Decompressed replay
  recording (101128 bytes) confirms blocked form/admin DOM and absence of all five
  synthetic markers. Server/edge local capture sink likewise contains no markers.
  No browser console errors. Nothing was sent to Yamaha or to a production database.

Local preview: http://localhost:3036/events/yasi-2026
All registrations in this preview are synthetic/local only. Yamaha receives no email.

## Follow-up: native Excel download (local only)

User requested direct `.xlsx` download for handing the attendee list to Yamaha.
Scope: reversible export-format addition within the existing authenticated export
route; no changes to auth, stored fields, migration, recipients or rollout. This
follow-up is standard risk because it preserves all privacy and access boundaries.
Primary admin action downloads Excel; existing CSV remains as a secondary option.
The workbook contains first name, last name, email and registration time (UTC), with
one header row, filter, frozen header and readable widths. All attendee-controlled
cells are explicit string values; no formulas, hyperlinks or macros are generated.
The same event selection, stable order, 10000-row cap, no-store headers, generic
errors and Sentry exclusions apply. The pure-JavaScript ExcelJS writer is imported
only for authenticated XLSX generation. Acceptance: download via admin page is a
valid readable XLSX, Unicode and exact names/emails preserved, typed UTC dates,
formula-like text remains literal; unauthenticated exports remain denied.

Verified: 10 unit/export tests pass; TypeScript and affected lint pass; production
build passes with existing warnings. Browser completed actual local admin login,
Registrations navigation and Excel button download; authenticated response has XLSX
MIME/filename and private/no-store + Vary Cookie, anonymous download denied, CSV still
works, unknown format returns400. Admin page has no overflow at320/390px. Independent
ZIP/XML inspection confirms native XLSX, preserved Georgian text, no formulas, macros
or external links. All tests used the disposable local database. Synthetic test row
removed after checking; preview remains running at localhost3036. No publication.

## Follow-up: larger poster and November22 cutoff (local only)

User requested a larger poster without white framing and closure on November22.
Source JPEG preserved byte-for-byte; CSS clips only its white print margins, widens
poster column and reduces inter-column gap. At1440px viewport actual visible poster
width increased from421.98px to645.33px (+53%). Desktop and390/320px mobile browser
checks pass without overflow or browser errors. Open/closed form copy and shared
backend/database deadline now use end of November22 New York (exclusive
2026-11-23T05:00:00Z). QR delivery notice remains the supplied MondayNovember23 text.
Eight affected tests, TypeScript, affected lint and diff check pass; read-only local
PostgreSQL probe verifies the exact new boundary in a non-UTC session. Local dev
preview remains on3036; no publishing, migration or production mutation performed.

## Production shipping candidate reviews

User subsequently authorized production deployment and runtime registration enablement.
Codex Extra High reviewed the decision-complete rollout supplement; accepted fixes:
privately verify host/database/role and concrete last-good deployment restore path
before mutation; verify anonymous/authenticated private HTML/CSV/XLSX headers before
activation; require an authorized successful HTTP-save observation before claiming
production persistence verified. No redesign or repeat pass required.

The final complete-branch Codex High integration review covered committed
78b2748718838b96ab25f74e004d8b0e20eb33be vs origin/main. One accepted P2: XML-invalid
Unicode noncharacters could corrupt the XLSX download. Fixed at
80e81a8ee8abc4cbd2a6215754f266cb734f1f95 with scalar validation and a validation-to-XLSX
regression preserving Georgian/emoji/XML-escaped text. Twelve affected tests,
TypeScript and affected lint pass. Full release build and full ESLint previously
passed on the candidate; final required preview/deployment build will verify exact
shipping head. Installed Gemini3.5FlashHigh remains unavailable, as recorded above;
configured Codex model was retained for read-only review fallback. No ordinary
review loop repeated. GitHub exact-head clearance and live rollout gates remain.
