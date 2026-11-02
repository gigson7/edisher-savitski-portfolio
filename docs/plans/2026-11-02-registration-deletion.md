# Admin registration deletion

Risk: critical (existing admin authorization, destructive data action, production rollout).
User confirmed their genuine public registration appears in the production admin list,
then requested a deletion control so their test entry can be removed before Excel export.
This confirms successful live intake by organizer observation; do not delete their row
on their behalf or broaden the prior PR4-only human review waiver to this change.

## Behavior and decisions

- User followup: remove only the redundant “· New York time” suffix next to the recital
  start time. Keep the actual 4:30 PM instant and registration cutoff behavior unchanged.

- Add a clearly labeled Delete button to each registration in the existing private list.
- Clicking opens an inline confirmation with a Cancel action and explicit permanent
  deletion warning: removed from the list and future Excel/CSV downloads. Existing files
  already downloaded are unaffected. No bulk deletion, outgoing messages, or schema changes.
- User must confirm the individual action. Pending state disables duplicate submissions;
  failure displays a generic accessible error and preserves the visible row. Success
  refreshes server list/count. Clamp the requested page to the last actual page so deleting
  its final row cannot strand the user on an empty page with an inconsistent page count.
- Permanently delete only by a strictly validated positive PostgreSQL Int ID AND the
  server-owned current concert slug. No client-controlled event slug or email lookup.
  Repeated/concurrent deletion of the same ID returns success (deleteMany, no P2025 error).
  Deletion does not lock out re-registration of that email before the cutoff.

## Implementation boundary

- Add DELETE /admin/registrations/[id] route (Node runtime), covered by existing admin
  middleware but with its own getSession authorization before DB access.
- Require exact canonical Origin (siteConfig.url; local server uses its own configured URL)
  as independent CSRF defense. No GET/POST deletion; Next returns405 for unsupported methods.
- Strict decimal ID1..2147483647 validation; reject junk, zero, negatives and overflow.
- Handler lives in a small dependency-injected library for auth/origin/validation/error
  tests, with route wiring only auth/canonicalOrigin and scoped DB store function.
- Auth denial401, bad origin403, invalid ID400, generic DB failure503, success200; every
  handler response uses existing private/no-store and Vary Cookie headers. No private
  row or database error payload. Framework middleware anonymous redirects also no-store
  via existing Next headers config. Existing private-path telemetry filters cover child
  routes; do not log request/row values or change telemetry policy.
- Add typed client button, use native same-origin fetch DELETE with no attendee data in
  request body, controlled inline confirmation and accessible pending/error state.
- Existing list, CSV, XLSX query the same live table, so hard-deleted rows disappear from
  all three without divergent filters/caches. No migration/dependency/native driver changes.

## Verification

- Unit tests: auth denial never mutates, foreign/missing Origin, all invalid ID classes,
  valid max/int and repeated deletion, generic failure and private response headers.
- Disposable loopback Postgres only: current event row deletes, other event row cannot
  be deleted, repeated delete succeeds, re-registration works, CSV/XLSX queried afterward
  omit deleted values. Preserve the existing test bridge's production guard.
- Actual local production-mode app: auth/method/origin checks, admin cancel keeps row,
  confirm removes only selected synthetic row/count, fresh CSV/XLSX exclude it; failure
  state, mobile layout and last page deletion. Use synthetic data in local DB only.
- Required unit/DB suite, TypeScript, lint, production build and diff check once final.
- One read-only local Codex Extra High package review before coding; one complete-branch
  integration review, preferring Gemini (configured Codex fallback only if unavailable).
  No extra loops for ordinary findings. Then exact-head GitHub Codex review for NEW PR.
  Prior PR4 waiver does not clear this PR; if quota blocks review, prepare concrete PR
  with all evidence and explain the need for a new human exception before merge.

## Production rollout

- Fresh isolated worktree from origin/main5882c784; preserve old SCRATCHPAD dirt.
- Before auto-deploying merge, read-only Hostinger target/current SHA/environment key
  metadata, healthy public form/admin and migration metadata. Runtime registration stays
  enabled as currently authorized; no rollout flag or unrelated settings change.
- Squash merge only after applicable gate passes, verify remote main and Hostinger actual
  completed deployment, live admin Delete/Cancel controls, anonymous access denial and
  origin/method failures. Do not test successful DELETE against production user's row;
  the user will perform the final permanent deletion themselves. Ask them to confirm
  list/export result afterward. Successful local deletion covers destructive behavior.
- Last-good release5882c784 can be redeployed via pinned rollback branch/Hostinger settings
  if needed; no schema changes and no recoverability claims for already deleted rows.
  Reverting code does not restore deletions. Update local scratchpad and append-only
  milestone memory after verified merge/deployment, with precise live verification limit.
