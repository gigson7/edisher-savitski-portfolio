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

  // Parse URL and create pool with explicit options
  // Use socketPath for Hostinger shared hosting (TCP to localhost may be blocked)
  const mariadb = require("mariadb");
  const dbUrl = new URL(url);

  const poolConfig: Record<string, unknown> = {
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    connectionLimit: 2,
    minimumIdle: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
  };

  // Try Unix socket paths common on shared hosting
  const socketPaths = [
    "/var/run/mysqld/mysqld.sock",
    "/var/lib/mysql/mysql.sock",
    "/tmp/mysql.sock",
    "/run/mysqld/mysqld.sock",
  ];

  const fs = require("fs");
  let socketPath = null;
  for (const sp of socketPaths) {
    try {
      fs.accessSync(sp);
      socketPath = sp;
      break;
    } catch {}
  }

  if (socketPath) {
    poolConfig.socketPath = socketPath;
    console.log(`[PRISMA] Using Unix socket: ${socketPath}`);
  } else {
    poolConfig.host = dbUrl.hostname || "localhost";
    poolConfig.port = parseInt(dbUrl.port || "3306");
    console.log(`[PRISMA] No socket found, using TCP: ${poolConfig.host}:${poolConfig.port}`);
  }

  const pool = mariadb.createPool(poolConfig);
  const adapter = new PrismaMariaDb(pool);
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
