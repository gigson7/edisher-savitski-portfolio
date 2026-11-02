# Concert registration checks

Unit checks: `npx tsx --test tests/concert-registration.test.ts`.
Type check: `npx tsc --noEmit`. Lint: `npm run lint`. Build: `npm run build`.

Database checks require a **disposable local** PostgreSQL database named `concert_test`.
Apply migrations only to that database; never copy the primary checkout's environment.
The included bridge refuses any database outside loopback or with another name.

1. Start a local PostgreSQL cluster (verified with PostgreSQL 17 on port 55436).
2. Set `DATABASE_URL=postgresql://concert_test@127.0.0.1:55436/concert_test` and run
   `npx prisma migrate deploy` then `npx prisma generate` in this checkout.
3. Start the HTTP bridge in a retained terminal:

   ```sh
   CONCERT_TEST_DATABASE_URL=postgresql://concert_test@127.0.0.1:55436/concert_test \
     node tests/support/neon-postgres-bridge.mjs
   ```

4. Run the actual HTTP-driver integration checks:

   ```sh
   DATABASE_URL=postgresql://concert_test:local-only@concert-test.invalid/concert_test \
   CONCERT_DATABASE_TEST=true \
   NODE_OPTIONS='--require ./tests/support/local-network.cjs' \
     npx tsx --test tests/*.test.ts
   ```

For the local preview use the same fake HTTP database URL and preload, plus
`NEXT_PUBLIC_SITE_URL=http://localhost:3036`, `CONCERT_REGISTRATION_ENABLED=true` and
a **local-only** JWT_SECRET. Run `npm run dev -- --port 3036` or build/start with the
same settings. The bridge defaults to Asia/Tbilisi DB sessions to exercise timezone
independence. Only the test helper uses the TCP `pg` dev dependency; application
code continues to use the existing fetch-only PrismaNeonHttp adapter.

The network preload redirects fake Neon hosts and Sentry ingestion to the local bridge.
Never preload it in a real deployment. Browser privacy checks must also intercept
`/monitoring` and direct Sentry ingestion; use synthetic data only and inspect decoded
replay recordings as well as uncompressed error/transaction envelopes.
