# Registration deletion review evidence

Risk: critical (admin authorization, permanent deletion, production rollout).

- Design package reviewed read-only by configured Codex Extra High reviewer at base
  `5882c784b65e5c34f0ce9ab1800429649ef0fae7`, plan SHA256
  `185ac825d69d5b9214e8d898e9ecd84f3b9fd4302a9427e12cb30321a0536d04`.
  Verdict: no serious issues or required design changes. No files mutated.
- Local CLI attempt failed before review because configured gpt-6.1-sol is unsupported
  by that CLI account; existing configured-model reviewer performed the required review.
- Subsequent user copy-only addition removes start-time suffix “· New York time”; no
  behavioral/design change and no additional local artifact review.

| # | Reviewer | Severity | Finding | Decision | Reasoning |
|---|---|---|---|---|---|
| 1 | Codex design | None | No serious issues | Accept | Auth, Origin, scoped/idempotent deletion, confirmation, exports, local tests and rollout gates are covered. |

- Gemini 3.5 Flash High frozen-diff helper was attempted for this scope and failed
  before review because that configured model is unavailable. No model override made.
- Configured Codex complete-branch integration fallback reviewed behavioral head
  `7285273500f0af7a5b6d9a8d20963a999e547a3b` vs `5882c784`: no actionable findings.
  Read-only review; no production access or file mutations.
- Sixteen unit/actual disposable PostgreSQL tests pass, including scoped/repeated deletion,
  re-registration and Excel/CSV exclusion. TypeScript and lint pass (8 existing warnings).
- Final production build passes after user start-time copy request. Actual local HTTP
  checks: anonymous307, foreign/missing Origin403, invalid ID400, GET/POST405, private
  no-store responses; none deleted data.
- Actual local browser: Delete/Cancel preserves row and restores focus; Cancel initially
  focused; session-expiry shows generic inline error and preserves row; re-login and
  confirmed deletion refreshes count/list. Fresh actual XLSX parsed and CSV verified:
  selected deleted email absent, other row preserved. Last-page final row deletion
  clamps to Page1of1. All successful deletions used local disposable synthetic fixtures.
- Browser helper canceled the local HTTP download; authenticated export HTTP body was
  downloaded/parsed instead. Do not claim a successful new browser file transfer.
- Browser viewport override had no effect (actual innerWidth remained1470); no new
  mobile-size acceptance claim. Existing stacked row CSS retained, 44px buttons added.

Final PR head and CI/remote review evidence are recorded in the PR body.
Prior PR4 human waiver does not apply to this new PR.
