import type { Metadata } from "next";
import { AdminHeading, DatabaseError, EmptyState, Pagination, Panel, SearchForm, param } from "@/components/admin/ui";
import { PER_PAGE, listSubscribers } from "@/lib/admin-data";
import { formatDateTime, humanize } from "@/lib/format";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
  const sp = await searchParams;
  const q = param(sp, "q")?.trim() || undefined;
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listSubscribers>>;
  try {
    result = await listSubscribers({ q, page });
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading
        title="Subscribers"
        description={
          result.bySource.length
            ? result.bySource.map((s) => `${s.n} from ${humanize(s.source).toLowerCase()}`).join(" · ")
            : "People who asked for updates by email."
        }
      />

      <SearchForm q={q} placeholder="Search by email" clearHref="/admin/subscribers" />

      <Panel>
        {result.rows.length === 0 ? (
          <EmptyState>{q ? "No subscribers match that search." : "Nobody has subscribed yet."}</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Signed up from</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href={`mailto:${s.email}`} className="font-semibold break-all hover:text-castle-600">
                      {s.email}
                    </a>
                  </td>
                  <td data-label="Source">{humanize(s.source)}</td>
                  <td data-label="Date" className="text-sm text-ink/60">
                    {formatDateTime(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/subscribers" params={{ q }} />
      </Panel>
    </div>
  );
}
