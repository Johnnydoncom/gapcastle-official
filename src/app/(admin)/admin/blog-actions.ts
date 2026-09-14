"use server";

import { and, count, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categories, media, posts } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { idFrom, requireAdmin } from "@/lib/admin-guard";
import { getPostById } from "@/lib/blog";
import { slugify } from "@/lib/blog-shared";
import { db, dbErrorCode } from "@/lib/db";
import { sanitizePostHtml, wordCount } from "@/lib/html";
import { deleteMediaByIds, postsUsingMedia, storeImage, type StoredImage } from "@/lib/media";
import { fieldErrorsFrom, formDataToRecord } from "@/lib/validation";

const FIX_FIELDS = "Please fix the highlighted fields.";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: `Keep this under ${max} characters.` })
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .refine((v) => v === undefined || (Number.isInteger(v) && v > 0), { message: "Invalid selection." });

function revalidateBlog(...slugs: string[]) {
  revalidatePath("/blog");
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog", "layout");
}

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

const postSchema = z.object({
  id: optionalId,
  title: z
    .string()
    .trim()
    .min(3, { message: "Give the post a title." })
    .max(200, { message: "Keep the title under 200 characters." }),
  slug: optionalText(160),
  excerpt: optionalText(400),
  content: z.string().max(2_000_000, { message: "This post is too long." }),
  categoryId: z
    .string({ message: "Choose a category." })
    .transform(Number)
    .refine((v) => Number.isInteger(v) && v > 0, { message: "Choose a category." }),
  coverImageId: optionalId,
  coverAlt: optionalText(255),
  status: z.enum(["draft", "published"], { message: "Choose draft or published." }),
  isFeatured: z.string().optional(),
  publishedDate: optionalText(10).refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Use a valid date.",
  }),
  seoTitle: optionalText(200),
  seoDescription: optionalText(320),
});

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const values = formDataToRecord(formData);
  const fail = (fieldErrors: Record<string, string>, message = FIX_FIELDS): ActionState => ({
    status: "error",
    message,
    fieldErrors,
    values,
  });

  const parsed = postSchema.safeParse(values);
  if (!parsed.success) return fail(fieldErrorsFrom(parsed.error));
  const d = parsed.data;

  const content = sanitizePostHtml(d.content);
  if (wordCount(content) < 5) return fail({ content: "Write at least a few sentences before saving." });

  const existing = d.id ? await getPostById(d.id) : null;
  if (d.id && !existing) return { status: "error", message: "This post no longer exists." };

  const slug = slugify(d.slug || d.title);
  if (!slug) return fail({ slug: "The address needs at least one letter or number." });

  const [[clash], [category], [cover]] = await Promise.all([
    db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.slug, slug), ne(posts.id, existing?.id ?? 0)))
      .limit(1),
    db.select({ id: categories.id }).from(categories).where(eq(categories.id, d.categoryId)).limit(1),
    d.coverImageId
      ? db.select({ id: media.id }).from(media).where(eq(media.id, d.coverImageId)).limit(1)
      : Promise.resolve([{ id: 0 }]),
  ]);
  if (clash) return fail({ slug: "Another post already uses this address." });
  if (!category) return fail({ categoryId: "That category no longer exists." });
  if (!cover) return fail({ coverImageId: "That image is no longer in the media library." });

  // An explicitly changed date wins; otherwise keep the original timestamp, or stamp NOW() on first publish.
  let publishedAt: string | null = existing?.publishedAt ?? null;
  if (d.publishedDate && d.publishedDate !== publishedAt?.slice(0, 10)) publishedAt = `${d.publishedDate} 00:00:00`;
  const publishedValue = d.status === "published" && !publishedAt ? sql`NOW()` : publishedAt;

  const fields = {
    slug,
    title: d.title,
    excerpt: d.excerpt ?? null,
    content,
    category_id: d.categoryId,
    cover_image_id: d.coverImageId ?? null,
    cover_alt: d.coverImageId ? (d.coverAlt ?? null) : null,
    status: d.status,
    is_featured: d.isFeatured === "on" ? 1 : 0,
    seo_title: d.seoTitle ?? null,
    seo_description: d.seoDescription ?? null,
    published_at: publishedValue,
  };

  let id: number;
  if (existing) {
    await db.update(posts).set(fields).where(eq(posts.id, existing.id));
    id = existing.id;
  } else {
    const [created] = await db
      .insert(posts)
      .values({ ...fields, author_id: user.id })
      .$returningId();
    id = created.id;
  }

  if (fields.is_featured) await db.update(posts).set({ is_featured: 0 }).where(ne(posts.id, id));

  revalidateBlog(slug, ...(existing && existing.slug !== slug ? [existing.slug] : []));
  redirect(`/admin/blog/${id}?${existing ? "saved" : "created"}=1`);
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const post = id ? await getPostById(id) : null;

  if (post) {
    await db.delete(posts).where(eq(posts.id, post.id));
    revalidateBlog(post.slug);
  }
  redirect("/admin/blog?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export type UploadResult = { ok: true; image: StoredImage } | { ok: false; error: string };

/** Called directly from the editor and media library, not through a form. */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const user = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image to upload." };

  try {
    const stored = await storeImage(file, user.id);
    if ("error" in stored) return { ok: false, error: stored.error };
    revalidatePath("/admin/media");
    return { ok: true, image: stored };
  } catch (error) {
    console.error("[admin] upload failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "The upload failed. Please try again." };
  }
}

export async function uploadMediaForm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { status: "error", message: "Choose at least one image." };

  const user = await requireAdmin();
  const problems: string[] = [];
  let uploaded = 0;
  for (const file of files.slice(0, 10)) {
    const stored = await storeImage(file, user.id);
    if ("error" in stored) problems.push(`${file.name}: ${stored.error}`);
    else uploaded++;
  }

  revalidatePath("/admin/media");
  if (problems.length) {
    return { status: "error", message: `${uploaded} uploaded. ${problems.join(" ")}` };
  }
  return { status: "success", message: `${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.` };
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;

  if ((await postsUsingMedia(id)).length) redirect(`/admin/media?in-use=${id}`);
  await deleteMediaByIds([id]);
  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

const categorySchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2, { message: "Enter a name." }).max(80, { message: "Keep the name under 80 characters." }),
  slug: optionalText(100),
  description: optionalText(300),
});

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const values = formDataToRecord(formData);
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: FIX_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error), values };
  const d = parsed.data;

  const slug = slugify(d.slug || d.name, 100);
  if (!slug) return { status: "error", message: FIX_FIELDS, fieldErrors: { slug: "Use at least one letter or number." }, values };

  const fields = { name: d.name, slug, description: d.description ?? null };
  try {
    if (d.id) await db.update(categories).set(fields).where(eq(categories.id, d.id));
    else await db.insert(categories).values(fields);
  } catch (error) {
    if (dbErrorCode(error) === "ER_DUP_ENTRY") {
      return {
        status: "error",
        message: FIX_FIELDS,
        fieldErrors: { name: "Another category already uses this name or address." },
        values,
      };
    }
    throw error;
  }

  revalidateBlog();
  return { status: "success", message: d.id ? `“${d.name}” updated.` : `“${d.name}” added.` };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;

  const [{ n }] = await db.select({ n: count() }).from(posts).where(eq(posts.category_id, id));
  if (n > 0) redirect(`/admin/blog/categories?in-use=${id}`);

  await db.delete(categories).where(eq(categories.id, id));
  revalidateBlog();
  redirect("/admin/blog/categories?deleted=1");
}
