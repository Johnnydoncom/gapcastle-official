import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconExternal, IconTrash } from "@/components/admin/admin-icons";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PostEditor } from "@/components/admin/post-editor";
import { AdminHeading, DatabaseError, Notice, dangerButton, param, secondaryButton } from "@/components/admin/ui";
import { getPostById, listCategoryOptions } from "@/lib/blog";
import { formatDateTime } from "@/lib/format";
import { listMedia } from "@/lib/media";
import { deletePost } from "../../../blog-actions";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const sp = await searchParams;

  let post: Awaited<ReturnType<typeof getPostById>>;
  let categories: Awaited<ReturnType<typeof listCategoryOptions>>;
  let library: Awaited<ReturnType<typeof listMedia>>;
  try {
    [post, categories, library] = await Promise.all([getPostById(id), listCategoryOptions(), listMedia({ perPage: 60 })]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }
  if (!post) notFound();

  const created = param(sp, "created");
  const saved = param(sp, "saved");

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading
        back={{ href: "/admin/blog", label: "All posts" }}
        title="Edit post"
        description={`By ${post.authorName} · last updated ${formatDateTime(post.updatedAt)}`}
      >
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className={secondaryButton}>
            <IconExternal className="h-4 w-4" /> View on site
          </Link>
        )}
        <form action={deletePost}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message={`Delete "${post.title}"? This cannot be undone.`} className={dangerButton}>
            <IconTrash className="h-4 w-4" /> Delete
          </ConfirmButton>
        </form>
      </AdminHeading>

      {(created || saved) && (
        <Notice>
          {created ? "Post created." : "Changes saved."}{" "}
          {post.status === "published" ? "It is live on the blog." : "It is saved as a draft and not visible on the site."}
        </Notice>
      )}

      {/* keyed on updatedAt so the editor reloads fresh values after every save */}
      <PostEditor key={`${post.id}-${post.updatedAt}`} post={post} categories={categories} library={library.items} />
    </div>
  );
}
