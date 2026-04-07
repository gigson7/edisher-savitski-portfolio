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

export async function getFeaturedPhotos() {
  return prisma.photo.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBiography() {
  return prisma.biography.findFirst();
}
