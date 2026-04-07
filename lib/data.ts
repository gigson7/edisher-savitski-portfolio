// Data access layer — tries database first, falls back to static files
import { performances as staticPerformances } from "@/data/performances";
import { videos as staticVideos, getFeaturedVideos as getStaticFeaturedVideos } from "@/data/videos";
import { biography as staticBiography } from "@/data/biography";

function getPrisma() {
  try {
    return require("./prisma").prisma;
  } catch {
    return null;
  }
}

export async function getUpcomingPerformances() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.performance.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getUpcomingPerformances, using static:", (e as Error).message);
  }
  return staticPerformances.filter((p: { isPast: boolean }) => !p.isPast);
}

export async function getPastPerformances(limit?: number) {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.performance.findMany({
        where: { date: { lt: new Date() } },
        orderBy: { date: "desc" },
        ...(limit ? { take: limit } : {}),
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getPastPerformances, using static:", (e as Error).message);
  }
  const past = staticPerformances.filter((p: { isPast: boolean }) => p.isPast);
  return limit ? past.slice(0, limit) : past;
}

export async function getFeaturedPerformances() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.performance.findMany({
        where: { isFeatured: true },
        orderBy: { date: "desc" },
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getFeaturedPerformances, using static:", (e as Error).message);
  }
  return staticPerformances.filter((p: { isFeatured?: boolean }) => p.isFeatured);
}

export async function getVideos() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getVideos, using static:", (e as Error).message);
  }
  return staticVideos;
}

export async function getFeaturedVideos() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.video.findMany({
        where: { isFeatured: true },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getFeaturedVideos, using static:", (e as Error).message);
  }
  return getStaticFeaturedVideos();
}

export async function getPhotos() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.photo.findMany({
        orderBy: { sortOrder: "asc" },
      });
    }
  } catch (e) {
    console.error("[DATA] DB error in getPhotos, using static:", (e as Error).message);
  }
  // Return static photo data matching PhotoGallery expectations
  return [
    { id: 1, filename: "DSCF5956", altText: "Dr. Savitski performing", objectPosition: "center 28%" },
    { id: 2, filename: "DSCF6301", altText: "Dr. Savitski at the piano", objectPosition: "center top" },
    { id: 3, filename: "DSCF6347", altText: "Dr. Savitski in concert", objectPosition: "center top" },
    { id: 4, filename: "edisher 123", altText: "Dr. Savitski performing", objectPosition: "center top" },
    { id: 5, filename: "edisher 124", altText: "Dr. Savitski at a venue", objectPosition: "center top" },
    { id: 6, filename: "edisher 127", altText: "Dr. Savitski performing", objectPosition: "center 80%" },
    { id: 7, filename: "edisher 130", altText: "Dr. Savitski in performance", objectPosition: "center center" },
    { id: 8, filename: "edisher 132", altText: "Dr. Savitski at the piano", objectPosition: "center center" },
  ];
}

export async function getBiography() {
  try {
    const prisma = getPrisma();
    if (prisma) {
      return await prisma.biography.findFirst();
    }
  } catch (e) {
    console.error("[DATA] DB error in getBiography, using static:", (e as Error).message);
  }
  return null; // About page handles null with static biography import
}
