import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { AdminHeading, DatabaseError, EmptyState, Notice, Pagination, Panel, param } from "@/components/admin/ui";
import { CopyButton } from "@/components/shared/copy-button";
import { formatDate } from "@/lib/format";
import { listMedia, postsUsingMedia } from "@/lib/media";
import { deleteMedia } from "../../blog-actions";

export const metadata: Metadata = { title: "Media library" };

const PER_PAGE = 36;

const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  const sp = await searchParams;
  const page = Number(param(sp, "page") ?? 1);
  const inUseId = Number(param(sp, "in-use"));

  let result: Awaited<ReturnType<typeof listMedia>>;
  let usedBy: Awaited<ReturnType<typeof postsUsingMedia>> = [];
  try {
    [result, usedBy] = await Promise.all([listMedia({ page, perPage: PER_PAGE }), inUseId ? postsUsingMedia(inUseId) : Promise.resolve([])]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Media library" description={`${result.total} image${result.total === 1 ? "" : "s"} · used for blog covers and inside posts`} />

      {usedBy.length > 0 && (
        <Notice tone="error">
          That image is still used by {usedBy.map((p) => `“${p.title}”`).join(", ")}. Replace it there before deleting it.
        </Notice>
      )}
      {param(sp, "deleted") && <Notice tone="info">The image was deleted.</Notice>}

      <Panel className="p-5 sm:p-6">
        <MediaUploadForm />
      </Panel>

      <Panel>
        {result.items.length === 0 ? (
          <EmptyState>No images yet. Upload one above, or add images while writing a post.</EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-px bg-castle-100 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {result.items.map((item) => (
              <li key={item.id} className="flex flex-col bg-white">
                <a href={item.url} target="_blank" rel="noreferrer" className="block bg-castle-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of uploaded files */}
                  <img src={item.url} alt={item.filename} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </a>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="truncate text-sm font-semibold" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-xs text-ink/55">
                    {fileSize(item.byteSize)} · {formatDate(item.createdAt)}
                    {item.uploadedBy && <span className="block truncate">by {item.uploadedBy}</span>}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <CopyButton value={item.url} label="Copy URL" className="h-8 px-3 text-xs" />
                    <form action={deleteMedia}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton message={`Delete ${item.filename}? This cannot be undone.`} className="text-xs font-semibold text-red-700 hover:underline">
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/media" params={{}} />
      </Panel>
    </div>
  );
}
