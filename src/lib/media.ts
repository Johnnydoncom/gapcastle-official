import { count, desc, eq, inArray, like, or } from "drizzle-orm";
import { media, posts, users } from "@/db/schema";
import { MAX_IMAGE_BYTES, mediaUrl } from "@/lib/blog-shared";
import { db } from "@/lib/db";

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

/** Trust the file's bytes, not its name or the browser-reported type. */
export function sniffImageType(bytes: Buffer): ImageMime | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}

export type StoredImage = { id: number; url: string; filename: string };

/** Validates and stores an uploaded image. Returns the stored image or a message explaining the problem. */
export async function storeImage(file: File, uploadedBy: number | null): Promise<StoredImage | { error: string }> {
  if (file.size === 0) return { error: "Choose an image to upload." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images must be 3 MB or smaller." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffImageType(bytes);
  if (!mimeType) return { error: "Upload a JPEG, PNG or WebP image." };

  const filename = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 200) || "upload";
  const [stored] = await db
    .insert(media)
    .values({ filename, mime_type: mimeType, byte_size: bytes.length, data: bytes, uploaded_by: uploadedBy })
    .$returningId();
  return { id: stored.id, url: mediaUrl(stored.id), filename };
}

export type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  uploadedBy: string | null;
  createdAt: string;
};

export async function listMedia(options: { page?: number; perPage?: number } = {}) {
  const perPage = Math.min(Math.max(options.perPage ?? 48, 1), 200);
  const page = Number.isInteger(options.page) && (options.page ?? 0) > 0 ? options.page! : 1;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: media.id,
        filename: media.filename,
        mime_type: media.mime_type,
        byte_size: media.byte_size,
        uploaded_by: users.name,
        created_at: media.created_at,
      })
      .from(media)
      .leftJoin(users, eq(media.uploaded_by, users.id))
      .orderBy(desc(media.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ n: count() }).from(media),
  ]);

  const items: MediaItem[] = rows.map((r) => ({
    id: r.id,
    url: mediaUrl(r.id),
    filename: r.filename,
    mimeType: r.mime_type,
    byteSize: r.byte_size,
    uploadedBy: r.uploaded_by,
    createdAt: r.created_at,
  }));
  return { items, total: total?.n ?? 0, page, perPage };
}

/** Posts that use an image, either as the cover or inside the article body. */
export async function postsUsingMedia(id: number) {
  return db
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(
      or(
        eq(posts.cover_image_id, id),
        // match the exact id: "/media/12" followed by a quote, so /media/120 does not count
        like(posts.content, `%/media/${id}"%`),
      ),
    )
    .limit(20);
}

/** Of the given ids, the ones not used by any post — safe to delete. */
export async function unusedMediaIds(ids: number[]) {
  const unused: number[] = [];
  for (const id of ids) if ((await postsUsingMedia(id)).length === 0) unused.push(id);
  return unused;
}

export async function deleteMediaByIds(ids: number[]) {
  if (ids.length) await db.delete(media).where(inArray(media.id, ids));
}
