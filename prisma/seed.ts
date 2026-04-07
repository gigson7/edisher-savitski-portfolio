/**
 * Seed script — one-time migration of all hardcoded static data into the database.
 * Run with: npx prisma db seed
 * NOTE: Re-running will fail on unique constraint violations (by design).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as bcrypt from "bcryptjs";

// We import from the data files directly (TypeScript via tsx).
// Use relative paths from this file's location (prisma/).
import { performances } from "../data/performances";
import { videos } from "../data/videos";
import { biography } from "../data/biography";

// ─── Prisma client ────────────────────────────────────────────────────────────

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter });
}

const prisma = createClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a plain-text string (with double-newline paragraph breaks) into the
 * Tiptap ProseMirror JSON format that the editor expects.
 */
function toTiptapJson(text: string): object {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    type: "doc",
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: [{ type: "text", text: p }],
    })),
  };
}

// ─── 1. Admin user ────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: "Dr. Edisher Savitski",
    },
  });

  console.log(`✓ Admin user created: ${email}`);
}

// ─── 2. Performances ─────────────────────────────────────────────────────────

async function seedPerformances() {
  let count = 0;
  for (const p of performances) {
    await prisma.performance.create({
      data: {
        title: p.title,
        date: new Date(p.date),
        type: p.type as "solo" | "chamber" | "orchestra" | "masterclass",
        venue: p.venue,
        location: p.location,
        country: p.country,
        organization: p.organization ?? null,
        collaborators: JSON.parse(JSON.stringify(p.collaborators ?? [])),
        repertoire: JSON.parse(JSON.stringify(p.repertoire ?? [])),
        isFeatured: p.isFeatured ?? false,
      },
    });
    count++;
    if (count % 50 === 0) console.log(`  …${count} performances`);
  }
  console.log(`✓ Performances seeded: ${count}`);
}

// ─── 3. Videos ───────────────────────────────────────────────────────────────

async function seedVideos() {
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    await prisma.video.create({
      data: {
        youtubeId: v.youtubeId,
        title: v.title,
        description: v.description ?? null,
        performanceDate: v.performanceDate ? new Date(v.performanceDate) : null,
        venue: v.venue ?? null,
        repertoire: JSON.parse(JSON.stringify(v.repertoire)),
        isFeatured: v.featured ?? false,
        sortOrder: i,
      },
    });
  }
  console.log(`✓ Videos seeded: ${videos.length}`);
}

// ─── 4. Photos ───────────────────────────────────────────────────────────────

const PHOTOS = [
  { filename: "DSCF5956", altText: "Dr. Savitski performing", objectPosition: "center 28%" },
  { filename: "DSCF6301", altText: "Dr. Savitski at the piano", objectPosition: "center top" },
  { filename: "DSCF6347", altText: "Dr. Savitski in concert", objectPosition: "center top" },
  { filename: "edisher 123", altText: "Dr. Savitski performing", objectPosition: "center top" },
  { filename: "edisher 124", altText: "Dr. Savitski at a venue", objectPosition: "center top" },
  { filename: "edisher 127", altText: "Dr. Savitski performing", objectPosition: "center 80%" },
  { filename: "edisher 130", altText: "Dr. Savitski in performance", objectPosition: "center center" },
  { filename: "edisher 132", altText: "Dr. Savitski at the piano", objectPosition: "center center" },
] as const;

async function seedPhotos() {
  for (let i = 0; i < PHOTOS.length; i++) {
    const p = PHOTOS[i];
    await prisma.photo.create({
      data: {
        filename: p.filename,
        altText: p.altText,
        objectPosition: p.objectPosition,
        sortOrder: i,
        isFeatured: false,
      },
    });
  }
  console.log(`✓ Photos seeded: ${PHOTOS.length}`);
}

// ─── 5. Biography ─────────────────────────────────────────────────────────────

async function seedBiography() {
  const bio = biography;

  const sections = bio.sections.map((s) => ({
    id: s.id,
    title: s.title,
    content: toTiptapJson(s.content),
    order: s.order,
  }));

  // JSON.parse(JSON.stringify(...)) strips TypeScript interface types to plain
  // JSON-compatible values that Prisma's InputJsonValue constraint accepts.
  await prisma.biography.create({
    data: {
      shortBio: bio.shortBio,
      fullBio: JSON.parse(JSON.stringify(toTiptapJson(bio.fullBio))),
      sections: JSON.parse(JSON.stringify(sections)),
      highlights: JSON.parse(JSON.stringify(bio.highlights)),
      venues: JSON.parse(JSON.stringify(bio.venues)),
      testimonials: JSON.parse(JSON.stringify(bio.testimonials)),
    },
  });

  console.log("✓ Biography seeded");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting seed…");
  await seedAdmin();
  await seedPerformances();
  await seedVideos();
  await seedPhotos();
  await seedBiography();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
