# Edisher Savitski Portfolio — Scratchpad

**Last updated:** 2026-04-08
**Status:** ✅ Live in production with admin dashboard

## What's done

### Public site
- Homepage, About, Events, Media, Teaching, Contact pages
- Photo gallery with lightbox + responsive WebP sizes
- Static fallback to `/data/*.ts` files when DB is unreachable
- Sentry error tracking installed

### Admin dashboard
- Route groups: `(public)`, `(admin)`, `(admin-auth)`
- Single admin user, JWT cookie session, password reset via email token
- CRUD for performances (115 seeded), videos (9), photos (8), biography (Tiptap)
- Mobile-responsive: hamburger drawer, card list view replaces tables on mobile
- Live at: https://edishersavitski.com/admin/login

### Database — migrated to Neon Postgres
- **Was:** Hostinger MySQL via `@prisma/adapter-mariadb` → kept SIGKILL'ing the Node process at startup due to Hostinger nproc=120 limit (mariadb native driver spawns too many threads)
- **Now:** Neon Postgres via `@prisma/adapter-neon` (`PrismaNeonHttp`) — fetch-only, zero native threads
- Connection pooled URL with `sslmode=require`
- Photos still on Hostinger filesystem at `/public/images/gallery/`

### Hosting — Hostinger (NOT Vercel)
- Auto-deploys from GitHub `main` branch
- Env vars set in hPanel UI (SSH-deployed `.env` files get wiped on deploy)
- Build command: `prisma generate && next build`

## Critical context

**The nproc=120 trap:** Hostinger shared hosting uses CloudLinux LVE which kills the process if it spawns too many threads. The mariadb driver, sharp's native bindings, and Prisma binary engines all spawn worker threads. Process gets SIGKILL'd at OS level so Sentry can't even capture it. Never reintroduce a native-binding DB driver to this project. Sequential queries are safer than `Promise.all`.

**Lazy Prisma proxy:** `lib/prisma.ts` exports a `Proxy` that creates the client on first property access — never at module-eval time. This prevents the adapter from initializing before request handling starts.

## Recent commits
- `20ac23e` Make admin panel mobile-friendly (hamburger drawer, card list, stacked headers, responsive forms)
- `81427b2` Migrate database from Hostinger MySQL to Neon Postgres (HTTP driver)
- `ee85064` Add Sentry error tracking
- `0825a8e` Cache prisma client globally + sequential queries for thread safety

## Open / Possible next steps
- Test password reset email flow end-to-end (needs SMTP configured on Hostinger)
- Verify photo upload on mobile (layout was adjusted but not stress-tested)
- Optional: custom favicon for admin tabs, analytics, custom domain refinements
