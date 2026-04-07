# Admin Dashboard Design Spec

## Overview

Admin panel for Dr. Edisher Savitski's portfolio site, enabling a non-technical user to manage all site content — performances, videos, photos, and biography — through a browser-based dashboard.

**Stack:** Next.js 15 (App Router), Prisma, Hostinger MySQL, Tiptap rich text editor, Sharp image processing.

**Approach:** Integrated into the existing Next.js app as `/admin/*` routes. Single codebase, single deployment.

---

## 1. Authentication

- Single admin account, email/password, stored in the database
- Password hashed with bcrypt
- Session via HTTP-only cookie with signed JWT (7-day expiry, refreshed on activity)
- Middleware on all `/admin/*` routes checks for valid session
- Login page at `/admin/login`
- No registration page — admin account seeded via Prisma seed script

### Password Reset

- `/admin/forgot-password` — enter email, sends reset link via Nodemailer (SMTP already configured)
- Reset token stored in `password_reset_tokens` table (token_hash, admin_user_id, expires_at)
- Token valid for 1 hour, single-use
- `/admin/reset-password?token=xxx` — enter new password, token is consumed

---

## 2. Database Schema

ORM: Prisma with no-Rust driver-adapter mode (`engineType = "client"` + `@prisma/adapter-mariadb`) for Hostinger compatibility.

### Tables

**admin_users**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK |
| email | String (unique) | |
| password_hash | String | bcrypt |
| name | String | |
| created_at | DateTime | |
| updated_at | DateTime | |

**password_reset_tokens**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK |
| token_hash | String (unique) | SHA-256 of token |
| admin_user_id | Int | FK to admin_users |
| expires_at | DateTime | 1 hour from creation |
| used | Boolean | default false |
| created_at | DateTime | |

**performances**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK |
| title | String | |
| date | DateTime | |
| type | Enum (solo, chamber, orchestra, masterclass) | |
| venue | String | |
| location | String | |
| country | String | |
| organization | String? | optional |
| collaborators | JSON | string array |
| repertoire | JSON | string array |
| is_featured | Boolean | default false |
| created_at | DateTime | |
| updated_at | DateTime | |

Note: `is_past` computed dynamically from `date` (no stored flag).

**videos**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK |
| youtube_id | String | |
| title | String | |
| description | String? | optional |
| performance_date | String? | optional |
| venue | String? | optional |
| repertoire | JSON | string array |
| thumbnail_url | String? | optional custom thumbnail |
| is_featured | Boolean | default false |
| sort_order | Int | for drag-to-reorder |
| created_at | DateTime | |
| updated_at | DateTime | |

**photos**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK |
| filename | String | base name, files in /public/images/gallery/ |
| alt_text | String | |
| object_position | String | CSS object-position value |
| sort_order | Int | for drag-to-reorder |
| is_featured | Boolean | default false |
| created_at | DateTime | |
| updated_at | DateTime | |

**biography**
| Column | Type | Notes |
|--------|------|-------|
| id | Int (auto-increment) | PK, single row |
| short_bio | Text | plain text, used on homepage |
| full_bio | JSON | Tiptap JSON, used on About page |
| sections | JSON | array of {title, content (Tiptap JSON)} |
| highlights | JSON | string array |
| venues | JSON | {usa: [], europe: [], asia: [], other: []} |
| testimonials | JSON | array of {quote, author, source} |
| updated_at | DateTime | |

### Seed Script

Migrates all existing hardcoded data from `/data/performances.ts`, `/data/videos.ts`, `/data/biography.ts`, and photo data from `PhotoGallery.tsx` into the database. This preserves all current content.

---

## 3. Admin Dashboard Pages

### Layout

Sidebar navigation with gold accent (#8d7336) and Cormorant Garamond font, matching the portfolio's brand. Clean, functional forms and tables.

### Routes

| Page | Route | Functionality |
|------|-------|---------------|
| Login | `/admin/login` | Email/password form |
| Forgot Password | `/admin/forgot-password` | Email input, sends reset link |
| Reset Password | `/admin/reset-password` | New password form (from email link) |
| Dashboard Home | `/admin` | Overview cards — counts of events, videos, photos, last edit timestamp |
| Performances | `/admin/performances` | Table with search, year filter, type filter. Add/Edit/Delete |
| Performance Form | `/admin/performances/new`, `/admin/performances/edit/[id]` | All fields. Date picker, type dropdown, dynamic collaborators/repertoire lists |
| Videos | `/admin/videos` | Grid of video cards with thumbnails. Add/Edit/Delete. Drag to reorder |
| Video Form | `/admin/videos/new`, `/admin/videos/edit/[id]` | YouTube ID input with live preview, title, repertoire list |
| Photos | `/admin/photos` | Grid of photo thumbnails. Upload/Delete. Drag to reorder. Click to set alt text and object position |
| Biography | `/admin/biography` | Rich text editor for full bio. Plain text for short bio. Editable sections, highlights, venues, testimonials |

### UX Details

- Performances table: paginated, sortable by date, "Upcoming" / "Past" tabs
- Photo upload: drag-and-drop zone, auto-generates 4 sizes (300/600/1200/1800px WebP) using Sharp
- Video form: paste YouTube URL or ID, auto-extracts thumbnail
- All forms have save confirmation and unsaved changes warning

---

## 4. Architecture & Data Flow

### Request Flow

```
Browser -> /admin/* routes (middleware checks JWT cookie)
        -> Server Actions (form submissions, CRUD)
        -> Prisma -> Hostinger MySQL
        -> revalidatePath() on affected public pages
```

### Migration Path

- **Phase 1 (build & test):** Public site keeps reading from static TypeScript files. Admin panel writes to database only. Test locally before deploying to production.
- **Phase 2 (go live):** Public pages switch from importing `data/*.ts` to querying Prisma. Static files become the backup.

### Image Processing Pipeline

Upload -> Server Action -> Sharp generates 4 sizes (300/600/1200/1800px WebP) -> saves to `/public/images/gallery/` -> stores filename + metadata in database.

### Cache Revalidation

After any content edit, `revalidatePath()` is called on affected public pages so visitors see fresh content without a full redeploy.

### File Structure

```
/app/admin/
  ├── login/page.tsx
  ├── forgot-password/page.tsx
  ├── reset-password/page.tsx
  ├── layout.tsx              (sidebar + auth check)
  ├── page.tsx                (dashboard home)
  ├── performances/
  │   ├── page.tsx            (list/table)
  │   ├── new/page.tsx        (create form)
  │   └── edit/[id]/page.tsx  (edit form)
  ├── videos/
  │   ├── page.tsx            (grid)
  │   ├── new/page.tsx
  │   └── edit/[id]/page.tsx
  ├── photos/
  │   └── page.tsx            (grid + upload + inline edit)
  └── biography/
      └── page.tsx            (all bio editing)
/lib/
  ├── auth.ts                 (JWT, bcrypt, session utils)
  ├── prisma.ts               (Prisma client singleton)
  └── image-processing.ts     (Sharp resize pipeline)
/prisma/
  ├── schema.prisma
  └── seed.ts                 (migrate static data to DB)
```

---

## 5. Rich Text Editor (Biography)

### Editor: Tiptap (free, open-source)

**Enabled features:** Bold, italic, underline, headings (H2, H3), links, bullet lists, numbered lists, block quotes.

**Not needed:** Images in text, tables, code blocks, colors.

### Biography Edit Page Layout

- **Short Bio** — plain textarea (homepage QuickBio)
- **Full Bio** — Tiptap rich text editor (About page)
- **Sections** — list of cards (title + Tiptap content each), add/remove/reorder
- **Highlights** — simple text list, add/remove
- **Venues** — grouped by region (USA, Europe, Asia, Other), add/remove per group
- **Testimonials** — cards with quote, author, source fields, add/remove

### Storage

Tiptap content saved as JSON in the database. Rendered to HTML on the public site using Tiptap's `generateHTML()`.

---

## 6. Dependencies to Add

| Package | Purpose |
|---------|---------|
| `prisma` (dev) | ORM CLI and migrations |
| `@prisma/client` | Prisma runtime client |
| `@prisma/adapter-mariadb` | No-Rust driver adapter for MySQL |
| `bcryptjs` | Password hashing |
| `jose` | JWT signing/verification (edge-compatible) |
| `@tiptap/react` | Rich text editor |
| `@tiptap/starter-kit` | Tiptap base extensions |
| `@tiptap/extension-link` | Link support |
| `@tiptap/extension-underline` | Underline support |
| `@tiptap/html` | Server-side HTML generation from Tiptap JSON |

---

## 7. Non-Goals (Out of Scope)

- Multi-user roles/permissions
- Content versioning/history
- Media CDN (photos served from Hostinger filesystem)
- Analytics dashboard
- Bulk import/export
- Public user accounts
