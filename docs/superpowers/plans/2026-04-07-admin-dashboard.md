# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin panel at `/admin/*` so Dr. Savitski can manage performances, videos, photos, and biography without touching code.

**Architecture:** Integrated into the existing Next.js 15 app as protected `/admin/*` routes. Prisma ORM talks to Hostinger MySQL. Server Actions handle all mutations. Tiptap provides rich text editing for biography. Sharp processes photo uploads into multiple sizes.

**Tech Stack:** Next.js 15 (App Router), Prisma (MySQL), bcryptjs, jose (JWT), Tiptap, Sharp, react-hook-form

**Spec:** `docs/superpowers/specs/2026-04-07-admin-dashboard-design.md`

---

### Task 1: Install Dependencies & Environment Setup

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Install production dependencies**

```bash
cd /Users/nutsaguntsadze/VibeCoding/Edisher/edisher-savitski-portfolio
npm install @prisma/client bcryptjs jose @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-underline @tiptap/html @tiptap/pm mysql2
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database (Hostinger MySQL)
DATABASE_URL="mysql://user:password@host:3306/database_name"

# Auth
JWT_SECRET="generate-a-random-64-char-string"
ADMIN_EMAIL="piano@edishersavitski.com"
ADMIN_PASSWORD="change-this-on-first-login"

# SMTP (already configured for contact form)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 4: Create `.env.local`** with actual local MySQL credentials

```env
DATABASE_URL="mysql://root:@localhost:3306/edisher_portfolio"
JWT_SECRET="dev-secret-change-in-production-must-be-at-least-32-chars-long"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin123"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 5: Add to `.gitignore`**

Append these lines to the existing `.gitignore`:

```
# Environment
.env.local
.env.production

# Prisma
prisma/migrations/
```

- [ ] **Step 6: Initialize Prisma**

```bash
npx prisma init --datasource-provider mysql
```

This creates `prisma/schema.prisma` and updates `.env` (we use `.env.local` instead).

- [ ] **Step 7: Verify setup**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore prisma/schema.prisma
git commit -m "chore: add Prisma, auth, and Tiptap dependencies"
```

---

### Task 2: Prisma Database Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Write the complete Prisma schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  resetTokens PasswordResetToken[]

  @@map("admin_users")
}

model PasswordResetToken {
  id          Int       @id @default(autoincrement())
  tokenHash   String    @unique @map("token_hash")
  adminUserId Int       @map("admin_user_id")
  adminUser   AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
  expiresAt   DateTime  @map("expires_at")
  used        Boolean   @default(false)
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("password_reset_tokens")
}

enum PerformanceType {
  solo
  chamber
  orchestra
  masterclass
}

model Performance {
  id            Int             @id @default(autoincrement())
  title         String
  date          DateTime
  type          PerformanceType
  venue         String
  location      String
  country       String
  organization  String?
  collaborators Json            @default("[]")
  repertoire    Json            @default("[]")
  isFeatured    Boolean         @default(false) @map("is_featured")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  @@map("performances")
}

model Video {
  id              Int      @id @default(autoincrement())
  youtubeId       String   @map("youtube_id")
  title           String
  description     String?  @db.Text
  performanceDate String?  @map("performance_date")
  venue           String?
  repertoire      Json     @default("[]")
  thumbnailUrl    String?  @map("thumbnail_url")
  isFeatured      Boolean  @default(false) @map("is_featured")
  sortOrder       Int      @default(0) @map("sort_order")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("videos")
}

model Photo {
  id             Int      @id @default(autoincrement())
  filename       String
  altText        String   @map("alt_text")
  objectPosition String   @default("center center") @map("object_position")
  sortOrder      Int      @default(0) @map("sort_order")
  isFeatured     Boolean  @default(false) @map("is_featured")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("photos")
}

model Biography {
  id           Int      @id @default(autoincrement())
  shortBio     String   @db.Text @map("short_bio")
  fullBio      Json     @map("full_bio")
  sections     Json     @default("[]")
  highlights   Json     @default("[]")
  venues       Json
  testimonials Json     @default("[]")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("biography")
}
```

- [ ] **Step 2: Generate Prisma client and push schema to local DB**

```bash
npx prisma db push
```

Expected: Schema synced to local MySQL database. Tables created.

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma Client generated successfully.

- [ ] **Step 4: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Verify Prisma connection**

```bash
npx prisma studio
```

Expected: Prisma Studio opens in browser showing all 6 tables (empty).

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts
git commit -m "feat: add Prisma schema for admin dashboard"
```

---

### Task 3: Seed Script — Migrate Existing Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed script)

- [ ] **Step 1: Add seed configuration to `package.json`**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Also add `tsx` as a dev dependency:

```bash
npm install -D tsx
```

- [ ] **Step 2: Write the seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, PerformanceType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Dr. Edisher Savitski",
    },
  });
  console.log(`Admin user created: ${adminEmail}`);

  // 2. Seed performances
  // Import from existing static data
  const { performances } = await import("../data/performances");

  let perfCount = 0;
  for (const perf of performances) {
    await prisma.performance.upsert({
      where: { id: parseInt(perf.id) || perfCount + 1 },
      update: {},
      create: {
        title: perf.title,
        date: new Date(perf.date),
        type: perf.type as PerformanceType,
        venue: perf.venue,
        location: perf.location,
        country: perf.country,
        organization: perf.organization || null,
        collaborators: perf.collaborators || [],
        repertoire: perf.repertoire || [],
        isFeatured: perf.isFeatured || false,
      },
    });
    perfCount++;
  }
  console.log(`Seeded ${perfCount} performances`);

  // 3. Seed videos
  const { videos } = await import("../data/videos");

  let videoCount = 0;
  for (const video of videos) {
    await prisma.video.upsert({
      where: { id: videoCount + 1 },
      update: {},
      create: {
        youtubeId: video.youtubeId,
        title: video.title,
        description: video.description || null,
        performanceDate: video.performanceDate || null,
        venue: video.venue || null,
        repertoire: video.repertoire || [],
        thumbnailUrl: video.thumbnail || null,
        isFeatured: video.featured || false,
        sortOrder: videoCount,
      },
    });
    videoCount++;
  }
  console.log(`Seeded ${videoCount} videos`);

  // 4. Seed photos (from hardcoded PhotoGallery data)
  const photos = [
    { filename: "DSCF5956", altText: "Dr. Savitski performing", objectPosition: "center 28%" },
    { filename: "DSCF6301", altText: "Dr. Savitski at the piano", objectPosition: "center top" },
    { filename: "DSCF6347", altText: "Dr. Savitski in concert", objectPosition: "center top" },
    { filename: "edisher 123", altText: "Dr. Savitski performing", objectPosition: "center top" },
    { filename: "edisher 124", altText: "Dr. Savitski at a venue", objectPosition: "center top" },
    { filename: "edisher 127", altText: "Dr. Savitski performing", objectPosition: "center 80%" },
    { filename: "edisher 130", altText: "Dr. Savitski in performance", objectPosition: "center center" },
    { filename: "edisher 132", altText: "Dr. Savitski at the piano", objectPosition: "center center" },
  ];

  for (let i = 0; i < photos.length; i++) {
    await prisma.photo.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        filename: photos[i].filename,
        altText: photos[i].altText,
        objectPosition: photos[i].objectPosition,
        sortOrder: i,
        isFeatured: false,
      },
    });
  }
  console.log(`Seeded ${photos.length} photos`);

  // 5. Seed biography
  const { biography } = await import("../data/biography");

  // Convert plain text fullBio to Tiptap JSON format
  const fullBioTiptap = {
    type: "doc",
    content: biography.fullBio.split("\n\n").map((paragraph: string) => ({
      type: "paragraph",
      content: [{ type: "text", text: paragraph }],
    })),
  };

  // Convert biography sections to Tiptap format
  const sectionsTiptap = biography.sections.map((section: { id: string; title: string; content: string; order: number }) => ({
    id: section.id,
    title: section.title,
    content: {
      type: "doc",
      content: section.content.split("\n\n").map((p: string) => ({
        type: "paragraph",
        content: [{ type: "text", text: p }],
      })),
    },
    order: section.order,
  }));

  await prisma.biography.upsert({
    where: { id: 1 },
    update: {},
    create: {
      shortBio: biography.shortBio,
      fullBio: fullBioTiptap,
      sections: sectionsTiptap,
      highlights: biography.highlights,
      venues: biography.venues,
      testimonials: biography.testimonials,
    },
  });
  console.log("Seeded biography");

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected: All data seeded successfully. Output shows counts for each table.

- [ ] **Step 4: Verify seeded data**

```bash
npx prisma studio
```

Expected: Prisma Studio shows populated tables — 400+ performances, 9 videos, 8 photos, 1 biography, 1 admin user.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add database seed script with existing content migration"
```

---

### Task 4: Authentication Utilities

**Files:**
- Create: `lib/auth.ts`

- [ ] **Step 1: Create auth utility module**

Create `lib/auth.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

const SESSION_COOKIE = "admin-session";
const JWT_EXPIRY = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

// --- Password utilities ---

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// --- JWT / Session ---

export async function createSession(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<{ userId: number; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return { userId: payload.userId as number, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// --- Login ---

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return { success: false, error: "Invalid email or password" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { success: false, error: "Invalid email or password" };

  await createSession(user.id, user.email);
  return { success: true };
}

// --- Password Reset ---

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return null; // Don't reveal if email exists

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      adminUserId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return { success: false, error: "Invalid or expired reset link" };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: resetToken.adminUserId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds (auth module is not imported anywhere yet, but syntax should be valid).

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add auth utilities (JWT, bcrypt, password reset)"
```

---

### Task 5: Auth Middleware

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create the middleware**

Create `middleware.ts` at the project root:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check session cookie
  const token = request.cookies.get("admin-session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, getJwtSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware for /admin/* routes"
```

---

### Task 6: Admin Layout & Dashboard Shell

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `components/admin/AdminSidebar.tsx`
- Create: `components/admin/AdminHeader.tsx`

- [ ] **Step 1: Create the admin sidebar**

Create `components/admin/AdminSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Video, Image, FileText, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/performances", label: "Performances", icon: Calendar },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/photos", label: "Photos", icon: Image },
  { href: "/admin/biography", label: "Biography", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-neutral-900 text-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-700">
        <h1 className="font-serif text-xl font-bold text-gold-500">Admin Panel</h1>
        <p className="text-sm text-neutral-400 mt-1">Edisher Savitski</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold-600/20 text-gold-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-700">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create the admin header**

Create `components/admin/AdminHeader.tsx`:

```tsx
import { getSession } from "@/lib/auth";

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">{session?.email}</span>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create the admin layout**

Create `app/admin/layout.tsx`:

```tsx
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin - Edisher Savitski",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the logout API route**

Create `app/api/admin/logout/route.ts`:

```typescript
import { destroySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
```

- [ ] **Step 5: Create the dashboard home page**

Create `app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { Calendar, Video, Image, FileText } from "lucide-react";

async function getStats() {
  const [performanceCount, videoCount, photoCount, biography] = await Promise.all([
    prisma.performance.count(),
    prisma.video.count(),
    prisma.photo.count(),
    prisma.biography.findFirst({ select: { updatedAt: true } }),
  ]);

  const upcomingCount = await prisma.performance.count({
    where: { date: { gte: new Date() } },
  });

  return { performanceCount, upcomingCount, videoCount, photoCount, lastBioUpdate: biography?.updatedAt };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Performances",
      value: stats.performanceCount,
      sub: `${stats.upcomingCount} upcoming`,
      icon: Calendar,
      href: "/admin/performances",
    },
    { label: "Videos", value: stats.videoCount, icon: Video, href: "/admin/videos" },
    { label: "Photos", value: stats.photoCount, icon: Image, href: "/admin/photos" },
    {
      label: "Biography",
      value: "Edit",
      sub: stats.lastBioUpdate ? `Updated ${stats.lastBioUpdate.toLocaleDateString()}` : undefined,
      icon: FileText,
      href: "/admin/biography",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-gold-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} className="text-gold-600" />
              </div>
              <p className="text-3xl font-bold text-neutral-800">{card.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{card.label}</p>
              {card.sub && <p className="text-xs text-gold-600 mt-2">{card.sub}</p>}
            </a>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify by running dev server**

```bash
npm run dev
```

Visit `http://localhost:3000/admin` — should redirect to `/admin/login` (which doesn't exist yet, so 404 is expected). This confirms middleware is working.

- [ ] **Step 7: Commit**

```bash
git add app/admin/ components/admin/ app/api/admin/
git commit -m "feat: add admin layout, sidebar, dashboard home, and logout"
```

---

### Task 7: Login Page

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/login/actions.ts`

- [ ] **Step 1: Create the login server action**

Create `app/admin/login/actions.ts`:

```typescript
"use server";

import { login } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(_prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const result = await login(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  redirect("/admin");
}
```

- [ ] **Step 2: Create the login page**

Create `app/admin/login/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gold-500">Admin Login</h1>
          <p className="text-neutral-400 mt-2">Edisher Savitski Portfolio</p>
        </div>

        <form action={formAction} className="bg-white rounded-xl p-8 shadow-lg space-y-6">
          {state?.error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-600 text-white py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center">
            <a href="/admin/forgot-password" className="text-sm text-gold-600 hover:text-gold-700">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Login page needs its own layout (no sidebar)**

Create `app/admin/login/layout.tsx`:

```tsx
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Verify login flow**

```bash
npm run dev
```

1. Visit `http://localhost:3000/admin/login`
2. Enter the seeded admin credentials
3. Should redirect to `/admin` dashboard

Expected: Login form renders, successful login redirects to dashboard.

- [ ] **Step 5: Commit**

```bash
git add app/admin/login/
git commit -m "feat: add admin login page with email/password auth"
```

---

### Task 8: Forgot Password & Reset Password

**Files:**
- Create: `app/admin/forgot-password/page.tsx`
- Create: `app/admin/forgot-password/actions.ts`
- Create: `app/admin/forgot-password/layout.tsx`
- Create: `app/admin/reset-password/page.tsx`
- Create: `app/admin/reset-password/actions.ts`
- Create: `app/admin/reset-password/layout.tsx`

- [ ] **Step 1: Create forgot password action**

Create `app/admin/forgot-password/actions.ts`:

```typescript
"use server";

import { createPasswordResetToken } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function forgotPasswordAction(_prevState: { message?: string; error?: string } | null, formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const token = await createPasswordResetToken(email);

  // Always show success (don't reveal if email exists)
  if (!token) {
    return { message: "If an account exists with that email, a reset link has been sent." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Password Reset - Edisher Savitski Admin",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  return { message: "If an account exists with that email, a reset link has been sent." };
}
```

- [ ] **Step 2: Create forgot password page**

Create `app/admin/forgot-password/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gold-500">Reset Password</h1>
          <p className="text-neutral-400 mt-2">Enter your email to receive a reset link</p>
        </div>

        <form action={formAction} className="bg-white rounded-xl p-8 shadow-lg space-y-6">
          {state?.error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
          )}
          {state?.message && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{state.message}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-600 text-white py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <a href="/admin/login" className="text-sm text-gold-600 hover:text-gold-700">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create forgot password layout**

Create `app/admin/forgot-password/layout.tsx`:

```tsx
export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Create reset password action**

Create `app/admin/reset-password/actions.ts`:

```typescript
"use server";

import { resetPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function resetPasswordAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Invalid reset link" };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters" };
  if (password !== confirmPassword) return { error: "Passwords do not match" };

  const result = await resetPassword(token, password);

  if (!result.success) {
    return { error: result.error };
  }

  redirect("/admin/login?reset=success");
}
```

- [ ] **Step 5: Create reset password page**

Create `app/admin/reset-password/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetPasswordAction } from "./actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <p className="text-red-600">Invalid reset link. Please request a new one.</p>
          <a href="/admin/forgot-password" className="text-gold-600 hover:text-gold-700 text-sm mt-4 inline-block">
            Request new link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gold-500">New Password</h1>
          <p className="text-neutral-400 mt-2">Enter your new password</p>
        </div>

        <form action={formAction} className="bg-white rounded-xl p-8 shadow-lg space-y-6">
          <input type="hidden" name="token" value={token} />

          {state?.error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-600 text-white py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-900" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

- [ ] **Step 6: Create reset password layout**

Create `app/admin/reset-password/layout.tsx`:

```tsx
export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/admin/forgot-password/ app/admin/reset-password/
git commit -m "feat: add forgot password and reset password flows"
```

---

### Task 9: Performances List Page

**Files:**
- Create: `app/admin/performances/page.tsx`
- Create: `app/admin/performances/actions.ts`

- [ ] **Step 1: Create performances server actions**

Create `app/admin/performances/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePerformance(id: number) {
  await prisma.performance.delete({ where: { id } });
  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");
}
```

- [ ] **Step 2: Create performances list page**

Create `app/admin/performances/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deletePerformance } from "./actions";

export default async function PerformancesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; year?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || "upcoming";
  const year = params.year || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const perPage = 20;

  const now = new Date();
  const where: Record<string, unknown> = {};

  if (tab === "upcoming") {
    where.date = { gte: now };
  } else {
    where.date = { lt: now };
  }

  if (year !== "all") {
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${parseInt(year) + 1}-01-01`);
    where.date = { ...(where.date as object || {}), gte: yearStart, lt: yearEnd };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { venue: { contains: search } },
      { location: { contains: search } },
    ];
  }

  const [performances, total] = await Promise.all([
    prisma.performance.findMany({
      where,
      orderBy: { date: tab === "upcoming" ? "asc" : "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.performance.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  // Get distinct years for filter
  const years = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT YEAR(date) as year FROM performances ORDER BY year DESC
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-800">Performances</h1>
        <Link
          href="/admin/performances/new"
          className="flex items-center gap-2 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors"
        >
          <Plus size={20} />
          Add Performance
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Link
          href={`/admin/performances?tab=upcoming`}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "upcoming" ? "bg-gold-600 text-white" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          }`}
        >
          Upcoming
        </Link>
        <Link
          href={`/admin/performances?tab=past`}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "past" ? "bg-gold-600 text-white" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          }`}
        >
          Past
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form className="flex gap-4 flex-1">
          <input type="hidden" name="tab" value={tab} />
          <input
            name="search"
            placeholder="Search performances..."
            defaultValue={search}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
          <select
            name="year"
            defaultValue={year}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y.year} value={y.year}>
                {y.year}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 text-sm">
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Title</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Venue</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Location</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Type</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {performances.map((perf) => (
              <tr key={perf.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm text-neutral-600 whitespace-nowrap">
                  {perf.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-800 font-medium">
                  {perf.title}
                  {perf.isFeatured && (
                    <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{perf.venue}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{perf.location}</td>
                <td className="px-6 py-4 text-sm text-neutral-600 capitalize">{perf.type}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/performances/edit/${perf.id}`}
                      className="p-2 text-neutral-400 hover:text-gold-600 transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                    <form action={async () => { "use server"; await deletePerformance(perf.id); }}>
                      <button type="submit" className="p-2 text-neutral-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {performances.length === 0 && (
          <div className="text-center py-12 text-neutral-500">No performances found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/performances?tab=${tab}&year=${year}&search=${search}&page=${page - 1}`}
                className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-neutral-100"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/performances?tab=${tab}&year=${year}&search=${search}&page=${page + 1}`}
                className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-neutral-100"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify page loads**

```bash
npm run dev
```

Visit `http://localhost:3000/admin/performances` (after logging in). Expected: Table renders with seeded performances.

- [ ] **Step 4: Commit**

```bash
git add app/admin/performances/
git commit -m "feat: add performances list page with search, filters, pagination"
```

---

### Task 10: Performance Create/Edit Form

**Files:**
- Create: `app/admin/performances/new/page.tsx`
- Create: `app/admin/performances/edit/[id]/page.tsx`
- Create: `components/admin/PerformanceForm.tsx`
- Modify: `app/admin/performances/actions.ts`

- [ ] **Step 1: Add create and update server actions**

Append to `app/admin/performances/actions.ts`:

```typescript
import { PerformanceType } from "@prisma/client";
import { redirect } from "next/navigation";

export async function createPerformance(_prevState: { error?: string } | null, formData: FormData) {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const type = formData.get("type") as PerformanceType;
  const venue = formData.get("venue") as string;
  const location = formData.get("location") as string;
  const country = formData.get("country") as string;
  const organization = (formData.get("organization") as string) || null;
  const collaborators = JSON.parse((formData.get("collaborators") as string) || "[]");
  const repertoire = JSON.parse((formData.get("repertoire") as string) || "[]");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !date || !type || !venue || !location || !country) {
    return { error: "Please fill in all required fields" };
  }

  await prisma.performance.create({
    data: { title, date: new Date(date), type, venue, location, country, organization, collaborators, repertoire, isFeatured },
  });

  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/performances");
}

export async function updatePerformance(id: number, _prevState: { error?: string } | null, formData: FormData) {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const type = formData.get("type") as PerformanceType;
  const venue = formData.get("venue") as string;
  const location = formData.get("location") as string;
  const country = formData.get("country") as string;
  const organization = (formData.get("organization") as string) || null;
  const collaborators = JSON.parse((formData.get("collaborators") as string) || "[]");
  const repertoire = JSON.parse((formData.get("repertoire") as string) || "[]");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !date || !type || !venue || !location || !country) {
    return { error: "Please fill in all required fields" };
  }

  await prisma.performance.update({
    where: { id },
    data: { title, date: new Date(date), type, venue, location, country, organization, collaborators, repertoire, isFeatured },
  });

  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/performances");
}
```

- [ ] **Step 2: Create the PerformanceForm component**

Create `components/admin/PerformanceForm.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

type Performance = {
  id: number;
  title: string;
  date: Date;
  type: string;
  venue: string;
  location: string;
  country: string;
  organization: string | null;
  collaborators: string[];
  repertoire: string[];
  isFeatured: boolean;
};

export function PerformanceForm({
  performance,
  action,
}: {
  performance?: Performance;
  action: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | null>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [collaborators, setCollaborators] = useState<string[]>(
    (performance?.collaborators as string[]) || []
  );
  const [repertoire, setRepertoire] = useState<string[]>(
    (performance?.repertoire as string[]) || []
  );
  const [newCollab, setNewCollab] = useState("");
  const [newRep, setNewRep] = useState("");

  const addCollaborator = () => {
    if (newCollab.trim()) {
      setCollaborators([...collaborators, newCollab.trim()]);
      setNewCollab("");
    }
  };

  const addRepertoire = () => {
    if (newRep.trim()) {
      setRepertoire([...repertoire, newRep.trim()]);
      setNewRep("");
    }
  };

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={formAction} className="bg-white rounded-xl border border-neutral-200 p-8 max-w-3xl space-y-6">
      {state?.error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
      )}

      <input type="hidden" name="collaborators" value={JSON.stringify(collaborators)} />
      <input type="hidden" name="repertoire" value={JSON.stringify(repertoire)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Title *</label>
          <input
            name="title"
            required
            defaultValue={performance?.title}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Date *</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={performance ? formatDateForInput(performance.date) : ""}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
          <select
            name="type"
            required
            defaultValue={performance?.type || "solo"}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          >
            <option value="solo">Solo</option>
            <option value="chamber">Chamber</option>
            <option value="orchestra">Orchestra</option>
            <option value="masterclass">Masterclass</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Venue *</label>
          <input
            name="venue"
            required
            defaultValue={performance?.venue}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Location *</label>
          <input
            name="location"
            required
            defaultValue={performance?.location}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Country *</label>
          <input
            name="country"
            required
            defaultValue={performance?.country}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Organization</label>
          <input
            name="organization"
            defaultValue={performance?.organization || ""}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Collaborators</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newCollab}
            onChange={(e) => setNewCollab(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCollaborator(); } }}
            placeholder="Add collaborator..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          />
          <button type="button" onClick={addCollaborator} className="px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 text-sm">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {collaborators.map((c, i) => (
            <span key={i} className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {c}
              <button type="button" onClick={() => setCollaborators(collaborators.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Repertoire */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Repertoire</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newRep}
            onChange={(e) => setNewRep(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRepertoire(); } }}
            placeholder="Add piece..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          />
          <button type="button" onClick={addRepertoire} className="px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 text-sm">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {repertoire.map((r, i) => (
            <span key={i} className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {r}
              <button type="button" onClick={() => setRepertoire(repertoire.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isFeatured"
          id="isFeatured"
          defaultChecked={performance?.isFeatured}
          className="w-4 h-4 text-gold-600 rounded border-neutral-300 focus:ring-gold-500"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-neutral-700">
          Featured performance (shown on homepage)
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gold-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : performance ? "Update Performance" : "Create Performance"}
        </button>
        <Link href="/admin/performances" className="text-neutral-500 hover:text-neutral-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create the new performance page**

Create `app/admin/performances/new/page.tsx`:

```tsx
import { PerformanceForm } from "@/components/admin/PerformanceForm";
import { createPerformance } from "../actions";

export default function NewPerformancePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Add Performance</h1>
      <PerformanceForm action={createPerformance} />
    </div>
  );
}
```

- [ ] **Step 4: Create the edit performance page**

Create `app/admin/performances/edit/[id]/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PerformanceForm } from "@/components/admin/PerformanceForm";
import { updatePerformance } from "../../actions";

export default async function EditPerformancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const performance = await prisma.performance.findUnique({ where: { id: parseInt(id) } });

  if (!performance) notFound();

  const boundAction = updatePerformance.bind(null, performance.id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Edit Performance</h1>
      <PerformanceForm
        performance={{
          ...performance,
          collaborators: performance.collaborators as string[],
          repertoire: performance.repertoire as string[],
        }}
        action={boundAction}
      />
    </div>
  );
}
```

- [ ] **Step 5: Verify create/edit flow**

```bash
npm run dev
```

1. Visit `/admin/performances/new`, fill in form, submit
2. Verify new performance appears in list
3. Click edit on a performance, modify, save
4. Verify changes persist

- [ ] **Step 6: Commit**

```bash
git add app/admin/performances/ components/admin/PerformanceForm.tsx
git commit -m "feat: add performance create/edit forms with dynamic fields"
```

---

### Task 11: Videos Management

**Files:**
- Create: `app/admin/videos/page.tsx`
- Create: `app/admin/videos/actions.ts`
- Create: `app/admin/videos/new/page.tsx`
- Create: `app/admin/videos/edit/[id]/page.tsx`
- Create: `components/admin/VideoForm.tsx`

- [ ] **Step 1: Create video server actions**

Create `app/admin/videos/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVideo(_prevState: { error?: string } | null, formData: FormData) {
  const title = formData.get("title") as string;
  const youtubeId = formData.get("youtubeId") as string;
  const description = (formData.get("description") as string) || null;
  const performanceDate = (formData.get("performanceDate") as string) || null;
  const venue = (formData.get("venue") as string) || null;
  const repertoire = JSON.parse((formData.get("repertoire") as string) || "[]");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !youtubeId) {
    return { error: "Title and YouTube ID are required" };
  }

  const maxOrder = await prisma.video.aggregate({ _max: { sortOrder: true } });

  await prisma.video.create({
    data: {
      title,
      youtubeId,
      description,
      performanceDate,
      venue,
      repertoire,
      isFeatured,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/media");
  revalidatePath("/");
  redirect("/admin/videos");
}

export async function updateVideo(id: number, _prevState: { error?: string } | null, formData: FormData) {
  const title = formData.get("title") as string;
  const youtubeId = formData.get("youtubeId") as string;
  const description = (formData.get("description") as string) || null;
  const performanceDate = (formData.get("performanceDate") as string) || null;
  const venue = (formData.get("venue") as string) || null;
  const repertoire = JSON.parse((formData.get("repertoire") as string) || "[]");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !youtubeId) {
    return { error: "Title and YouTube ID are required" };
  }

  await prisma.video.update({
    where: { id },
    data: { title, youtubeId, description, performanceDate, venue, repertoire, isFeatured },
  });

  revalidatePath("/media");
  revalidatePath("/");
  redirect("/admin/videos");
}

export async function deleteVideo(id: number) {
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
  revalidatePath("/media");
  revalidatePath("/");
}

export async function reorderVideos(orderedIds: number[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.video.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePath("/admin/videos");
  revalidatePath("/media");
}
```

- [ ] **Step 2: Create the VideoForm component**

Create `components/admin/VideoForm.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

type VideoData = {
  id: number;
  title: string;
  youtubeId: string;
  description: string | null;
  performanceDate: string | null;
  venue: string | null;
  repertoire: string[];
  isFeatured: boolean;
};

export function VideoForm({
  video,
  action,
}: {
  video?: VideoData;
  action: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | null>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [repertoire, setRepertoire] = useState<string[]>((video?.repertoire as string[]) || []);
  const [newRep, setNewRep] = useState("");
  const [youtubeId, setYoutubeId] = useState(video?.youtubeId || "");

  const addRepertoire = () => {
    if (newRep.trim()) {
      setRepertoire([...repertoire, newRep.trim()]);
      setNewRep("");
    }
  };

  // Extract YouTube ID from URL or use as-is
  const parseYoutubeId = (input: string): string => {
    const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : input;
  };

  return (
    <form action={formAction} className="bg-white rounded-xl border border-neutral-200 p-8 max-w-3xl space-y-6">
      {state?.error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{state.error}</div>
      )}

      <input type="hidden" name="repertoire" value={JSON.stringify(repertoire)} />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Title *</label>
        <input
          name="title"
          required
          defaultValue={video?.title}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">YouTube URL or Video ID *</label>
        <input
          name="youtubeId"
          required
          value={youtubeId}
          onChange={(e) => setYoutubeId(parseYoutubeId(e.target.value))}
          placeholder="Paste YouTube URL or video ID"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
        />
        {youtubeId && (
          <div className="mt-4 aspect-video max-w-md rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Performance Date</label>
          <input
            name="performanceDate"
            defaultValue={video?.performanceDate || ""}
            placeholder="e.g., March 2024"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Venue</label>
          <input
            name="venue"
            defaultValue={video?.venue || ""}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={video?.description || ""}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none resize-none"
        />
      </div>

      {/* Repertoire */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Repertoire</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newRep}
            onChange={(e) => setNewRep(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRepertoire(); } }}
            placeholder="Add piece..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          />
          <button type="button" onClick={addRepertoire} className="px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 text-sm">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {repertoire.map((r, i) => (
            <span key={i} className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {r}
              <button type="button" onClick={() => setRepertoire(repertoire.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isFeatured"
          id="isFeatured"
          defaultChecked={video?.isFeatured}
          className="w-4 h-4 text-gold-600 rounded border-neutral-300 focus:ring-gold-500"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-neutral-700">
          Featured video (shown on homepage)
        </label>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gold-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : video ? "Update Video" : "Add Video"}
        </button>
        <Link href="/admin/videos" className="text-neutral-500 hover:text-neutral-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create the videos list page**

Create `app/admin/videos/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteVideo } from "./actions";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-800">Videos</h1>
        <Link
          href="/admin/videos/new"
          className="flex items-center gap-2 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors"
        >
          <Plus size={20} />
          Add Video
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="aspect-video bg-black">
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-neutral-800 mb-1">{video.title}</h3>
              {video.isFeatured && (
                <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Featured</span>
              )}
              <div className="flex items-center gap-2 mt-4">
                <Link
                  href={`/admin/videos/edit/${video.id}`}
                  className="p-2 text-neutral-400 hover:text-gold-600 transition-colors"
                >
                  <Pencil size={16} />
                </Link>
                <form action={async () => { "use server"; await deleteVideo(video.id); }}>
                  <button type="submit" className="p-2 text-neutral-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 text-neutral-500 bg-white rounded-xl border border-neutral-200">
          No videos yet. Add your first video.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create new video page**

Create `app/admin/videos/new/page.tsx`:

```tsx
import { VideoForm } from "@/components/admin/VideoForm";
import { createVideo } from "../actions";

export default function NewVideoPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Add Video</h1>
      <VideoForm action={createVideo} />
    </div>
  );
}
```

- [ ] **Step 5: Create edit video page**

Create `app/admin/videos/edit/[id]/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VideoForm } from "@/components/admin/VideoForm";
import { updateVideo } from "../../actions";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id: parseInt(id) } });

  if (!video) notFound();

  const boundAction = updateVideo.bind(null, video.id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Edit Video</h1>
      <VideoForm
        video={{
          ...video,
          repertoire: video.repertoire as string[],
        }}
        action={boundAction}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verify video CRUD flow**

```bash
npm run dev
```

1. Visit `/admin/videos` — should show seeded videos
2. Add a new video with a YouTube URL
3. Edit an existing video
4. Delete a video

- [ ] **Step 7: Commit**

```bash
git add app/admin/videos/ components/admin/VideoForm.tsx
git commit -m "feat: add video CRUD with YouTube preview and reordering"
```

---

### Task 12: Photo Management with Upload

**Files:**
- Create: `app/admin/photos/page.tsx`
- Create: `app/admin/photos/actions.ts`
- Create: `components/admin/PhotoUpload.tsx`
- Create: `lib/image-processing.ts`

- [ ] **Step 1: Create image processing utility**

Create `lib/image-processing.ts`:

```typescript
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery");
const SIZES = [
  { suffix: "thumbnail", width: 300 },
  { suffix: "medium", width: 600 },
  { suffix: "large", width: 1200 },
  { suffix: "xlarge", width: 1800 },
];

export async function processAndSavePhoto(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  // Generate a clean filename without extension
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim();

  const timestamp = Date.now();
  const filename = `${baseName}-${timestamp}`;

  // Ensure directory exists
  await fs.mkdir(GALLERY_DIR, { recursive: true });

  // Generate all sizes as WebP
  for (const size of SIZES) {
    const outputPath = path.join(GALLERY_DIR, `${filename}-${size.suffix}.webp`);
    await sharp(buffer)
      .resize(size.width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);
  }

  return filename;
}

export async function deletePhotoFiles(filename: string): Promise<void> {
  for (const size of SIZES) {
    const filePath = path.join(GALLERY_DIR, `${filename}-${size.suffix}.webp`);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist, that's okay
    }
  }
}
```

- [ ] **Step 2: Create photo server actions**

Create `app/admin/photos/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { processAndSavePhoto, deletePhotoFiles } from "@/lib/image-processing";
import { revalidatePath } from "next/cache";

export async function uploadPhoto(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = await processAndSavePhoto(buffer, file.name);

  const maxOrder = await prisma.photo.aggregate({ _max: { sortOrder: true } });

  await prisma.photo.create({
    data: {
      filename,
      altText: "Dr. Savitski",
      objectPosition: "center center",
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/photos");
  revalidatePath("/media");
  revalidatePath("/");
}

export async function deletePhoto(id: number) {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;

  await deletePhotoFiles(photo.filename);
  await prisma.photo.delete({ where: { id } });

  revalidatePath("/admin/photos");
  revalidatePath("/media");
  revalidatePath("/");
}

export async function updatePhotoMeta(id: number, formData: FormData) {
  const altText = formData.get("altText") as string;
  const objectPosition = formData.get("objectPosition") as string;

  await prisma.photo.update({
    where: { id },
    data: { altText, objectPosition },
  });

  revalidatePath("/admin/photos");
  revalidatePath("/media");
}

export async function reorderPhotos(orderedIds: number[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.photo.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePath("/admin/photos");
  revalidatePath("/media");
}
```

- [ ] **Step 3: Create photo upload component**

Create `components/admin/PhotoUpload.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

export function PhotoUpload({ uploadAction }: { uploadAction: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await uploadAction(formData);
    }
    setIsUploading(false);

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragging ? "border-gold-500 bg-gold-50" : "border-neutral-300 hover:border-gold-400"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleUpload(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <Upload size={32} className="mx-auto text-neutral-400 mb-3" />
      {isUploading ? (
        <p className="text-sm text-gold-600 font-medium">Uploading and processing...</p>
      ) : (
        <>
          <p className="text-sm text-neutral-600 font-medium">Drop photos here or click to upload</p>
          <p className="text-xs text-neutral-400 mt-1">Images will be auto-converted to WebP in 4 sizes</p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create photos management page**

Create `app/admin/photos/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { Trash2 } from "lucide-react";
import { PhotoUpload } from "@/components/admin/PhotoUpload";
import { uploadPhoto, deletePhoto, updatePhotoMeta } from "./actions";

export default async function PhotosPage() {
  const photos = await prisma.photo.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Photos</h1>

      <div className="mb-8">
        <PhotoUpload uploadAction={uploadPhoto} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-100">
              <img
                src={`/images/gallery/${photo.filename}-large.webp`}
                alt={photo.altText}
                className="w-full h-full object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
            </div>
            <div className="p-4 space-y-3">
              <form action={async (formData: FormData) => { "use server"; await updatePhotoMeta(photo.id, formData); }}>
                <div className="space-y-2">
                  <input
                    name="altText"
                    defaultValue={photo.altText}
                    placeholder="Alt text"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  />
                  <select
                    name="objectPosition"
                    defaultValue={photo.objectPosition}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  >
                    <option value="center center">Center</option>
                    <option value="center top">Top</option>
                    <option value="center 28%">Upper (28%)</option>
                    <option value="center 80%">Lower (80%)</option>
                    <option value="center bottom">Bottom</option>
                  </select>
                  <button type="submit" className="w-full px-3 py-2 text-sm bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                    Save
                  </button>
                </div>
              </form>

              <form action={async () => { "use server"; await deletePhoto(photo.id); }}>
                <button type="submit" className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12 text-neutral-500 bg-white rounded-xl border border-neutral-200">
          No photos yet. Upload your first photo above.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify photo upload flow**

```bash
npm run dev
```

1. Visit `/admin/photos`
2. Upload a test image — should appear in the grid
3. Change alt text and object position, save
4. Delete a photo

- [ ] **Step 6: Commit**

```bash
git add app/admin/photos/ components/admin/PhotoUpload.tsx lib/image-processing.ts
git commit -m "feat: add photo management with drag-drop upload and Sharp processing"
```

---

### Task 13: Biography Editor with Tiptap

**Files:**
- Create: `app/admin/biography/page.tsx`
- Create: `app/admin/biography/actions.ts`
- Create: `components/admin/RichTextEditor.tsx`
- Create: `components/admin/BiographyForm.tsx`

- [ ] **Step 1: Create the Tiptap RichTextEditor component**

Create `components/admin/RichTextEditor.tsx`:

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
} from "lucide-react";

type JSONContent = Record<string, unknown>;

export function RichTextEditor({
  content,
  onChange,
}: {
  content: JSONContent;
  onChange: (json: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as JSONContent);
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded ${isActive ? "bg-gold-100 text-gold-700" : "text-neutral-500 hover:bg-neutral-100"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}>
          <Heading3 size={16} />
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}>
          <Quote size={16} />
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")}>
          <LinkIcon size={16} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px]" />
    </div>
  );
}
```

- [ ] **Step 2: Create biography server actions**

Create `app/admin/biography/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBiography(formData: FormData) {
  const shortBio = formData.get("shortBio") as string;
  const fullBio = JSON.parse(formData.get("fullBio") as string);
  const sections = JSON.parse(formData.get("sections") as string);
  const highlights = JSON.parse(formData.get("highlights") as string);
  const venues = JSON.parse(formData.get("venues") as string);
  const testimonials = JSON.parse(formData.get("testimonials") as string);

  await prisma.biography.upsert({
    where: { id: 1 },
    update: { shortBio, fullBio, sections, highlights, venues, testimonials },
    create: { shortBio, fullBio, sections, highlights, venues, testimonials },
  });

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true };
}
```

- [ ] **Step 3: Create the BiographyForm component**

Create `components/admin/BiographyForm.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { updateBiography } from "@/app/admin/biography/actions";

type JSONContent = Record<string, unknown>;

type BiographyData = {
  shortBio: string;
  fullBio: JSONContent;
  sections: { id: string; title: string; content: JSONContent; order: number }[];
  highlights: string[];
  venues: { usa: string[]; europe: string[]; asia: string[]; other: string[] };
  testimonials: { id: string; quote: string; author: string; source: string }[];
};

export function BiographyForm({ biography }: { biography: BiographyData }) {
  const [shortBio, setShortBio] = useState(biography.shortBio);
  const [fullBio, setFullBio] = useState<JSONContent>(biography.fullBio);
  const [sections, setSections] = useState(biography.sections);
  const [highlights, setHighlights] = useState(biography.highlights);
  const [venues, setVenues] = useState(biography.venues);
  const [testimonials, setTestimonials] = useState(biography.testimonials);
  const [newHighlight, setNewHighlight] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("shortBio", shortBio);
      formData.set("fullBio", JSON.stringify(fullBio));
      formData.set("sections", JSON.stringify(sections));
      formData.set("highlights", JSON.stringify(highlights));
      formData.set("venues", JSON.stringify(venues));
      formData.set("testimonials", JSON.stringify(testimonials));
      await updateBiography(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: "New Section",
        content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }] },
        order: sections.length,
      },
    ]);
  };

  const updateSection = (index: number, field: string, value: string | JSONContent) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addVenue = (region: keyof typeof venues) => {
    const venue = window.prompt("Enter venue name:");
    if (venue) {
      setVenues({ ...venues, [region]: [...venues[region], venue] });
    }
  };

  const removeVenue = (region: keyof typeof venues, index: number) => {
    setVenues({ ...venues, [region]: venues[region].filter((_, i) => i !== index) });
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { id: `testimonial-${Date.now()}`, quote: "", author: "", source: "" },
    ]);
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Save button - sticky */}
      <div className="sticky top-0 z-10 bg-neutral-50 py-4 flex items-center gap-4 border-b border-neutral-200">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save All Changes"}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved successfully!</span>}
      </div>

      {/* Short Bio */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-serif text-xl font-bold text-neutral-800 mb-4">Short Bio</h2>
        <p className="text-sm text-neutral-500 mb-3">Shown on the homepage. Plain text.</p>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none resize-none"
        />
      </div>

      {/* Full Bio */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-serif text-xl font-bold text-neutral-800 mb-4">Full Biography</h2>
        <p className="text-sm text-neutral-500 mb-3">Shown on the About page. Rich text.</p>
        <RichTextEditor content={fullBio} onChange={setFullBio} />
      </div>

      {/* Sections */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-neutral-800">Biography Sections</h2>
          <button onClick={addSection} className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700">
            <Plus size={16} /> Add Section
          </button>
        </div>
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={section.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <GripVertical size={16} className="text-neutral-300" />
                <input
                  value={section.title}
                  onChange={(e) => updateSection(i, "title", e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg font-medium focus:ring-2 focus:ring-gold-500 outline-none"
                />
                <button onClick={() => removeSection(i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <RichTextEditor content={section.content} onChange={(json) => updateSection(i, "content", json)} />
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-serif text-xl font-bold text-neutral-800 mb-4">Career Highlights</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newHighlight.trim()) {
                  setHighlights([...highlights, newHighlight.trim()]);
                  setNewHighlight("");
                }
              }
            }}
            placeholder="Add highlight..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (newHighlight.trim()) {
                setHighlights([...highlights, newHighlight.trim()]);
                setNewHighlight("");
              }
            }}
            className="px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <span key={i} className="bg-neutral-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              {h}
              <button type="button" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Venues */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-serif text-xl font-bold text-neutral-800 mb-4">Performance Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(venues) as Array<keyof typeof venues>).map((region) => (
            <div key={region}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-700 capitalize">{region === "other" ? "Other" : region.toUpperCase()}</h3>
                <button onClick={() => addVenue(region)} className="text-sm text-gold-600 hover:text-gold-700">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {venues[region].map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 bg-neutral-50 rounded text-sm">
                    <span>{v}</span>
                    <button onClick={() => removeVenue(region, i)} className="text-neutral-400 hover:text-red-500 text-xs">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-neutral-800">Testimonials</h2>
          <button onClick={addTestimonial} className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={t.id} className="border border-neutral-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-end">
                <button onClick={() => removeTestimonial(i)} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={t.quote}
                onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                placeholder="Quote text..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={t.author}
                  onChange={(e) => updateTestimonial(i, "author", e.target.value)}
                  placeholder="Author name"
                  className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                />
                <input
                  value={t.source}
                  onChange={(e) => updateTestimonial(i, "source", e.target.value)}
                  placeholder="Source (publication)"
                  className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the biography admin page**

Create `app/admin/biography/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { BiographyForm } from "@/components/admin/BiographyForm";

export default async function BiographyPage() {
  const biography = await prisma.biography.findFirst();

  const defaultBio = {
    shortBio: "",
    fullBio: { type: "doc", content: [{ type: "paragraph" }] },
    sections: [],
    highlights: [],
    venues: { usa: [], europe: [], asia: [], other: [] },
    testimonials: [],
  };

  const data = biography
    ? {
        shortBio: biography.shortBio,
        fullBio: biography.fullBio as Record<string, unknown>,
        sections: biography.sections as { id: string; title: string; content: Record<string, unknown>; order: number }[],
        highlights: biography.highlights as string[],
        venues: biography.venues as { usa: string[]; europe: string[]; asia: string[]; other: string[] },
        testimonials: biography.testimonials as { id: string; quote: string; author: string; source: string }[],
      }
    : defaultBio;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-neutral-800 mb-8">Biography</h1>
      <BiographyForm biography={data} />
    </div>
  );
}
```

- [ ] **Step 5: Verify biography editing**

```bash
npm run dev
```

1. Visit `/admin/biography`
2. Edit short bio text
3. Use the rich text editor for full bio (try bold, links, headings)
4. Add/remove a highlight
5. Add a testimonial
6. Click "Save All Changes"

- [ ] **Step 6: Commit**

```bash
git add app/admin/biography/ components/admin/RichTextEditor.tsx components/admin/BiographyForm.tsx
git commit -m "feat: add biography editor with Tiptap rich text and section management"
```

---

### Task 14: Public Site Migration — Switch Data Source

**Files:**
- Modify: `app/events/page.tsx`
- Modify: `app/media/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `components/media/PhotoGallery.tsx`
- Modify: `components/home/QuickBio.tsx`
- Modify: `components/home/FeaturedPerformances.tsx` (if exists)

**Important:** This task switches the public site from static files to the database. Only do this after all admin CRUD is tested and working.

- [ ] **Step 1: Create data access layer for public pages**

Create `lib/data.ts`:

```typescript
import { prisma } from "./prisma";

export async function getUpcomingPerformances() {
  return prisma.performance.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });
}

export async function getPastPerformances(limit?: number) {
  return prisma.performance.findMany({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getFeaturedPerformances() {
  return prisma.performance.findMany({
    where: { isFeatured: true },
    orderBy: { date: "desc" },
  });
}

export async function getAllPerformances() {
  return prisma.performance.findMany({
    orderBy: { date: "desc" },
  });
}

export async function getVideos() {
  return prisma.video.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFeaturedVideos() {
  return prisma.video.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPhotos() {
  return prisma.photo.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBiography() {
  return prisma.biography.findFirst();
}
```

- [ ] **Step 2: Update the events page**

Modify `app/events/page.tsx` to import from `lib/data.ts` instead of `data/performances.ts`:

Replace the static imports:
```typescript
// OLD: import { getUpcomingPerformances, getPastPerformances } from "@/data/performances";
// NEW:
import { getUpcomingPerformances, getPastPerformances } from "@/lib/data";
```

The page function needs to be async (it already should be for Server Components). The data shape from Prisma matches the existing components — `id` becomes a number instead of string, and `date` is a Date object instead of string. Update the `EventsList` and `EventCard` components to handle this:

- `id: number` (was `string`)
- `date: Date` (was `string` — the `formatDateShort` util in `lib/utils.ts` already accepts Date)
- `isPast` is no longer a field — compute it from `date < new Date()`
- `collaborators` and `repertoire` come as JSON (cast to `string[]`)

- [ ] **Step 3: Update the media page**

Modify `app/media/page.tsx`:

```typescript
// OLD: import { videos } from "@/data/videos";
// NEW:
import { getVideos, getPhotos } from "@/lib/data";
```

Update the component to call `const videos = await getVideos()` and pass the photos from the database to `PhotoGallery` instead of using the hardcoded array.

- [ ] **Step 4: Update PhotoGallery to accept data as props**

Modify `components/media/PhotoGallery.tsx`:

Change from hardcoded images array to accepting `photos` prop:

```tsx
type PhotoData = {
  id: number;
  filename: string;
  altText: string;
  objectPosition: string;
};

export function PhotoGallery({ photos }: { photos: PhotoData[] }) {
  // Use photos prop instead of hardcoded array
  // Image src: `/images/gallery/${photo.filename}-large.webp`
  // srcSet with thumbnail, medium, large, xlarge variants
}
```

- [ ] **Step 5: Update About page**

Modify `app/about/page.tsx`:

```typescript
// OLD: import { biography } from "@/data/biography";
// NEW:
import { getBiography } from "@/lib/data";
```

For the full bio and sections, use Tiptap's `generateHTML` to convert the stored JSON to HTML:

```typescript
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

const extensions = [StarterKit, Link, Underline];

// In the component:
const bio = await getBiography();
const fullBioHtml = generateHTML(bio.fullBio as JSONContent, extensions);
```

Render the HTML with `dangerouslySetInnerHTML` inside a `prose` container.

- [ ] **Step 6: Update homepage components**

Update `components/home/QuickBio.tsx` and any featured performances/media components to use `lib/data.ts` instead of static imports.

- [ ] **Step 7: Verify all public pages render correctly**

```bash
npm run build && npm start
```

Visit every public page and compare with the current live site:
1. `/` — homepage with hero, bio, featured performances, featured media
2. `/about` — full biography with sections, testimonials, venues
3. `/events` — upcoming and past performances
4. `/media` — videos and photos with lightbox
5. `/teaching` — check if it uses any data that needs migration
6. `/contact` — should be unaffected

- [ ] **Step 8: Commit**

```bash
git add lib/data.ts app/events/ app/media/ app/about/ app/page.tsx components/
git commit -m "feat: switch public site from static files to database"
```

---

### Task 15: Final Integration & Build Verification

**Files:**
- Modify: `next.config.ts` (if needed for image domains)
- Modify: `CLAUDE.md` (update project docs)

- [ ] **Step 1: Verify full build succeeds**

```bash
npm run build
```

Expected: Build succeeds with no errors. All pages build as static or server-rendered.

- [ ] **Step 2: Test full flow end-to-end**

```bash
npm run dev
```

Complete flow:
1. Login at `/admin/login`
2. Check dashboard stats
3. Create a new performance → verify it appears on `/events`
4. Edit a performance → verify changes on `/events`
5. Delete a performance → verify removed from `/events`
6. Add a video → verify on `/media`
7. Upload a photo → verify on `/media`
8. Edit biography → verify on `/about`
9. Logout → verify redirect to login
10. Try accessing `/admin` without login → verify redirect

- [ ] **Step 3: Update CLAUDE.md with admin panel documentation**

Add a new section to `CLAUDE.md` documenting:
- Admin routes and their purpose
- Database schema overview
- Auth system (JWT + bcrypt)
- Image processing pipeline
- How to seed the database
- Environment variables needed

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: complete admin dashboard with full content management"
```
