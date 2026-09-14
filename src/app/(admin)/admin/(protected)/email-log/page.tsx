import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, DatabaseError, EmptyState, FilterTabs, Pagination, Panel, StatusBadge, param, secondaryButton } from "@/components/admin/ui";
import { EMAIL_STATUSES, PER_PAGE, listEmailLog } from "@/lib/admin-data";
import { formatDateTime, humanize } from "@/lib/format";

export const metadata: Metadata = { title: "Email log" };

export default async function EmailLogPage({ searchParams }: PageProps<"/admin/email-log">) {
  const sp = await searchParams;
  const status = param(sp, "status");
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listEmailLog>>;
  try {
    result = await listEmailLog({ status, page });
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Email log" description="Every notification the website has tried to send, newest first.">
        <Link href="/admin/settings" className={secondaryButton}>
          Email settings
        </Link>
      </AdminHeading>

      <FilterTabs
        basePath="/admin/email-log"
        param="status"
        current={status}
        options={[{ label: "All" }, ...EMAIL_STATUSES.map((s) => ({ value: s, label: humanize(s) }))]}
      />

      <Panel>
        {result.rows.length === 0 ? (
          <EmptyState>No emails here yet.</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Status</th>
                <th>Type</th>
                <th>To</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="font-semibold break-words">{row.subject}</span>
                    {row.error && <span className="mt-1 block text-xs break-words text-red-700">{row.error}</span>}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={row.status} />
                  </td>
                  <td data-label="Type" className="font-mono text-xs break-all">
                    {row.event}
                  </td>
                  <td data-label="To" className="max-w-64 text-sm break-all">
                    {row.recipient}
                  </td>
                  <td data-label="When" className="text-sm whitespace-nowrap text-ink/60">
                    {formatDateTime(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/email-log" params={{ status }} />
      </Panel>
    </div>
  );
}
