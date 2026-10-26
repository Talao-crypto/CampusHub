import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDb = globalThis as unknown as { campusDb?: PrismaClient };

export function getDb(): PrismaClient {
  if (globalDb.campusDb) return globalDb.campusDb;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
    log: [],
  });
  globalDb.campusDb = db;
  return db;
}
