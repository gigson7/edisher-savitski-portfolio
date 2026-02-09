# Dr. Edisher Savitski Portfolio - Claude Memory

## Project Overview
Professional portfolio website for Dr. Edisher Savitski, an award-winning concert pianist, Associate Professor at University of Alabama, and Artistic Director of Toradze International Music Festival.

**Live Site:** https://edisher-savitski-portfolio.vercel.app
**Repository:** https://github.com/gigson7/edisher-savitski-portfolio
**Hosting:** Vercel (automatic deployments from main branch)

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

**First 3 Images (Portrait Orientation):**
- Files: `DSCF5956`, `DSCF6301`, `DSCF6347`
- Rotated 180° from original (using `sips -r 90` twice)
- Special positioning: `objectPosition: "center center"`
- Dimensions: 800x1200 (portrait)

**Lightbox:**
- Full-screen image viewing
- Keyboard navigation
- Touch/swipe support on mobile
- Implemented on both homepage and media page

### 2. Hero Section
**Location:** `/components/home/HeroSection.tsx`

**Current Content:**
- Title: "Concert Pianist • Associate Professor • Artistic Director" (gold, 2xl-3xl)
- Buttons: "View Upcoming Events" and "Watch Performances"
- Image: Centered, responsive width (85% mobile, 80% tablet, 70% desktop)
- Gradient overlay for text readability
- Padding: 30px top spacing for content

**Image Specifications:**
- Source: `/images/hero/hero-main.webp`
- Object position: `center 5%`
- Gradient: `from-black/50 via-black/30 to-black/50`

### 3. About Section (QuickBio)
**Location:** `/components/home/QuickBio.tsx`

**Content Highlights:**
- Opening paragraph: {biography.shortBio}
- Second paragraph: Starts with prestigious venues mention
  - "Award-winning pianist performing at prestigious venues worldwide including Carnegie Hall, Wigmore Hall, and Teatro alla Scala..."
- Highlights grid: Yamaha Artist, Award Winner, Professor, Artistic Director

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
- Social media links (YouTube, Facebook, Instagram, LinkedIn)
- Copyright notice

## Environment Variables

### Vercel Production
```
NEXT_PUBLIC_SITE_URL=https://edisher-savitski-portfolio.vercel.app
NEXT_PUBLIC_FORMSPREE_ENDPOINT=[formspree_endpoint_if_used]
```

### Local Development
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Build & Deployment

### Local Development
```bash
npm run dev          # Start dev server (usually port 3000, may use 3001 if 3000 busy)
npm run build        # Production build
npm start            # Run production build
```

### Build Configuration
- **Webpack:** Used instead of Turbopack (turbo: undefined in next.config.ts)
- **Reason:** Next.js 16.x has Turbopack bugs, using stable 15.5.12
- **Build output:** All pages static (SSG)

### Deployment Workflow
1. Push to `main` branch on GitHub
2. Vercel automatically detects push
3. Runs `npm run build`
4. Deploys to production (~2-3 minutes)
5. Live at: https://edisher-savitski-portfolio.vercel.app

### Vercel Settings
- **Framework:** Next.js (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node Version:** Latest stable
- **Auto-deployments:** Enabled for main branch

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
- Use `objectPosition: "center center"` for proper display
- Images 4-5 ensure Edisher's face is centered (not cropped at top)

### Hero Section
- Text positioned with 30px top padding
- Content is vertically centered with `items-center`
- Image uses responsive width percentages
- Gradient overlay maintains text readability

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

---

**Last Updated:** February 9, 2026
**Version:** 1.0.0
**Maintainer:** Dr. Edisher Savitski with Claude Sonnet 4.5
