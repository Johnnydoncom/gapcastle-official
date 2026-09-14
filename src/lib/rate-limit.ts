import { eq, lt, sql } from "drizzle-orm";
import { rateLimits } from "@/db/schema";
import { db } from "@/lib/db";

/**
 * Fixed-window limiter stored in the database, so the limit holds across every
 * serverless instance. Fails open: if the check itself cannot run, the request
 * proceeds (and will fail on its own if the database is really down).
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const bucket = key.slice(0, 191);
  const seconds = Math.max(1, Math.round(windowMs / 1000));

  try {
    // hits is assigned before window_start, so both IF()s compare against the old window.
    await db.execute(sql`
      INSERT INTO ${rateLimits} (bucket, hits, window_start) VALUES (${bucket}, 1, NOW())
      ON DUPLICATE KEY UPDATE
        hits = IF(window_start < NOW() - INTERVAL ${seconds} SECOND, 1, hits + 1),
        window_start = IF(window_start < NOW() - INTERVAL ${seconds} SECOND, NOW(), window_start)
    `);

    const [row] = await db
      .select({ hits: rateLimits.hits })
      .from(rateLimits)
      .where(eq(rateLimits.bucket, bucket))
      .limit(1);

    if (Math.random() < 0.02) {
      await db.delete(rateLimits).where(lt(rateLimits.window_start, sql`NOW() - INTERVAL 1 DAY`));
    }

    return (row?.hits ?? 0) <= limit;
  } catch (error) {
    console.error("[rate-limit] check failed, allowing request:", error instanceof Error ? error.message : error);
    return true;
  }
}
