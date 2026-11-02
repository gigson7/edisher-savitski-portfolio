# Authorized production rollout — YASI registration

User explicitly requested production publication and registration enablement on
November 2, after approving the local page, XLSX export, larger frameless poster
and revised closure at end of November22 New York (2026-11-23T05:00:00Z exclusive).
The existing Nov24 YASI Solo Recital card must link to the new detail page using
“Register to attend” on home and Events; after closure use “View recital details”.

Risk: critical (production rollout/additive migration/collected personal data).
This supplements the already-reviewed feature design; auth/collection/CSV boundaries
are unchanged. Newly added scope since the preview review: native XLSX export,
exact card matching and this production rollout. Existing original checkout is
preserved; feature worktree is the only source for the release.

## Fresh read-only preflight evidence

- Fresh origin/main and feature base: a0834354e3397164dae08ee56162e27c64d76387.
- Public domain returns Hostinger/hcdn headers. Existing project notes say GitHub
  main auto-deploys; user confirms automatic deployment. Historical GitHub deployment
  records also contain a Vercel integration; those records alone are not proof of
  the real custom-domain target. Verify Hostinger domain/app identity in its panel.
- Primary checkout .env.local identifies the existing Neon production database;
  credentials and exact endpoint are retained only in ignored/local preflight data.
  Live bounded read-only query succeeded: PostgreSQL17.11, timezoneGMT, one finished
  20260408090535_init migration, no registration tables. Exact public event verified
  in that database: id133, Solo Recital, 2026-11-24, venueYASI, locationNew York.
- Credentials remain in existing ignored local environment; never copy/commit/print
  their values. Local tests continue to use disposable loopback PostgreSQL only.
- No branch protection or rulesets require CI (gh ruleset check:0 rules; legacy
  branch protection404). Still require green applicable deployment checks and exact
  written current-head GitHub Codex clearance before merge.
- Hostinger existing login requests email verification; user is completing it.
  Do not send email, change credentials, create accounts or broader permissions.

## Ordered gates

1. Finish complete branch verification and read-only review. Keep runtime registration
   default false. Commit explicit intended paths, excluding local SCRATCHPAD bookkeeping.
2. Push feature/PR and request @codex review immediately. Inspect paginated formal
   reviews, comments and threads with the live head on every cycle. Fix accepted
   findings narrowly, verify and re-request; no ordinary local-review repeat.
3. Before production mutation, verify Hostinger's application is edishersavitski.com,
   linked repository is this repo/main, privately compare environment database host,
   database name and role with the read-only verified target, and confirm no registration
   flag is already enabled. Record the last-good Hostinger revision and the observed,
   usable restore/redeploy mechanism before any migration or auto-deploying merge.
   Do not infer target or rollback capability from old notes.
4. Migration is additive: only two new tables/indexes; no existing table/data change,
   no reseed. Existing public/admin system remains compatible before/after it.
   Save secret-free preflight/migration-state/schema metadata locally as recovery
   evidence. No existing data is altered, so rollback preserves new tables and data;
   no destructive schema rollback or full-db restore is needed for this migration.
5. Once review clearance is obtained and target metadata agrees, apply only committed
   pending migrations via Prisma migrate deploy, with production DATABASE_URL passed
   privately through process environment from existing ignored credentials. Never run
   migrate dev/reset/db push. Use a short lock/statement timeout where supported;
   inspect migration state and stop on errors instead of retrying blindly.
6. Squash merge at the gated head. Observe the actual Hostinger automatic deployment,
   build version/commit and public health. Before enablement, new page renders details
   but POST fails503 with no success claim. While the flag is still false, verify
   anonymous admin HTML/CSV/XLSX denial, authenticated HTML/CSV/XLSX access and actual
   private/no-store response headers. Confirm deployment identity, not merely presence
   of a historical Vercel GitHub status. Any privacy/access failure blocks activation.
7. Enable CONCERT_REGISTRATION_ENABLED=true in Hostinger's runtime environment and
   apply its documented restart/redeploy mechanism. User explicitly authorized this
   activation. Preserve all unrelated environment keys and never expose their values.
8. Verify public home/events exact YASI card CTA and navigation, larger poster and
   Nov22 deadline; live intake rejects invalid body/origin without writes, fresh DB
   metadata confirms readiness, existing admin session can see/download empty/real
   list privately. Existing test-only account is local only; never seed it in prod.
   Successful public HTTP storage must be observed through either an explicitly
   authorized synthetic registration with narrowly authorized cleanup, or an
   organizer-approved genuine registration. Confirm durable row, duplicate response,
   admin list and Excel/CSV export. A rolled-back SQL probe or invalid request does
   not prove this boundary. Until observed, report live successful intake as unverified.
   Do not automatically send collected data or a file to Yamaha.
9. Observe health for a bounded interval after activation. If intake/storage fails,
   turn runtime flag false immediately and report the precise failed boundary.
   For broad regression, revert to the verified preceding Hostinger deployment.
   Keep registration tables/data and do not reset/reseed or delete attendee data.
10. Verify remote merged SHA, actual deployed revision, migration finish and active
    form state separately. Update local scratchpad. Durable memory only via approved
    append-only notes if authorized by the user's standing merge-closeout instruction.

## Verification/operational acceptance

Local evidence already includes full production builds, TypeScript/lint, eleven
unit/export checks, real Neon HTTP adapter with disposable PG, concurrent dedupe and
atomic limiter, non-UTC cutoff, desktop/320/390px measurements, actual local login
and CSV/XLSX browser downloads, decoded intercepted production-mode replay privacy
checks and server/edge filtering. Final candidate adds a card CTA regression and
reruns affected browser flow plus one final required full build. No paid service,
new scheduler, worker or outgoing mail is introduced. Runtime DB driver stays
fetch-only; ExcelJS stays server-only and lazy after authenticated authorization.

Unresolved external gate: user completing Hostinger verification; until account,
domain, repo and environment metadata are visible, no production mutation or
automatic-main merge (which itself deploys) is permitted.
