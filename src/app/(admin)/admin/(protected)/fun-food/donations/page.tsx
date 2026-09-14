import type { Metadata } from "next";
import { AdminHeading, DatabaseError, EmptyState, FilterTabs, Pagination, Panel, StatusForm, param } from "@/components/admin/ui";
import { DONATION_STATUSES, PER_PAGE, listDonations } from "@/lib/admin-data";
import { formatDateTime, formatNaira, humanize } from "@/lib/format";
import { updateDonationStatus } from "../../../actions";

export const metadata: Metadata = { title: "Donations" };

export default async function DonationsPage({ searchParams }: PageProps<"/admin/fun-food/donations">) {
  const sp = await searchParams;
  const status = param(sp, "status");
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listDonations>>;
  try {
    result = await listDonations({ status, page });
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading
        back={{ href: "/admin/fun-food", label: "Registrations" }}
        title="Donations"
        description={`${result.total} pledge${result.total === 1 ? "" : "s"} · ${formatNaira(result.cashTotal)} in cash pledged`}
      />

      <FilterTabs
        basePath="/admin/fun-food/donations"
        param="status"
        current={status}
        options={[{ label: "All" }, ...DONATION_STATUSES.map((s) => ({ value: s, label: humanize(s) }))]}
      />

      <Panel>
        {result.rows.length === 0 ? (
          <EmptyState>No donation pledges here.</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Gift</th>
                <th>Note</th>
                <th>Pledged</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className="font-semibold">{d.name}</span>
                    <a href={`mailto:${d.email}`} className="block text-sm break-all text-castle-600 hover:underline">
                      {d.email}
                    </a>
                    {d.phone && <span className="block text-sm text-ink/60">{d.phone}</span>}
                    <span className="block font-mono text-xs text-ink/50">{d.reference}</span>
                  </td>
                  <td data-label="Gift">
                    {d.donation_type === "cash" ? (
                      <span className="font-semibold tabular-nums">{formatNaira(d.amount)}</span>
                    ) : (
                      <span>
                        <span className="font-semibold">Food items</span>
                        <span className="block text-sm text-ink/60">{d.food_items}</span>
                      </span>
                    )}
                  </td>
                  <td data-label="Note" className="max-w-72 text-sm text-ink/60">
                    {d.note ?? "—"}
                  </td>
                  <td data-label="Pledged" className="text-sm text-ink/60">
                    {formatDateTime(d.created_at)}
                  </td>
                  <td data-label="Status">
                    <StatusForm action={updateDonationStatus} id={d.id} current={d.status} options={DONATION_STATUSES} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/fun-food/donations" params={{ status }} />
      </Panel>
    </div>
  );
}
