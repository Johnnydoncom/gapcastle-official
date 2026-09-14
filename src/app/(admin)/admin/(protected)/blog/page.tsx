import type { Metadata } from "next";
import Link from "next/link";
import { IconPlus } from "@/components/admin/admin-icons";
import {
  AdminHeading,
  DatabaseError,
  EmptyState,
  FilterTabs,
  Notice,
  Pagination,
  Panel,
  StatusBadge,
  param,
  primaryButton,
} from "@/components/admin/ui";
import { ADMIN_POSTS_PER_PAGE, listAllPosts, listCategoryOptions } from "@/lib/blog";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Posts" };

export default async function AdminBlogPage({ searchParams }: PageProps<"/admin/blog">) {
  const sp = await searchParams;
  const status = param(sp, "status");
  const categoryId = Number(param(sp, "category")) || undefined;
  const q = param(sp, "q")?.trim() || undefined;
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listAllPosts>>;
  let categories: Awaited<ReturnType<typeof listCategoryOptions>>;
  try {
    [result, categories] = await Promise.all([listAllPosts({ status, categoryId, q, page }), listCategoryOptions()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const all = result.counts.published + result.counts.draft;
  const control = "h-11 rounded-xl border border-castle-200 bg-white px-3 text-[15px] outline-none focus:border-castle-500";

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Posts" description={`${result.counts.published} published · ${result.counts.draft} drafts`}>
        <Link href="/admin/blog/new" className={primaryButton}>
          <IconPlus className="h-4 w-4" /> New post
        </Link>
      </AdminHeading>

      {param(sp, "deleted") && <Notice tone="info">The post was deleted.</Notice>}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs
          basePath="/admin/blog"
          param="status"
          current={status}
          params={{ category: categoryId, q }}
          options={[
            { label: "All", count: all },
            { value: "published", label: "Published", count: result.counts.published },
            { value: "draft", label: "Drafts", count: result.counts.draft },
          ]}
        />
        <form method="get" className="grid gap-2 sm:grid-cols-[auto_1fr_auto]">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="sr-only" htmlFor="post-category-filter">
            Category
          </label>
          <select id="post-category-filter" name="category" defaultValue={categoryId ?? ""} className={control}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="post-search">
            Search posts
          </label>
          <input id="post-search" type="search" name="q" defaultValue={q} placeholder="Search titles" className={`${control} min-w-0`} />
          <button type="submit" className="h-11 rounded-xl bg-castle-600 px-5 font-semibold text-white hover:bg-castle-700">
            Filter
          </button>
        </form>
      </div>

      <Panel>
        {result.posts.length === 0 ? (
          <EmptyState>
            {all === 0 ? (
              <>
                No posts yet.{" "}
                <Link href="/admin/blog/new" className="font-semibold text-castle-600 hover:underline">
                  Write the first one
                </Link>
                .
              </>
            ) : (
              "No posts match these filters."
            )}
          </EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {result.posts.map((post) => (
                <tr key={post.id} className="hover:bg-castle-50/60">
                  <td>
                    <div className="flex gap-3.5">
                      {post.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                        <img src={post.coverUrl} alt="" className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block" />
                      ) : (
                        <span className="hidden h-14 w-20 shrink-0 rounded-lg bg-castle-100 sm:block" />
                      )}
                      <span className="min-w-0">
                        <Link href={`/admin/blog/${post.id}`} className="font-semibold text-ink hover:text-castle-600">
                          {post.title}
                        </Link>
                        {post.isFeatured && (
                          <span className="ml-2 rounded-full bg-gold-300 px-2 py-0.5 text-xs font-semibold text-castle-900">Featured</span>
                        )}
                        <span className="block truncate text-sm text-ink/55">/blog/{post.slug}</span>
                        <span className="mt-1 flex gap-4 text-sm font-semibold">
                          <Link href={`/admin/blog/${post.id}`} className="text-castle-600 hover:underline">
                            Edit
                          </Link>
                          {post.status === "published" && (
                            <Link href={`/blog/${post.slug}`} target="_blank" className="text-castle-600 hover:underline">
                              View
                            </Link>
                          )}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td data-label="Category" className="text-sm">
                    {post.category.name}
                  </td>
                  <td data-label="Status">
                    <span>
                      <StatusBadge status={post.status} />
                      {post.publishedAt && post.status === "published" && (
                        <span className="mt-1 block text-xs text-ink/55">{formatDate(post.publishedAt)}</span>
                      )}
                    </span>
                  </td>
                  <td data-label="Author" className="text-sm">
                    {post.authorName}
                  </td>
                  <td data-label="Updated" className="text-sm whitespace-nowrap text-ink/60">
                    {formatDateTime(post.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={result.page}
          total={result.total}
          perPage={ADMIN_POSTS_PER_PAGE}
          basePath="/admin/blog"
          params={{ status, category: categoryId, q }}
        />
      </Panel>
    </div>
  );
}
