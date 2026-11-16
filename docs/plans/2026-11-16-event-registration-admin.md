# Configure registration for each performance

Base: origin/main 60e3b48, including admin performance links. Risk: critical because
an additive migration, public intake, authorization, personal data and concurrency are involved.

## Product behavior

- Admin creates a performance normally, then opens Edit Performance → Registration settings.
  Each existing performance can have one form; default is off. Set the last registration
  day (end of day, exclusive following midnight) and an explicit IANA venue time zone.
  Save enables/disables it and provides the public URL and the attendee-list link.
  The setting can be reopened or edited; it is independent of the performance date.
- Public page /events/register/<numeric performance ID> shows title, date and venue from
  the performance and reuses the name/surname/email form. The required consent describes
  use by the event organizers solely for registration/admission. Generic success confirms
  receipt; no QR code, confirmation email or other automatic messaging. No upload workflow.
- Active links are automatic on Events and on the corresponding home card when displayed.
  Preserve the external performance link even when registration is configured.
  Disabled or expired forms cannot accept submissions. Previously configured public links
  show unavailable/closed; unconfigured/invalid IDs return 404.
- Admin Registrations defaults to the existing YASI list and offers event selection,
  date/title, event-filtered Excel/CSV and single-row Delete with confirmation.
  Disabled/closed forms retain organizer access to earlier signups. Prior download files
  are unchanged. Protected performance deletion cannot remove a configured form or strand
  attendee data; leave the performance record and disable registration to stop intake.
- Keep legacy YASI poster, share, URL, consent, cutoff, API, CTA and existing attendee rows.
  Link the matching YASI edit page to the existing public/admin pages and reject creation
  of another form for that match. If a generic performance is later edited into the
  legacy identity, suppress its generic CTA/page/intake but retain its admin history.
  Admission also checks current performance identity under a shared lock (performance
  first, settings second). The legacy page keeps priority. Preserve old export URLs.

## Schema and server boundaries

- Add only performance_registration_forms table: integer PK/FK performance_id with
  ON DELETE RESTRICT, enabled bool, closes_on DATE, time_zone varchar, closes_at
  UTC timestamp. No backfill, existing attendee/limit tables unchanged, no dependency.
  SQL migration uses short statement/lock timeouts and transaction. Old application
  does not reference new table. Gate future forms with EVENT_REGISTRATION_ENABLED=true,
  separately from CONCERT_REGISTRATION_ENABLED. Default-off hides settings/new intake
  and links; admin legacy list should work before migration via flag-off reads.
- Stable server-derived attendee and rate-limit key performance-<id>; keep yasi-2026
  reserved. Strict positive int32 route/body selection. Unknown/repeated event params
  must not fall back to legacy when an explicit selection was supplied. Admin list,
  export and DELETE resolve configured event; filter by event slug and deletion ID.
  Legacy absent event selector maps to YASI for backward compatibility.
- Settings mutation uses existing authenticated Next Server Action, plus canonical
  Origin check. Validate strict ISO date by round trip; validate IANA name via Intl
  and require a matching pg_timezone_names entry. Persist date and absolute cutoff in
  a single SQL upsert computed with PostgreSQL time zone rules, converted to UTC.
  Use the first occurrence of repeated midnight and reject a skipped midnight. Validate YASI guard
  and performance existence in SQL with rechecked/locked performance row (shared row
  lock before upsert), so stale or deleted performance cannot attach a new form.
  Keep old deadline immutable as historical data only if needed; settings edits apply
  to new submissions. No personal data in settings.
- Public operation reuses canonical Origin, bounded JSON, field validation, honeypot,
  two deadline checks, and per-event atomic rate limiter. Enabled+cutoff are rechecked
  inside the insert statement: lock the eligible performance then settings FOR SHARE,
  then evaluate
  clock_timestamp() in UTC against cutoff while holding that lock. Settings updates serialize
  with save. Retry/concurrent submissions dedupe on (event_slug,email) without overwriting.
  Closing a form prevents saves that acquire lock afterward. Use fetch-only Prisma HTTP.
- Existing private/no-store and Sentry masking/drop rules extend to new public registration
  subtree, API descendants, settings/sessions and organizer routes. Only event metadata
  and ID rendered publicly. No private values in logs/errors; existing export XLSX safety.
- Bulk read enabled forms by performance result set, with no per-card DB calls. A settings
  load failure removes generic CTAs, so unrelated event details remain available.

## Verification and rollout

- Review this package once with local Codex Extra High before coding; one complete
  integration review after testing. Cover auth, canonical Origin, event scope, bad
  timezone/dates/IDs, DST, concurrency (disable/save, cutoff during row lock, duplicate),
  per-event rate-limit/list/export/delete isolation, legacy-match edit and stale saves,
  production-mode private Sentry paths, closed/disabled/missing UI, migration
  against disposable PG with old seed rows, and legacy YASI contract. Run tests/lint/tsc/build.
- Deliver local walkthrough on isolated worktree and disposable database. No production
  migration or runtime activation implicit in implementation. For a future authorized
  rollout verify actual Hostinger revision and Neon identity/schema/backups, apply only
  additive migration, gate GitHub PR on current written review (new explicit owner waiver
  if needed), deploy off, verify auth/legacy/health, then enable and observe requested
  real event flow with user. Flag off then pinned last-good redeploy for rollback; retain
  all settings and attendee records. Previously authorized PR4/5 exceptions do not apply.
