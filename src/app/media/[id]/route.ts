import { eq } from "drizzle-orm";
import { media } from "@/db/schema";
import { db } from "@/lib/db";

/** Serves images uploaded through the blog editor. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });

  const [file] = await db
    .select({ mime_type: media.mime_type, data: media.data, byte_size: media.byte_size })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime_type,
      "Content-Length": String(file.byte_size),
      // an uploaded file never changes: a new upload always gets a new id
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
