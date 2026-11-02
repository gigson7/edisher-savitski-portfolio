# YASI recital registration — design and implementation

Risk: critical (personal data collection, additive migration, protected export).
Base: freshly fetched origin/main a0834354e3397164dae08ee56162e27c64d76387.
Initial scope was local preview in an isolated worktree. User has now explicitly
authorized production publication and enablement; ordered gates are recorded in
2026-11-02-concert-rollout.md. No outgoing email or automatic Yamaha handoff.

## Product and acceptance

- Add `/events/yasi-2026` in the existing English public layout and gold/serif style.
- Source: supplied Adobe poster, original image preserved. Edisher Savitski Piano
  Recital, Yamaha Artist Services (YASI), New York, Tuesday November 24, 2026,
  4:30 PM America/New_York; 689 5th Ave. #3, entrance on 54th St.
- Include the poster's celebration of University of Alabama Million Dollar Band's
  performance at Macy's Parade. No invented repertoire, capacity, or ticket price.
- Collect first name, last name and email. Explicit required consent to collect and
  share these fields with Yamaha solely for concert admission. No marketing opt-in.
- Preserve exactly: “To enter the venue, guests will receive a QR code via email,
  on Monday, November 23.” State that Yamaha sends it. No QR generation or mail.
- User revised closure to the end of Nov 22 in New York: exclusive cutoff
  `2026-11-23T05:00:00.000Z`, checked server-side on every submission.
- Success only after durable save; same response for a duplicate event/email;
  original names retained. Show pending, validation, failure, closed, and success.
- Link a small recital announcement on home and events while registration is open;
  retain the direct detail page afterward with closed state. Add canonical/OG/sitemap.

## Architecture and data

- Runtime `CONCERT_REGISTRATION_ENABLED === "true"`; off by default, independent
  of compilation. Disabled page explains unavailable; endpoint returns 503. Never
  imply a successful registration when disabled or storage fails. No localStorage.
- Add Prisma ConcertRegistration (id, eventSlug, firstName varchar100, lastName
  varchar100, email varchar254, consentVersion, createdAt). Unique(eventSlug,email),
  index(eventSlug,createdAt,id). Normalize trimmed email to lowercase; trim names,
  allow international names, reject control characters. Consent fixed version v1.
- Add ConcertRegistrationLimit (key primary key, attempts int, expiresAt timestamp).
  One non-personal global bucket per event. Atomic INSERT ON CONFLICT increments
  attempts/reset after 15 minutes; maximum 300 valid attempts per window. This bounds
  writes across workers/restarts without storing IPs or adding a service/secret.
  Rejected requests can increase the same integer but create no extra bucket rows.
  Honest tradeoff: concert-wide abuse can temporarily rate-limit legitimate guests;
  no claim that this is CAPTCHA or comprehensive DDoS protection.
- Use existing lazy PrismaNeonHttp, sequential calls, parameterized raw limiter SQL;
  insert via createMany(skipDuplicates). No native dependencies or new paid calls.
- POST `/api/concert-registration`: JSON only; streaming UTF-8 body cap 4096 bytes
  (do not trust Content-Length), origin required and allow only actual configured
  site URL or same-origin request URL; deployment must verify proxy Host integrity.
  Reject cross-site, malformed/non-object JSON, unknown field types, overlong or
  malformed values, missing consent; honeypot website field rejects with 400.
  Client sends only fields, consent and honeypot, no event identity supplied by guest.
  Do cutoff/flag/body/validation before touching storage. Recheck cutoff immediately
  before insert to avoid requests that waited across closure. All response bodies
  generic and no-store. Limit response 429 + Retry-After; storage error 503.
- Do not log request bodies, names, email, database exceptions, or export content.
  Drop new intake and registration admin paths from Sentry errors and traces;
  block the entire server-rendered form and admin data boundary with sentry-block,
  explicitly mask inputs/text and disable network body capture in replay. Drop
  private-route breadcrumbs as well. Replay itself may mount, but must not expose
  names/emails, including client navigation into and away from protected content.

## Administrator access and export

- Add `/admin/registrations`, shared admin nav item; explicit getSession in page
  and export route in addition to existing middleware. No change to login/JWT logic.
- List latest 50 records per page, stable createdAt/id descending; sequential count
  and rows. Errors display unavailable instead of a misleading empty success.
- GET `/admin/registrations/export`: reauthenticate every request; fixed event,
  complete CSV up to 10000 rows, reject oversized exports rather than truncate.
  One query snapshot, chronological/id ascending. Columns first name, last name,
  email, registered-at UTC. UTF-8 BOM, RFC quoting, neutralize spreadsheet formulas
  (including leading whitespace and =,+,-,@, tabs, CR/LF). No automated sharing.
- Explicit private/no-store and Vary Cookie for admin registration HTML/CSV and
  intake route, including framework header overrides after existing public CDN rule.
- Existing admin is the only reader; no public list/count/download endpoint.

## Verification and rollout

- Before coding: one local Codex Extra High read-only design review, as requested
  by the user's risk policy; record checksum and disposition separately. The user's
  review budget overrides the installed review-pre skill's two-model default.
- Tests: real disposable local Postgres, production PrismaNeonHttp through an
  HTTP test bridge; apply existing migration plus additive migration only locally.
  Test durable inserts, case-insensitive duplicate/concurrency, atomic limiter
  bounds/reset, invalid/body/origin/flag/cutoff/storage failure paths, private export
  unauthenticated denial and CSV escaping; use synthetic names/emails only.
- Browser: desktop and 390px/320px layout measurements and screenshots; submit
  valid/invalid/duplicate, preserve inputs on failure, closed state, keyboard labels.
- Force dynamic/no-store for the recital page and its runtime flag/cutoff state.
  Existing home/events already force dynamic; apply private/no-store overrides to
  the recital and announcements' host pages so CDN caching cannot retain open state.
  Intake remains authoritative on flag/cutoff; a client timer closes an already open
  form at cutoff. API returns closed even if browser clock or HTML is stale.
- Production-mode local test intercepts Sentry envelope transport (never upload
  synthetic personal data) and confirms excluded errors/traces/breadcrumbs, blocked
  form/admin DOM, no request bodies, and client-navigation masking. Unit-check shared
  telemetry filtering. Development mode alone is insufficient since Sentry is off.
- Run diff check, affected ESLint, TypeScript, production build. No production URL
  or credentials in test environment. One complete-branch integration review using
  Gemini per user policy; fix valid findings and rerun affected checks.
- No migration/flag change on production without separate rollout authorization.
  Future rollout: verify live Hostinger deployment target, trusted Origin/Host behavior,
  DB identity/current migrations and backup readiness; apply additive migration with
  flag off, deploy reviewed code, verify authenticated no-cache exports and health,
  enable runtime flag deliberately, synthetic canary only when explicitly authorized.
  Rollback disables flag first then rolls back code; keep tables/collected data.
  Never drop tables as rollback. No existing table changes or reseeding.
- Registration data retained through organizer/Yamaha handoff; organizer chooses
  deletion date after event. No automatic deletion or additional data reuse.
- Final handoff records implemented vs locally tested vs production-off accurately.
