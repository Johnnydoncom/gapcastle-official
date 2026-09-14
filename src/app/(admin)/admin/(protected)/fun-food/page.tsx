import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminHeading,
  DatabaseError,
  EmptyState,
  FilterTabs,
  Pagination,
  Panel,
  SearchForm,
  StatusForm,
  param,
  secondaryButton,
} from "@/components/admin/ui";
import { PER_PAGE, REGISTRATION_STATUSES, listRegistrations } from "@/lib/admin-data";
import { formatDate, formatDateTime, humanize } from "@/lib/format";
import { updateRegistrationStatus } from "../../actions";

export const metadata: Metadata = { title: "Fun Food registrations" };

export default async function FunFoodRegistrationsPage({ searchParams }: PageProps<"/admin/fun-food">) {
  const sp = await searchParams;
  const status = param(sp, "status");
  const q = param(sp, "q")?.trim() || undefined;
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listRegistrations>>;
  try {
    result = await listRegistrations({ status, q, page });
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Fun Food registrations" description={`${result.total} participant${result.total === 1 ? "" : "s"}`}>
        <Link href="/admin/fun-food/donations" className={secondaryButton}>
          Donations →
        </Link>
      </AdminHeading>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          basePath="/admin/fun-food"
          param="status"
          current={status}
          params={{ q }}
          options={[{ label: "All" }, ...REGISTRATION_STATUSES.map((s) => ({ value: s, label: humanize(s) }))]}
        />
        <SearchForm q={q} placeholder="Name, phone, email or reference" hidden={{ status }} clearHref={status ? `/admin/fun-food?status=${status}` : "/admin/fun-food"} />
      </div>

      <Panel>
        {result.rows.length === 0 ? (
          <EmptyState>No registrations match.</EmptyState>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Contact</th>
                <th>Household</th>
                <th>Work</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="font-semibold">
                      {r.first_name} {r.middle_name ? `${r.middle_name} ` : ""}
                      {r.surname}
                    </span>
                    <span className="block text-sm text-ink/60">Born {formatDate(r.date_of_birth)}</span>
                    <span className="block max-w-64 text-sm text-ink/60">{r.home_address}</span>
                    <span className="block font-mono text-xs text-ink/50">
                      {r.reference} · {formatDateTime(r.created_at)}
                    </span>
                  </td>
                  <td data-label="Contact" className="text-sm">
                    <span>
                      <a href={`tel:${r.phone}`} className="font-semibold text-castle-600 hover:underline">
                        {r.phone}
                      </a>
                      {r.email && <span className="block break-all text-ink/60">{r.email}</span>}
                    </span>
                  </td>
                  <td data-label="Household" className="text-sm text-ink/70">
                    <span>
                      {humanize(r.marital_status)}
                      <span className="block">{r.number_of_children ?? "—"} children</span>
                    </span>
                  </td>
                  <td data-label="Work" className="text-sm text-ink/70">
                    <span>
                      {humanize(r.employment_type)}
                      {r.place_of_work && <span className="block">{r.place_of_work}</span>}
                      {r.line_of_business && <span className="block text-ink/60">{r.line_of_business}</span>}
                    </span>
                  </td>
                  <td data-label="Status">
                    <StatusForm action={updateRegistrationStatus} id={r.id} current={r.status} options={REGISTRATION_STATUSES} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/fun-food" params={{ status, q }} />
      </Panel>
    </div>
  );
}
