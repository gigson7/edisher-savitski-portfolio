import type { PrismaClient as PrismaClientType } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClientType | undefined;
};

// Lazy singleton — Prisma client is NOT created at import time.
// Uses Neon HTTP driver (@neondatabase/serverless) which is fetch-based,
// so it spawns ZERO native threads. Safe for Hostinger shared hosting nproc limits.
export function getPrisma(): PrismaClientType {
  if (globalForPrisma._prisma) return globalForPrisma._prisma;

  const { PrismaClient } = require("./generated/prisma/client");
  const { PrismaNeonHttp } = require("@prisma/adapter-neon");

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // PrismaNeonHttp uses fetch() only — no TCP pool, no WebSocket, no native threads.
  // Safe for Hostinger shared hosting nproc limits.
  const adapter = new PrismaNeonHttp(url, {});
  const client = new PrismaClient({ adapter });

  globalForPrisma._prisma = client;
  return client;
}

// Backward-compatible export — lazy proxy that creates client on first property access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getPrisma() as any)[prop];
  },
});
