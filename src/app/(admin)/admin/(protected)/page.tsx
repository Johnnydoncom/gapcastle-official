import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, DatabaseError, EmptyState, Notice, Panel, PanelHeader, StatCard, StatusBadge, param } from "@/components/admin/ui";
import { APPLICATION_STATUSES, dashboardSummary } from "@/lib/admin-data";
import { getCurrentAdmin } from "@/lib/auth";
import { formatDateTime, formatNaira, humanize } from "@/lib/format";
import { loanByDbType, loanProducts } from "@/lib/site";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const user = await getCurrentAdmin();

  let data: Awaited<ReturnType<typeof dashboardSummary>>;
  try {
    data = await dashboardSummary();
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const statusCount = (s: string) => Number(data.byStatus.find((r) => r.status === s)?.n ?? 0);
  const totalApplications = data.byStatus.reduce((sum, r) => sum + Number(r.n), 0);
  // servers run in UTC; greet by the time in Lagos
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 lg:space-y-10">
      {param(sp, "welcome") === "password-reset" && (
        <Notice>Your password has been reset and you are signed in. Other devices have been signed out.</Notice>
      )}

      <AdminHeading
        title="Overview"
        description={`${greeting}${user ? `, ${user.name}` : ""} — here is everything that has come in through the website.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Awaiting review" value={statusCount("new")} href="/admin/applications?status=new" highlight={statusCount("new") > 0} hint={`${totalApplications} applications in total`} />
        <StatCard label="New messages" value={data.newMessages} href="/admin/messages?status=new" highlight={data.newMessages > 0} />
        <StatCard label="Fun Food registrations" value={data.registrations} href="/admin/fun-food" hint={`${data.donations.count} donation pledges`} />
        <StatCard label="Blog posts" value={data.posts.published} href="/admin/blog" hint={`${data.posts.draft} drafts · ${data.subscribers} subscribers`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-7">
          <PanelHeader title="By product" />
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-right">Applications</th>
                <th className="text-right">Requested</th>
              </tr>
            </thead>
            <tbody>
              {loanProducts.map((p) => {
                const row = data.byType.find((r) => r.loan_type === p.dbType);
                return (
                  <tr key={p.slug}>
                    <td>
                      <Link href={`/admin/applications?type=${p.dbType}`} className="font-semibold hover:text-castle-600">
                        {p.name}
                      </Link>
                    </td>
                    <td data-label="Applications" className="text-right tabular-nums">
                      {Number(row?.n ?? 0)}
                    </td>
                    <td data-label="Requested" className="text-right tabular-nums">
                      {formatNaira(row?.total ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel className="p-5 sm:p-6 xl:col-span-5">
          <h2 className="font-display text-xl font-semibold">Pipeline</h2>
          <ul className="mt-5 space-y-3.5">
            {APPLICATION_STATUSES.map((s) => {
              const n = statusCount(s);
              const pct = totalApplications ? Math.round((n / totalApplications) * 100) : 0;
              return (
                <li key={s}>
                  <Link href={`/admin/applications?status=${s}`} className="group block">
                    <span className="flex justify-between text-sm">
                      <span className="font-medium group-hover:text-castle-600">{humanize(s)}</span>
                      <span className="text-ink/60 tabular-nums">{n}</span>
                    </span>
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-castle-100">
                      <span className="block h-full rounded-full bg-castle-600" style={{ width: `${pct}%` }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 border-t border-castle-100 pt-4 text-sm text-ink/60">
            Cash pledged to the Fun Food Factory:{" "}
            <Link href="/admin/fun-food/donations" className="font-semibold text-ink hover:text-castle-600">
              {formatNaira(data.donations.total)}
            </Link>
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Latest applications">
          <Link href="/admin/applications" className="text-sm font-semibold text-castle-600 hover:underline">
            View all
          </Link>
        </PanelHeader>
        {data.recent.length === 0 ? (
          <EmptyState>No applications yet. They will appear here as soon as someone applies.</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/applications/${a.id}`} className="font-semibold hover:text-castle-600">
                      {a.first_name} {a.surname}
                    </Link>
                    <span className="block font-mono text-xs text-ink/60">{a.reference}</span>
                  </td>
                  <td data-label="Product">{loanByDbType(a.loan_type)?.name ?? a.loan_type}</td>
                  <td data-label="Amount" className="tabular-nums">
                    {formatNaira(a.loan_amount)}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={a.status} />
                  </td>
                  <td data-label="Received" className="text-sm text-ink/60">
                    {formatDateTime(a.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
