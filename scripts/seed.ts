// Seeds the default admin user, settings, blog categories and starter posts.
// Safe to run repeatedly: nothing that already exists is overwritten.
//   npm run db:seed
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { count, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../src/db/schema";
import { categories, media, posts, siteSettings, users } from "../src/db/schema";
import { starterCategories } from "../src/db/seed/categories";
import { starterPosts } from "../src/db/seed/posts";
import defaultSettings from "../src/db/seed/settings.json";
import { sanitizePostHtml } from "../src/lib/html";
import { hashPassword, passwordProblem } from "../src/lib/password";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function main() {
  const database = process.env.DB_NAME ?? "gapcastle_web";
  const host = process.env.DB_HOST ?? "127.0.0.1";
  console.log(`→ seeding ${database} on ${host}:${process.env.DB_PORT ?? 3306}`);

  const pool = mysql.createPool({
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    connectionLimit: 2,
    connectTimeout: 20_000,
    dateStrings: true,
    charset: "utf8mb4",
  });
  const db = drizzle({ client: pool, schema, mode: "default" });

  try {
    /* --- default admin -------------------------------------------------- */
    const [{ n: userCount }] = await db.select({ n: count() }).from(users);
    let authorId: number | null = null;

    if (userCount === 0) {
      const email = (process.env.ADMIN_EMAIL || "admin@gapcastle.com").trim().toLowerCase();
      const fromEnv = Boolean(process.env.ADMIN_PASSWORD);
      const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url");
      const problem = passwordProblem(password);
      if (problem) throw new Error(`ADMIN_PASSWORD: ${problem}`);

      const [created] = await db
        .insert(users)
        .values({
          name: process.env.ADMIN_NAME || "Gap Castle Admin",
          email,
          password: await hashPassword(password),
          role: "admin",
        })
        .$returningId();
      authorId = created.id;
      console.log(`✓ Default admin created: ${email}`);
      console.log(fromEnv ? "   password: the ADMIN_PASSWORD value from your environment" : `   generated password (shown once): ${password}`);
    } else {
      const [first] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).orderBy(users.id).limit(1);
      authorId = first?.id ?? null;
      console.log(`• ${userCount} user(s) already exist — left unchanged`);
    }

    /* --- settings: only missing keys are added -------------------------- */
    await db
      .insert(siteSettings)
      .ignore()
      .values(Object.entries(defaultSettings).map(([setting_key, setting_value]) => ({ setting_key, setting_value })));
    console.log(`✓ Settings — ${Object.keys(defaultSettings).length} defaults ensured`);

    /* --- categories: only missing ones are added ------------------------ */
    await db.insert(categories).ignore().values(starterCategories);
    const categoryRows = await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(inArray(categories.slug, starterCategories.map((c) => c.slug)));
    const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));
    console.log(`✓ Categories — ${starterCategories.length} defaults ensured`);

    /* --- starter posts, with covers copied into the media library ------- */
    const [{ n: postCount }] = await db.select({ n: count() }).from(posts);
    if (postCount === 0) {
      for (const { days_ago, category, cover, ...post } of starterPosts) {
        const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.filename, cover.file)).limit(1);
        let coverId = existing?.id ?? null;
        if (!coverId) {
          const bytes = readFileSync(join("public", "images", cover.file));
          const [stored] = await db
            .insert(media)
            .values({
              filename: cover.file,
              mime_type: MIME[cover.file.slice(cover.file.lastIndexOf(".")).toLowerCase()] ?? "image/jpeg",
              byte_size: bytes.length,
              data: bytes,
              uploaded_by: authorId,
            })
            .$returningId();
          coverId = stored.id;
        }

        const catId = categoryId.get(category);
        if (!catId) throw new Error(`Starter post "${post.slug}" uses unknown category "${category}".`);

        await db.insert(posts).values({
          ...post,
          content: sanitizePostHtml(post.content),
          category_id: catId,
          author_id: authorId,
          cover_image_id: coverId,
          cover_alt: cover.alt,
          status: "published",
          published_at: sql`NOW() - INTERVAL ${days_ago} DAY`,
        });
      }
      console.log(`✓ Blog — ${starterPosts.length} starter posts published`);
    } else {
      console.log(`• Blog already has ${postCount} post(s) — no starter posts added`);
    }

    console.log("Done.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const code = error?.code ?? error?.cause?.code;
  console.error(`✗ Seed failed: ${code ? `${code} — ` : ""}${error?.message ?? error}`);
  process.exit(1);
});
