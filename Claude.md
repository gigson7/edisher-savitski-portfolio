# Dr. Edisher Savitski Portfolio - Claude Memory

## Project Overview
Professional portfolio website for Dr. Edisher Savitski, an award-winning concert pianist, Associate Professor at University of Alabama, and Artistic Director of Toradze International Music Festival.

**Live Site:** https://edishersavitski.com
**Repository:** https://github.com/gigson7/edisher-savitski-portfolio
**Hosting:** Hostinger shared (Node.js) — auto-deploys from GitHub `main`. **NOT Vercel.**
**Database:** Neon Postgres (migrated from Hostinger MySQL — see "Critical: Hostinger nproc Trap" below)

## Tech Stack
- **Framework:** Next.js 15.5.12 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom components in `/components`
- **Icons:** Lucide React
- **Image Optimization:** Sharp, WebP format
- **Lightbox:** yet-another-react-lightbox
- **Deployment:** Vercel with automatic GitHub deployments

## Project Structure
```
/app
  ├── favicon.ico          # Piano keys favicon (multi-resolution)
  ├── icon.svg             # Scalable SVG favicon
  ├── icon.png             # 32x32 PNG favicon
  ├── apple-icon.png       # 180x180 Apple touch icon
  ├── layout.tsx           # Root layout with JSON-LD schemas
  ├── page.tsx             # Homepage
  ├── about/               # About page
  ├── contact/             # Contact page with form
  ├── events/              # Events/performances page
  ├── media/               # Media gallery (photos & videos)
  ├── teaching/            # Teaching information
  ├── robots.ts            # SEO robots configuration
  └── sitemap.ts           # Dynamic sitemap generation

/components
  ├── home/                # Homepage-specific components
  ├── layout/              # Header, Footer, Navigation
  ├── media/               # PhotoGallery, VideoGallery, VideoEmbed
  ├── ui/                  # Reusable UI components (Button, Card, etc.)
  └── [feature]/           # Feature-specific components

/data
  ├── site-config.ts       # Site-wide configuration
  ├── biography.ts         # Biography content
  ├── performances.ts      # Events/performances data
  └── videos.ts            # Video gallery data

/lib
  ├── schema.ts            # JSON-LD schema generators
  └── utils.ts             # Utility functions (cn, etc.)

/public
  └── images/
      ├── hero/            # Hero section images
      ├── gallery/         # Photo gallery (multiple sizes, WebP)
      └── og-image.jpg     # Social media share image (1200x630)
```

## Design System

### Brand Colors
- **Primary Gold:** `#8d7336` - Used for header text, accents, borders
- **Gold Variants:**
  - `text-gold-200` - Light gold for hero text
  - `text-gold-300` - Medium gold
  - `text-gold-600` - Primary gold
- **Neutral Palette:** Standard neutral grays
- **Background:** White (`bg-neutral-50` for header)

### Typography
- **Font:** Cormorant Garamond (serif, weights: 300-700)
- **Header Title:** 2xl, bold, gold color (#8d7336)
- **Hero Text:** 2xl-3xl, light, gold-200
- **Body:** Standard neutral colors, relaxed leading

### Layout Specifications
- **Header:** Sticky, 80px height (h-20), gold logo text
- **Hero Section:** 650px mobile, 750px desktop
- **Hero Content Padding:** 30px from top (pt-[30px])
- **Container Max Width:** 1400px
- **Section Padding:** Responsive (px-6 sm:px-8 lg:px-12)

## Key Features & Implementations

### 1. Photo Gallery
**Location:** `/components/media/PhotoGallery.tsx`, `/app/media/page.tsx`

**Image Optimization:**
- Multiple sizes: thumbnail (300px), medium (600px), large (1200px), xlarge (1800px)
- Format: WebP with JPG fallbacks
- Lazy loading: First 3 images eager, rest lazy
- Responsive srcset for optimal loading

**Image Object Positioning (head/body cropping):**
- `DSCF5956`: `center 28%` (close-up portrait, face in upper-middle)
- `DSCF6301`, `DSCF6347`, `edisher 123`, `edisher 124`: `center top` (show head fully)
- `edisher 127`: `center 80%` (body in lower portion of tall image)
- `edisher 130`, `edisher 132`: default (center center)

**First 3 Images (Portrait Orientation):**
- Files: `DSCF5956`, `DSCF6301`, `DSCF6347`
- Rotated 180° from original (using `sips -r 90` twice)
- Dimensions: 800x1200 (portrait)

**Lightbox:**
- Full-screen image viewing
- Keyboard navigation
- Touch/swipe support on mobile
- Implemented on both homepage and media page

### 2. Hero Section
**Location:** `/components/home/HeroSection.tsx`

**Current Content:**
- Title: "Pianist • Associate Professor • Artistic Director" (gold, 2xl-3xl)
- Buttons: "View Upcoming Events" and "Watch Performances"
- Desktop layout: Image on LEFT (35% width), text/buttons on RIGHT (right-aligned)
- Mobile/Tablet: Image centered (85%/80% width), buttons below hero in separate section
- Gradient overlay for text readability

**Image Specifications:**
- Source: `/images/hero/hero-main.webp`
- Object position: `center 5%`
- Gradient: `from-black/50 via-black/30 to-black/50`

### 3. About Section (QuickBio)
**Location:** `/components/home/QuickBio.tsx`

**Content Highlights:**
- Opening paragraph: {biography.shortBio}
- Second paragraph: Original bio text about master classes and broadcasts
- Highlights grid: Yamaha Artist, Award Winner, Professor, Artistic Director
- Inline links on specific words: "Yamaha" → yamaha.com, "University of Alabama" → piano.music.ua.edu, "Toradze" → toradze.org

### 4. Favicon
**Design:** Piano keys icon
- 3 white keys with 2 black keys
- Gold border (#8d7336)
- Dark background (#1a1a1a)
- Clean, geometric, minimalist

**Files:**
- `/app/icon.svg` - Scalable vector (512x512)
- `/app/icon.png` - Standard PNG (32x32)
- `/app/apple-icon.png` - Apple touch icon (180x180)
- `/app/favicon.ico` - Multi-resolution ICO (16x16, 32x32, 48x48)

### 5. SEO Implementation
**Metadata:**
- OpenGraph image: `/public/og-image.jpg` (1200x630)
- JSON-LD schemas: Person, Organization, WebSite
- Social links integrated
- Sitemap and robots.txt configured

**Important:**
- `NEXT_PUBLIC_SITE_URL` must be set in Vercel env vars
- Currently: `https://edisher-savitski-portfolio.vercel.app`

### 6. Navigation
**Pages:**
- Home (/)
- About (/about)
- Events (/events)
- Media (/media)
- Teaching (/teaching)
- Contact (/contact)

**Header:**
- Sticky positioning
- Mobile hamburger menu
- Gold header text: "Dr. Edisher Savitski"
- Desktop: Horizontal nav
- Mobile: Full-screen overlay menu

### 7. Footer
**Content:**
- Brief description
- Email: contact@edishersavitski.com
- "Send a Message →" link to /contact page
- Social media links (YouTube, Instagram, Facebook) — LinkedIn removed
- Copyright notice

## Environment Variables

### Hostinger Production (set in hPanel UI → Node.js → Edit Application → Environment Variables)
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<64-char random string>
ADMIN_EMAIL=piano@edishersavitski.com
ADMIN_PASSWORD=<set in hPanel only>
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@edishersavitski.com
NEXT_PUBLIC_SITE_URL=https://edishersavitski.com
```

**Important:** Hostinger wipes SSH-deployed `.env` files on every deploy. Always set env vars through the hPanel UI, NOT by uploading files.

### Local Development
`.env.local` (gitignored) — same keys, with the same Neon DATABASE_URL for testing.

## Build & Deployment

### Local Development
```bash
npm run dev          # Start dev server (usually port 3000, may use 3001 if 3000 busy)
npm run build        # Production build (runs prisma generate first)
npm start            # Run production build
```

### Build Configuration
- **Build command:** `prisma generate && next build` (Prisma client is regenerated every build)
- **Webpack:** Used instead of Turbopack (`experimental.turbo: undefined` in next.config.ts) — Next.js 16.x Turbopack has dependency tracking bugs
- **Images:** `images: { unoptimized: true }` in next.config.ts — **DO NOT remove**, this stops sharp from spawning native threads (see nproc trap below)
- **Build output:** Mix of static (SSG) public pages + dynamic admin pages (`force-dynamic`)

### Deployment Workflow
1. Push to `main` branch on GitHub
2. Hostinger auto-deploys from GitHub via its Git integration
3. Build runs on Hostinger (~2-3 minutes)
4. Live at: https://edishersavitski.com

### Hostinger Settings
- **Application root:** project directory under home
- **Application URL:** edishersavitski.com
- **Node version:** 22.x (24.x also works; never below 20.x)
- **Startup file:** Next.js default (`server.js` from `next start`)
- **Auto-deploy:** Enabled from GitHub `main` branch

## Git Workflow
```bash
git add .
git commit -m "Description

Detailed changes...

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

**Commit Message Format:**
- Short title (50-70 chars)
- Blank line
- Detailed bullet points
- Co-authored credit for Claude

## Image Processing

### Server-Side Rotation
```bash
# Rotate 90° clockwise
sips -r 90 input.jpg --out output.jpg

# Rotate 90° counter-clockwise
sips -r -90 input.jpg --out output.jpg
```

### WebP Conversion
```bash
# Convert to WebP
cwebp -q 85 input.jpg -o output.webp
```

### Multiple Sizes
```bash
# Create thumbnail
sips -Z 300 input.jpg --out thumbnail.jpg

# Create medium
sips -Z 600 input.jpg --out medium.jpg

# Create large
sips -Z 1200 input.jpg --out large.jpg
```

## Known Issues & Solutions

### Issue: Turbopack Build Failures
**Solution:** Using Next.js 15.5.12 with Turbopack disabled
- Config: `experimental.turbo: undefined` in next.config.ts
- Reason: Next.js 16.x has Turbopack dependency tracking bugs

### Issue: OG Image Missing "h" in URL
**Solution:** Check Vercel environment variable `NEXT_PUBLIC_SITE_URL`
- Must be: `https://...` (not `ttps://...`)
- Edit in Vercel dashboard → Settings → Environment Variables

### Issue: Favicon Not Updating
**Solution:** Browser cache issue
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear browser cache
- Vercel deployment may take 2-3 minutes to propagate

## Important Notes

### Photo Gallery Images
- First 3 images are portrait orientation (800x1200)
- These were rotated 180° from original
- Each image has custom `objectPosition` to ensure head/body is visible in 4:3 preview crop
- See "Image Object Positioning" section above for per-image values

### Hero Section
- Desktop: Image LEFT (35%), text/buttons RIGHT (right-aligned, vertically centered)
- Mobile/Tablet: Image centered, buttons below hero
- Content is vertically centered with `items-center`
- Gradient overlay maintains text readability

### Contact Page
- Simplified to centered "Send a Message" form only (max-w-2xl)
- ContactInfo section (email, institution, location) removed
- Reduced top padding above form

### About Page Bio Text
- All biography text must come from the original source document (SavitskiBio.docx)
- Do NOT rewrite or summarize the original text — use it verbatim
- biography.ts sections should match the docx content exactly

### Social Links
- YouTube: https://www.youtube.com/@svetski
- Instagram: https://www.instagram.com/edishersavitski/
- Facebook: https://www.facebook.com/edisher

### SEO Metadata
- All pages have metadata exports
- Homepage has specific OpenGraph config
- JSON-LD schemas in root layout
- Social sharing tested with og-image.jpg

### Contact Form
- Uses react-hook-form
- Formspree endpoint (optional)
- Client-side validation
- Success/error states

## Content Guidelines

### Biographical Information
- Emphasize: Award-winning, prestigious venues (Carnegie Hall, Wigmore Hall, Teatro alla Scala)
- Roles: Concert Pianist, Associate Professor, Artistic Director
- Yamaha Artist status
- International performances (USA, Europe, China)
- TV and radio broadcasts

### Tone & Voice
- Professional, sophisticated
- Classical music aesthetic
- Authoritative but approachable
- Focus on accomplishments and artistry

## Performance Optimization
- Image lazy loading (first 3 eager, rest lazy)
- WebP format with JPG fallbacks
- Responsive images with srcset
- Static page generation (SSG)
- Optimized fonts with display: swap
- Sharp for image optimization

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Favicon support: ICO, PNG, SVG, Apple Touch Icon
- Lightbox: Touch/swipe on mobile

## Accessibility
- Semantic HTML
- Alt text on images
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on buttons/links

## Future Enhancements (Not Yet Implemented)
- Custom domain setup
- Google Analytics integration
- Newsletter signup
- Blog/news section
- Advanced contact form (if Formspree configured)
- Performance monitoring
- A/B testing

## Admin Dashboard

### Overview
Admin panel at `/admin/*` for managing all site content. Single admin user with email/password auth.

### Admin Routes
| Route | Purpose |
|-------|---------|
| `/admin/login` | Login page |
| `/admin/forgot-password` | Request password reset email |
| `/admin/reset-password?token=...` | Set new password |
| `/admin` | Dashboard home (overview cards) |
| `/admin/performances` | List, search, filter performances |
| `/admin/performances/new` | Create performance |
| `/admin/performances/[id]/edit` | Edit performance |
| `/admin/videos` | List, reorder videos |
| `/admin/videos/new` | Add video |
| `/admin/videos/[id]/edit` | Edit video |
| `/admin/photos` | Upload, manage, reorder photos |
| `/admin/biography` | Edit all biography content |

### Database
- **ORM:** Prisma 7 with `@prisma/adapter-neon` (`PrismaNeonHttp`)
- **Provider:** Neon Postgres (free tier, 0.5GB) — fetch-only HTTP driver, **zero native threads**
- **Tables:** admin_users, password_reset_tokens, performances, videos, photos, biography
- **Schema:** `prisma/schema.prisma` (provider = "postgresql")
- **Client singleton:** `lib/prisma.ts` — lazy `Proxy` so the client is created on first property access, never at import time
- **Generated client:** `lib/generated/prisma/`
- **Migrations:** `prisma/migrations/` — current init is `20260408090535_init` (Postgres)

### Auth System
- JWT sessions via HTTP-only cookie (`admin-session`, 7-day expiry)
- Rolling refresh in middleware (renews at 50% lifetime)
- Password hashing: bcryptjs (cost 12)
- Password reset: SHA-256 token hash, 1-hour expiry, single-use
- Middleware: `middleware.ts` protects all `/admin/*` except login/reset pages

### Route Groups
```
app/
  (public)/      ← public pages with Header/Footer layout
  (admin)/       ← protected admin pages with sidebar layout
  (admin-auth)/  ← auth pages (login/reset) with no layout chrome
```

### Mobile Responsiveness
- `AdminSidebar` is `hidden lg:flex` — desktop only
- `AdminMobileNav` (client component, in `AdminHeader`) renders a hamburger button + slide-in drawer with backdrop, body scroll lock, auto-close on route change
- Shared nav items live in `lib/admin-nav.ts` so both desktop sidebar and mobile drawer use the same source
- Page headers stack on mobile (`flex-col sm:flex-row`); action buttons are full-width on mobile
- Performances list renders as a tap-friendly card list below `lg`, full table at `lg+`
- Form cards use `p-4 sm:p-6 md:p-8`; form action buttons stack on mobile
- Biography sticky save bar uses `-mx-4 sm:-mx-6` to match the layout's `p-4 sm:p-6`

### Key Files
- `lib/auth.ts` — JWT, bcrypt, session, password reset
- `lib/data.ts` — Data access layer for public pages, with static fallback when DB is unreachable
- `lib/prisma.ts` — Lazy Prisma client singleton via Proxy (uses `PrismaNeonHttp`)
- `lib/admin-nav.ts` — Shared admin nav items
- `lib/image-processing.ts` — Sharp pipeline (4 WebP sizes) — runs only at upload time, not request time
- `middleware.ts` — Auth middleware with session refresh
- `prisma/seed.ts` — Reseeds static data into Neon
- `components/admin/AdminMobileNav.tsx` — Mobile hamburger drawer
- `components/admin/AdminSidebar.tsx` — Desktop sidebar (hidden on mobile)

### Commands
```bash
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Create + apply new migration locally to Neon
npx prisma migrate deploy    # Apply pending migrations (CI/production)
npx tsx prisma/seed.ts       # Seed Neon with static data (use `tsx` directly, not `prisma db seed`, to avoid env-var loading issues)
npx prisma studio            # Browse DB in browser
```

### Admin Credentials
Stored only in `.env.local` (gitignored) and in Hostinger env vars. **Never commit them.**

---

## Critical: Hostinger nproc=120 Trap

**This is the most important context for this project. Read this before touching any DB-related code.**

Hostinger shared hosting enforces nproc=120 (CloudLinux LVE). Any library that spawns native worker threads at module-eval or pool-creation time will SIGKILL the Node process at the OS level — Sentry can't capture it because no JS exception is thrown.

**What used to crash:**
- `mariadb` native driver (was `@prisma/adapter-mariadb`) → spawned worker threads on pool creation → SIGKILL
- `sharp` native bindings → had to disable Next.js image optimization
- Even `Promise.all` of multiple Prisma queries could push past the limit

**What works (and must stay this way):**
- **Database:** Neon Postgres via `@prisma/adapter-neon` → `PrismaNeonHttp(url, {})` — uses fetch() only, zero threads
  - **Do NOT** use `PrismaNeon` (without Http) — that one wraps a WebSocket Pool which still spawns workers
- **Prisma client:** lazy `Proxy` in `lib/prisma.ts` so nothing initializes at import time
- **Sharp:** `images: { unoptimized: true }` in `next.config.ts` — never remove this
- **Queries:** Sequential is safer than `Promise.all` on the dashboard
- **No new native-binding DB drivers, ever.** If you need a new data source, it must use HTTP/fetch.

If the production app crashes with no JS error in Sentry: suspect nproc/threads first.

---

**Last Updated:** April 8, 2026
**Version:** 3.0.0
**Maintainer:** Dr. Edisher Savitski with Claude
