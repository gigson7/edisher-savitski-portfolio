Read-only Codex Extra High design pass against 60e3b48. The CLI stopped before
review with configured model_not_found; the configured Codex reviewer performed
the pass. Accepted the legacy-identity race finding. The legacy match takes
precedence in UI and under the SQL admission lock, keeping historical admin access.
Added production-mode telemetry verification to the plan.

Complete integration pass (tracked and intended new files against 60e3b48) by
configured Codex after Gemini 3.5 Flash High was unavailable. Applied all findings:

- HTML form POST action keeps synthetic attendee values out of URLs before hydration.
- Closing time uses earliest repeated midnight and rejects skipped midnight. Store UTC
  to match the Prisma HTTP driver's timestamp handling; exercised in a non-UTC session.
- Open forms can appear in both Events lists when their configured cutoff is in the future.
- Generic Excel metadata uses a neutral title while preserving legacy metadata.

Final verification: 21 tests with real disposable Postgres, TypeScript, ESLint
(eight preexisting warnings), final production build, diff check, migration on
existing fixture rows and held database row-lock checks. Browser verified actual
login, enable, submission, attendee view, event switching, deletion cancellation,
disable and re-enable. HTTP verified scoped Excel/CSV, parsed workbook, privacy
headers, denial for unauthorized and cross-origin requests, legacy YASI form/share,
and home/Events links. Local production telemetry text capture contained no
synthetic attendee email; sampled compressed Replay payload review was not repeated.
