import type { Metadata } from "next";
import Link from "next/link";
import { PostEditor } from "@/components/admin/post-editor";
import { AdminHeading, DatabaseError, Notice } from "@/components/admin/ui";
import { listCategoryOptions } from "@/lib/blog";
import { listMedia } from "@/lib/media";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  let categories: Awaited<ReturnType<typeof listCategoryOptions>>;
  let library: Awaited<ReturnType<typeof listMedia>>;
  try {
    [categories, library] = await Promise.all([listCategoryOptions(), listMedia({ perPage: 60 })]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading back={{ href: "/admin/blog", label: "All posts" }} title="New post" description="Save as a draft while you work; publish when it is ready." />
      {categories.length === 0 ? (
        <Notice tone="info">
          Posts need a category.{" "}
          <Link href="/admin/blog/categories" className="underline">
            Create a category
          </Link>{" "}
          first.
        </Notice>
      ) : (
        <PostEditor post={null} categories={categories} library={library.items} />
      )}
    </div>
  );
}
