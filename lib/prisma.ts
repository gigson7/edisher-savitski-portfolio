import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Limit connection pool to reduce thread usage on shared hosting
  const dbUrl = new URL(url);
  dbUrl.searchParams.set("connectionLimit", "2");
  dbUrl.searchParams.set("minimumIdle", "1");
  const adapter = new PrismaMariaDb(dbUrl.toString());
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
