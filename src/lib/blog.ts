import { and, asc, count, desc, eq, isNotNull, like, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { categories, posts, users } from "@/db/schema";
import { mediaUrl } from "@/lib/blog-shared";
import { db } from "@/lib/db";

export { slugify } from "@/lib/blog-shared";

export type PostStatus = "draft" | "published";
export type CategoryRef = { id: number; name: string; slug: string };

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: CategoryRef;
  authorId: number | null;
  authorName: string;
  coverImageId: number | null;
  coverUrl: string | null;
  coverAlt: string;
  status: PostStatus;
  isFeatured: boolean;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** ~220 words a minute at ~6 characters a word, measured on the text without tags. */
const readingMinutes = sql<string>`CAST(GREATEST(1, ROUND(CHAR_LENGTH(REGEXP_REPLACE(${posts.content}, '<[^>]*>', '')) / 1320)) AS UNSIGNED)`;

const fullColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  content: posts.content,
  category_id: categories.id,
  category_name: categories.name,
  category_slug: categories.slug,
  author_id: posts.author_id,
  author_name: users.name,
  cover_image_id: posts.cover_image_id,
  cover_alt: posts.cover_alt,
  status: posts.status,
  is_featured: posts.is_featured,
  reading_minutes: readingMinutes,
  seo_title: posts.seo_title,
  seo_description: posts.seo_description,
  published_at: posts.published_at,
  created_at: posts.created_at,
  updated_at: posts.updated_at,
};

/** The same columns with the (potentially large) body blanked out — for listings. */
const summaryColumns = { ...fullColumns, content: sql<string>`''` };

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  author_id: number | null;
  author_name: string | null;
  cover_image_id: number | null;
  cover_alt: string | null;
  status: PostStatus;
  is_featured: number;
  reading_minutes: string | number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const toPost = (r: PostRow): BlogPost => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? "",
  content: r.content,
  category: { id: r.category_id, name: r.category_name, slug: r.category_slug },
  authorId: r.author_id,
  authorName: r.author_name ?? "Gap Castle",
  coverImageId: r.cover_image_id,
  coverUrl: r.cover_image_id ? mediaUrl(r.cover_image_id) : null,
  coverAlt: r.cover_alt ?? "",
  status: r.status,
  isFeatured: Boolean(r.is_featured),
  readingMinutes: Number(r.reading_minutes) || 1,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function selectPosts(summary: boolean) {
  return db
    .select(summary ? summaryColumns : fullColumns)
    .from(posts)
    .innerJoin(categories, eq(posts.category_id, categories.id))
    .leftJoin(users, eq(posts.author_id, users.id))
    .$dynamic();
}

const published = () =>
  and(eq(posts.status, "published"), isNotNull(posts.published_at), lte(posts.published_at, sql`NOW()`));

const positiveInt = (value: number, fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

export async function listPublishedPosts(options: { categorySlug?: string; page?: number; perPage?: number } = {}) {
  const page = positiveInt(options.page ?? 1, 1);
  const perPage = positiveInt(options.perPage ?? 9, 9, 50);
  const where = options.categorySlug ? and(published(), eq(categories.slug, options.categorySlug)) : published();

  const [rows, [total]] = await Promise.all([
    selectPosts(true)
      .where(where)
      .orderBy(desc(posts.published_at), desc(posts.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ n: count() })
      .from(posts)
      .innerJoin(categories, eq(posts.category_id, categories.id))
      .where(where),
  ]);

  return { posts: rows.map(toPost), total: total?.n ?? 0, page, perPage };
}

export async function getPublishedPostBySlug(slug: string) {
  const [row] = await selectPosts(false)
    .where(and(eq(posts.slug, slug), published()))
    .limit(1);
  return row ? toPost(row) : null;
}

/** Categories that have at least one published post, with counts. */
export async function listPublishedCategories() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug, n: count(posts.id) })
    .from(categories)
    .innerJoin(posts, and(eq(posts.category_id, categories.id), published()))
    .groupBy(categories.id, categories.name, categories.slug)
    .orderBy(desc(count(posts.id)), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug, description: categories.description })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const rows = await selectPosts(true)
    .where(and(published(), ne(posts.id, post.id)))
    .orderBy(desc(sql`${posts.category_id} = ${post.category.id}`), desc(posts.published_at))
    .limit(positiveInt(limit, 3, 12));
  return rows.map(toPost);
}

export async function listPublishedSlugs() {
  return db
    .select({ slug: posts.slug, updated_at: posts.updated_at })
    .from(posts)
    .where(published())
    .orderBy(desc(posts.published_at));
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const ADMIN_POSTS_PER_PAGE = 20;

export async function listAllPosts(filters: { status?: string; categoryId?: number; q?: string; page?: number } = {}) {
  const conditions: SQL[] = [];
  if (filters.status === "draft" || filters.status === "published") conditions.push(eq(posts.status, filters.status));
  if (filters.categoryId) conditions.push(eq(posts.category_id, filters.categoryId));
  if (filters.q) {
    const pattern = `%${filters.q.slice(0, 80)}%`;
    const match = or(like(posts.title, pattern), like(posts.slug, pattern));
    if (match) conditions.push(match);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const page = positiveInt(filters.page ?? 1, 1);

  const [rows, [total], statusCounts] = await Promise.all([
    selectPosts(true)
      .where(where)
      .orderBy(desc(posts.updated_at), desc(posts.id))
      .limit(ADMIN_POSTS_PER_PAGE)
      .offset((page - 1) * ADMIN_POSTS_PER_PAGE),
    db.select({ n: count() }).from(posts).where(where),
    db.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status),
  ]);

  const countFor = (s: PostStatus) => statusCounts.find((r) => r.status === s)?.n ?? 0;
  return {
    posts: rows.map(toPost),
    total: total?.n ?? 0,
    page,
    counts: { published: countFor("published"), draft: countFor("draft") },
  };
}

export async function getPostById(id: number) {
  const [row] = await selectPosts(false).where(eq(posts.id, id)).limit(1);
  return row ? toPost(row) : null;
}

export type CategoryWithCount = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  posts: number;
  published: number;
};

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      posts: count(posts.id),
      published: sql<string>`COALESCE(SUM(${posts.status} = 'published'), 0)`,
    })
    .from(categories)
    .leftJoin(posts, eq(posts.category_id, categories.id))
    .groupBy(categories.id, categories.name, categories.slug, categories.description)
    .orderBy(asc(categories.name));
  return rows.map((r) => ({ ...r, published: Number(r.published) }));
}

export async function listCategoryOptions(): Promise<CategoryRef[]> {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.name));
}
