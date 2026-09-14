"use client";

import { useActionState, useCallback, useState, type ReactNode } from "react";
import { savePost } from "@/app/(admin)/admin/blog-actions";
import { MediaDialog, type LibraryImage } from "@/components/admin/media-dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormAlert, SubmitButton } from "@/components/forms/fields";
import { initialActionState } from "@/lib/action-state";
import type { BlogPost, CategoryRef } from "@/lib/blog";
import { mediaUrl, slugify } from "@/lib/blog-shared";
import { cn } from "@/lib/cn";

type EditorPost = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "content"
  | "category"
  | "coverImageId"
  | "coverAlt"
  | "status"
  | "isFeatured"
  | "publishedAt"
  | "seoTitle"
  | "seoDescription"
>;

const control =
  "w-full rounded-xl border border-castle-200 bg-white px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-castle-500 focus:ring-4 focus:ring-castle-600/12";

export function PostEditor({
  post,
  categories,
  library: initialLibrary,
}: {
  post: EditorPost | null;
  categories: CategoryRef[];
  library: LibraryImage[];
}) {
  const [state, formAction] = useActionState(savePost, initialActionState);
  const v = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  const [title, setTitle] = useState(v.title ?? post?.title ?? "");
  const [slug, setSlug] = useState(v.slug ?? post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post || v.slug));
  const [content, setContent] = useState(v.content ?? post?.content ?? "");
  const [excerpt, setExcerpt] = useState(v.excerpt ?? post?.excerpt ?? "");
  const [status, setStatus] = useState(v.status ?? post?.status ?? "draft");
  const [coverId, setCoverId] = useState<number | null>(v.coverImageId ? Number(v.coverImageId) : (post?.coverImageId ?? null));
  const [coverAlt, setCoverAlt] = useState(v.coverAlt ?? post?.coverAlt ?? "");
  const [coverDialog, setCoverDialog] = useState(false);
  const [library, setLibrary] = useState(initialLibrary);

  const addToLibrary = useCallback(
    (image: LibraryImage) => setLibrary((items) => (items.some((i) => i.id === image.id) ? items : [image, ...items])),
    [],
  );

  const shownSlug = slugEdited ? slug : slugify(title);
  const saveLabel = post ? (status === "published" && post.status === "draft" ? "Publish" : "Save changes") : status === "published" ? "Publish post" : "Create post";

  return (
    <form action={formAction} className="grid items-start gap-6 pb-24 lg:grid-cols-12 lg:pb-0">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="coverImageId" value={coverId ?? ""} />

      {/* ================= main column ================= */}
      <div className="min-w-0 space-y-6 lg:col-span-8">
        {state.status === "error" && <FormAlert message={state.message} />}

        <Card>
          <label htmlFor="post-title" className="text-sm font-semibold">
            Title
          </label>
          <input
            id="post-title"
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A clear, specific headline"
            aria-invalid={errors.title ? true : undefined}
            className={cn(control, "mt-2 h-14 font-display text-xl font-semibold sm:text-2xl")}
          />
          <FieldError message={errors.title} />

          <label htmlFor="post-slug" className="mt-5 block text-sm font-semibold">
            Web address
          </label>
          <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-castle-200 bg-castle-50 focus-within:border-castle-500 focus-within:ring-4 focus-within:ring-castle-600/12">
            <span className="shrink-0 pl-3 text-sm text-ink/60 sm:pl-4">/blog/</span>
            <input
              id="post-slug"
              name="slug"
              value={shownSlug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(slugify(shownSlug))}
              placeholder="post-address"
              aria-invalid={errors.slug ? true : undefined}
              className="h-11 w-full min-w-0 bg-transparent px-1 text-[15px] outline-none"
            />
          </div>
          <FieldError message={errors.slug} />

          <div className="mt-5 flex items-baseline justify-between">
            <label htmlFor="post-excerpt" className="text-sm font-semibold">
              Summary
            </label>
            <span className="text-xs text-ink/60 tabular-nums">{excerpt.length}/400</span>
          </div>
          <textarea
            id="post-excerpt"
            name="excerpt"
            rows={3}
            maxLength={400}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="One or two sentences shown on the blog page and in search results."
            className={cn(control, "mt-2 resize-y py-3 leading-relaxed")}
          />
          <FieldError message={errors.excerpt} />
        </Card>

        <div>
          <p id="post-content-label" className="mb-2 text-sm font-semibold">
            Content
          </p>
          <RichTextEditor
            initialContent={content}
            onChange={setContent}
            library={library}
            onLibraryAdd={addToLibrary}
            invalid={Boolean(errors.content)}
            describedBy={errors.content ? "post-content-error" : undefined}
          />
          <FieldError id="post-content-error" message={errors.content} />
        </div>

        <Card>
          <details open={Boolean(post?.seoTitle || post?.seoDescription || errors.seoTitle || errors.seoDescription)}>
            <summary className="cursor-pointer text-sm font-semibold">Search appearance (optional)</summary>
            <label htmlFor="post-seo-title" className="mt-4 block text-sm font-semibold">
              SEO title
            </label>
            <input
              id="post-seo-title"
              name="seoTitle"
              maxLength={200}
              defaultValue={v.seoTitle ?? post?.seoTitle ?? ""}
              placeholder={title || "Defaults to the post title"}
              className={cn(control, "mt-2 h-11")}
            />
            <FieldError message={errors.seoTitle} />
            <label htmlFor="post-seo-description" className="mt-4 block text-sm font-semibold">
              SEO description
            </label>
            <textarea
              id="post-seo-description"
              name="seoDescription"
              rows={2}
              maxLength={320}
              defaultValue={v.seoDescription ?? post?.seoDescription ?? ""}
              placeholder="Defaults to the summary"
              className={cn(control, "mt-2 resize-y py-3")}
            />
            <FieldError message={errors.seoDescription} />
          </details>
        </Card>
      </div>

      {/* ================= sidebar ================= */}
      <aside className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:col-span-4">
        <Card>
          <p className="text-sm font-semibold">Status</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["draft", "published"] as const).map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-castle-200 px-3 py-2.5 text-sm font-semibold has-[:checked]:border-castle-600 has-[:checked]:bg-castle-50"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-castle-600"
                />
                {s === "draft" ? "Draft" : "Published"}
              </label>
            ))}
          </div>

          <label htmlFor="post-date" className="mt-5 block text-sm font-semibold">
            Publish date
          </label>
          <input
            id="post-date"
            type="date"
            name="publishedDate"
            defaultValue={v.publishedDate ?? post?.publishedAt?.slice(0, 10) ?? ""}
            className={cn(control, "mt-2 h-11")}
          />
          <p className="mt-1.5 text-xs text-ink/60">Leave empty to use the moment you publish.</p>
          <FieldError message={errors.publishedDate} />

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={v.isFeatured ? v.isFeatured === "on" : post?.isFeatured}
              className="h-4 w-4 accent-castle-600"
            />
            Feature at the top of the blog
          </label>

          <div className="mt-6 hidden border-t border-castle-100 pt-5 lg:block">
            <SubmitButton pendingLabel="Saving…" className="w-full">
              {saveLabel}
            </SubmitButton>
          </div>
        </Card>

        <Card>
          <label htmlFor="post-category" className="text-sm font-semibold">
            Category
          </label>
          <select
            id="post-category"
            name="categoryId"
            defaultValue={v.categoryId ?? post?.category.id ?? categories[0]?.id}
            aria-invalid={errors.categoryId ? true : undefined}
            className={cn(control, "mt-2 h-11 cursor-pointer")}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId} />
        </Card>

        <Card>
          <p className="text-sm font-semibold">Cover image</p>
          <button
            type="button"
            onClick={() => setCoverDialog(true)}
            className="group mt-3 block w-full overflow-hidden rounded-xl border border-castle-100 bg-castle-50"
          >
            {coverId ? (
              // eslint-disable-next-line @next/next/no-img-element -- previews a library image
              <img src={mediaUrl(coverId)} alt="" className="aspect-[16/10] w-full object-cover transition-opacity group-hover:opacity-85" />
            ) : (
              <span className="grid aspect-[16/10] place-items-center text-sm font-semibold text-castle-600">Choose a cover image</span>
            )}
          </button>
          <FieldError message={errors.coverImageId} />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCoverDialog(true)}
              className="rounded-full border border-castle-200 px-4 py-2 text-sm font-semibold text-castle-700 hover:bg-castle-50"
            >
              {coverId ? "Change" : "Upload or choose"}
            </button>
            {coverId && (
              <button type="button" onClick={() => setCoverId(null)} className="rounded-full px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                Remove
              </button>
            )}
          </div>

          {coverId && (
            <>
              <label htmlFor="post-cover-alt" className="mt-4 block text-sm font-semibold">
                Image description
              </label>
              <input
                id="post-cover-alt"
                name="coverAlt"
                maxLength={255}
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="What the photo shows, for screen readers"
                className={cn(control, "mt-2 h-10 text-sm")}
              />
            </>
          )}
        </Card>
      </aside>

      {/* ================= mobile save bar ================= */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-castle-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <span className="text-sm text-ink/60">{status === "published" ? "Will be live" : "Saved as draft"}</span>
          <SubmitButton pendingLabel="Saving…" className="px-6 py-3">
            {saveLabel}
          </SubmitButton>
        </div>
      </div>

      <MediaDialog
        open={coverDialog}
        title="Cover image"
        confirmLabel="Use as cover"
        withAlt
        library={library}
        onUploaded={addToLibrary}
        onClose={() => setCoverDialog(false)}
        onSelect={(image, alt) => {
          setCoverId(image.id);
          if (alt) setCoverAlt(alt);
          setCoverDialog(false);
        }}
      />
    </form>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-castle-100 bg-white p-5 sm:rounded-3xl sm:p-6">{children}</div>;
}

function FieldError({ message, id }: { message?: string; id?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-[13px] font-medium text-red-700">
      {message}
    </p>
  ) : null;
}
