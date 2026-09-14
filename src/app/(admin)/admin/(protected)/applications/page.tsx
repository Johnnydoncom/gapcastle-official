import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, DatabaseError, EmptyState, Pagination, Panel, StatusBadge, param } from "@/components/admin/ui";
import { APPLICATION_STATUSES, PER_PAGE, listApplications } from "@/lib/admin-data";
import { formatDateTime, formatNaira, humanize } from "@/lib/format";
import { loanByDbType, loanProducts } from "@/lib/site";

export const metadata: Metadata = { title: "Loan applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const sp = await searchParams;
  const filters = {
    type: param(sp, "type"),
    status: param(sp, "status"),
    q: param(sp, "q")?.trim() || undefined,
    page: Number(param(sp, "page") ?? 1),
  };

  let result: Awaited<ReturnType<typeof listApplications>>;
  try {
    result = await listApplications(filters);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const control = "h-11 w-full rounded-xl border border-castle-200 bg-white px-3 text-[15px] outline-none focus:border-castle-500";

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Loan applications" description={`${result.total} matching application${result.total === 1 ? "" : "s"}`} />

      <form method="get" className="grid gap-3 rounded-2xl border border-castle-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Product
          <select name="type" defaultValue={filters.type ?? ""} className={control}>
            <option value="">All products</option>
            {loanProducts.map((p) => (
              <option key={p.dbType} value={p.dbType}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Status
          <select name="status" defaultValue={filters.status ?? ""} className={control}>
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-1">
          Search
          <input type="search" name="q" defaultValue={filters.q} placeholder="Name, email, phone or reference" className={control} />
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className="h-11 flex-1 rounded-xl bg-castle-600 px-5 font-semibold text-white hover:bg-castle-700 lg:flex-none">
            Filter
          </button>
          {(filters.type || filters.status || filters.q) && (
            <Link href="/admin/applications" className="grid h-11 place-items-center px-3 text-sm font-semibold text-castle-600 hover:underline">
              Clear
            </Link>
          )}
        </div>
      </form>

      <Panel>
        {result.rows.length === 0 ? (
          <EmptyState>No applications match these filters.</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Product</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((a) => (
                <tr key={a.id} className="hover:bg-castle-50/60">
                  <td>
                    <Link href={`/admin/applications/${a.id}`} className="font-semibold text-ink hover:text-castle-600">
                      {a.first_name} {a.surname}
                    </Link>
                    <span className="block text-sm break-all text-ink/60">{a.email}</span>
                    <span className="block font-mono text-xs text-ink/60">{a.reference}</span>
                  </td>
                  <td data-label="Product">
                    {loanByDbType(a.loan_type)?.name ?? a.loan_type}
                    {a.application_type === "corporate" && (
                      <span className="block text-sm text-ink/60">{a.business_name ?? "Corporate"}</span>
                    )}
                  </td>
                  <td data-label="Amount" className="text-right tabular-nums">
                    {formatNaira(a.loan_amount)}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={a.status} />
                  </td>
                  <td data-label="Received" className="text-sm text-ink/60">
                    {formatDateTime(a.created_at)}
                    <Link href={`/admin/applications/${a.id}`} className="mt-1 block font-semibold text-castle-600 hover:underline">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={result.page}
          total={result.total}
          perPage={PER_PAGE}
          basePath="/admin/applications"
          params={{ type: filters.type, status: filters.status, q: filters.q }}
        />
      </Panel>
    </div>
  );
}
