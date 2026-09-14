import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminHeading, DatabaseError, EmptyState, Notice, Panel, PanelHeader, param } from "@/components/admin/ui";
import { listCategoriesWithCounts } from "@/lib/blog";
import { deleteCategory } from "../../../blog-actions";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/blog/categories">) {
  const sp = await searchParams;

  let rows: Awaited<ReturnType<typeof listCategoriesWithCounts>>;
  try {
    rows = await listCategoriesWithCounts();
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const editing = rows.find((c) => c.id === Number(param(sp, "edit")));
  const inUse = rows.find((c) => c.id === Number(param(sp, "in-use")));

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Categories" description="Every post belongs to one category. Readers can filter the blog by them." />

      {inUse && (
        <Notice tone="error">
          “{inUse.name}” still has {inUse.posts} post{inUse.posts === 1 ? "" : "s"}. Move them to another category before deleting it.
        </Notice>
      )}
      {param(sp, "deleted") && <Notice tone="info">The category was deleted.</Notice>}

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-7">
          <PanelHeader title="All categories" description={`${rows.length} categor${rows.length === 1 ? "y" : "ies"}`} />
          {rows.length === 0 ? (
            <EmptyState>No categories yet. Add the first one.</EmptyState>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-right">Posts</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className={editing?.id === c.id ? "bg-castle-50" : undefined}>
                    <td>
                      <span className="font-semibold">{c.name}</span>
                      <span className="block text-sm text-ink/55">/blog?category={c.slug}</span>
                      {c.description && <span className="mt-1 block text-sm text-ink/65">{c.description}</span>}
                    </td>
                    <td data-label="Posts" className="text-right tabular-nums">
                      <Link href={`/admin/blog?category=${c.id}`} className="hover:text-castle-600">
                        {c.posts}
                        <span className="text-ink/50"> ({c.published} live)</span>
                      </Link>
                    </td>
                    <td data-label="Actions" className="text-right">
                      <span className="flex flex-wrap items-center gap-4 text-sm font-semibold sm:justify-end">
                        <Link href={`/admin/blog/categories?edit=${c.id}`} className="text-castle-600 hover:underline">
                          Edit
                        </Link>
                        {c.posts === 0 ? (
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmButton message={`Delete the “${c.name}” category?`} className="text-red-700 hover:underline">
                              Delete
                            </ConfirmButton>
                          </form>
                        ) : (
                          <span className="text-ink/40" title="Categories with posts cannot be deleted">
                            In use
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel className="p-5 sm:p-6 xl:sticky xl:top-8 xl:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{editing ? `Edit “${editing.name}”` : "Add a category"}</h2>
            {editing && (
              <Link href="/admin/blog/categories" className="text-sm font-semibold text-castle-600 hover:underline">
                Cancel
              </Link>
            )}
          </div>
          <div className="mt-5">
            <CategoryForm key={editing?.id ?? "new"} category={editing ?? null} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
