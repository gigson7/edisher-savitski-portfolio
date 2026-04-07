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

  const mariadb = require("mariadb");
  const dbUrl = new URL(url);

  const host = dbUrl.hostname || "localhost";
  const port = parseInt(dbUrl.port || "3306");
  const user = decodeURIComponent(dbUrl.username);
  const password = decodeURIComponent(dbUrl.password);
  const database = dbUrl.pathname.slice(1);

  console.log(`[PRISMA] Connecting to MySQL: host=${host} port=${port} user=${user} db=${database}`);

  // Test raw connection first
  mariadb.createConnection({ host, port, user, password, database, connectTimeout: 5000 })
    .then((conn: { end: () => void }) => {
      console.log("[PRISMA] ✓ Direct MySQL connection successful!");
      conn.end();
    })
    .catch((err: Error) => {
      console.error("[PRISMA] ✗ Direct MySQL connection FAILED:", err.message);
    });

  const pool = mariadb.createPool({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 2,
    minimumIdle: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
  });
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
