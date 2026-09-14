import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

export type Database = MySql2Database<typeof schema>;

/*
 * One pool per server instance, cached on globalThis so dev-mode hot reloads
 * do not open a new pool on every edit. On Vercel each function instance keeps
 * a small pool, and attachDatabasePool lets idle connections close cleanly
 * before the instance is suspended.
 */
const globalForDb = globalThis as unknown as { __gapcastlePool?: mysql.Pool; __gapcastleDb?: Database };

function createPool() {
  const onVercel = Boolean(process.env.VERCEL);
  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "gapcastle_web",
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
        : undefined,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? (onVercel ? 3 : 10)),
    maxIdle: onVercel ? 1 : 5,
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 15_000,
    dateStrings: true,
    charset: "utf8mb4",
  });
  if (onVercel) {
    // attachDatabasePool recognises mysql2's core pool (it reads config.connectionConfig),
    // not the promise wrapper around it. Never let it break a build or a request.
    try {
      attachDatabasePool(pool.pool);
    } catch (error) {
      console.warn("[db] attachDatabasePool skipped:", error instanceof Error ? error.message : error);
    }
  }
  return pool;
}

globalForDb.__gapcastlePool ??= createPool();
globalForDb.__gapcastleDb ??= drizzle({ client: globalForDb.__gapcastlePool, schema, mode: "default" });

export const db: Database = globalForDb.__gapcastleDb;

/** MySQL error code, whether the driver error is thrown directly or wrapped by Drizzle. */
export function dbErrorCode(error: unknown): string | undefined {
  const e = error as { code?: string; cause?: { code?: string } } | null | undefined;
  return e?.code ?? e?.cause?.code;
}

/** A DATETIME literal in UTC ("YYYY-MM-DD HH:MM:SS"), for values the application compares itself. */
export function utcDateTime(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/** Parses a UTC DATETIME string written by utcDateTime() back into epoch milliseconds. */
export function parseUtcDateTime(value: string) {
  return Date.parse(`${value.replace(" ", "T")}Z`);
}

/** Short, human-readable reference such as GC-SCH-7K4Q2M, safe to read over the phone. */
export function makeReference(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `GC-${prefix}-${code}`;
}
