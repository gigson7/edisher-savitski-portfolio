import type { PrismaClient as PrismaClientType } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClientType | undefined;
};

// Lazy singleton — Prisma client is NOT created at import time.
// This avoids spawning mariadb connection pool threads during Node.js
// startup, which would exceed Hostinger shared hosting's nproc limit.
export function getPrisma(): PrismaClientType {
  if (globalForPrisma._prisma) return globalForPrisma._prisma;

  // Dynamic imports to avoid loading mariadb at module evaluation time
  const { PrismaClient } = require("./generated/prisma/client");
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Try creating adapter with explicit pool options for Hostinger compatibility
  let adapter;
  try {
    const mariadb = require("mariadb");
    const dbUrl = new URL(url);
    const pool = mariadb.createPool({
      host: dbUrl.hostname || "localhost",
      port: parseInt(dbUrl.port || "3306"),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.slice(1),
      connectionLimit: 2,
      minimumIdle: 1,
      connectTimeout: 10000,
    });
    adapter = new PrismaMariaDb(pool);
  } catch (e) {
    console.error("[PRISMA] Failed to create pool with explicit options, falling back to URL:", e);
    adapter = new PrismaMariaDb(url);
  }
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma._prisma = client;
  }
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
