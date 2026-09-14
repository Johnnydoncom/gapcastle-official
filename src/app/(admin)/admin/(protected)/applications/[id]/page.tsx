import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DatabaseError, Panel, StatusBadge } from "@/components/admin/ui";
import { Mail, Phone, WhatsApp } from "@/components/ui/icons";
import { APPLICATION_STATUSES, getApplication } from "@/lib/admin-data";
import { formatDate, formatDateTime, formatNaira, humanize, whatsappLink } from "@/lib/format";
import { loanByDbType } from "@/lib/site";
import { updateApplication } from "../../../actions";

export const metadata: Metadata = { title: "Application" };

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let app: Awaited<ReturnType<typeof getApplication>>;
  try {
    app = await getApplication(id);
  } catch (error) {
    return <DatabaseError error={error} />;
  }
  if (!app) notFound();

  const product = loanByDbType(app.loan_type);
  const fullName = [app.first_name, app.middle_name, app.surname].filter(Boolean).join(" ");

  const productRows: [string, ReactNode][] =
    app.loan_type === "school"
      ? [
          ["School", app.school_name],
          ["Children covered", app.number_of_children],
        ]
      : app.loan_type === "travel"
        ? [
            ["Destination", app.travel_destination],
            ["Purpose", humanize(app.travel_purpose)],
            ["Travel date", formatDate(app.travel_date)],
          ]
        : app.loan_type === "personal"
          ? [
              ["Employer", app.employer],
              ["Monthly income", formatNaira(app.monthly_income)],
            ]
          : [["Monthly revenue", formatNaira(app.monthly_income)]];

  return (
    <div className="space-y-8">
      <Link href="/admin/applications" className="text-sm font-semibold text-castle-600 hover:underline">
        ← All applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-sm text-ink/60">{app.reference}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold lg:text-4xl">{fullName}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-ink/60">
            {product?.name ?? app.loan_type} · {formatNaira(app.loan_amount)}
            <StatusBadge status={app.status} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${app.phone}`} className="inline-flex items-center gap-2 rounded-full bg-castle-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-castle-700">
            <Phone className="h-4 w-4" /> Call
          </a>
          <a href={whatsappLink(app.phone)} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full border border-castle-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-castle-50">
            <WhatsApp className="h-4 w-4" /> WhatsApp
          </a>
          <a href={`mailto:${app.email}?subject=${encodeURIComponent(`Your Gap Castle application ${app.reference}`)}`} className="inline-flex items-center gap-2 rounded-full border border-castle-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-castle-50">
            <Mail className="h-4 w-4" /> Email
          </a>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Details
            title="The loan"
            rows={[
              ["Product", product?.name ?? app.loan_type],
              ["Applying as", app.application_type === "corporate" ? "Company / business" : "Individual"],
              ["Amount requested", formatNaira(app.loan_amount)],
              ["Repayment period", app.repayment_months ? `${app.repayment_months} months` : "No preference"],
              ["Purpose", <span key="p" className="whitespace-pre-line">{app.loan_purpose}</span>],
              ...productRows,
            ]}
          />

          {(app.business_name || app.application_type === "corporate") && (
            <Details
              title="Business"
              rows={[
                ["Business name", app.business_name],
                ["CAC registered", app.business_registered === null ? "—" : app.business_registered ? "Yes" : "No"],
                ["Registration date", formatDate(app.business_registration_date)],
              ]}
            />
          )}

          <Details
            title="Applicant"
            rows={[
              ["Full name", fullName],
              ["Date of birth", formatDate(app.date_of_birth)],
              ["Email", <a key="e" href={`mailto:${app.email}`} className="text-castle-600 hover:underline">{app.email}</a>],
              ["Phone", <a key="t" href={`tel:${app.phone}`} className="text-castle-600 hover:underline">{app.phone}</a>],
              ["Home address", app.home_address],
              ["Office address", app.office_address],
            ]}
          />

          <Details
            title="Record"
            rows={[
              ["Received", formatDateTime(app.created_at)],
              ["Last updated", formatDateTime(app.updated_at)],
              ["IP address", app.ip_address],
              ["Browser", <span key="ua" className="text-sm break-all text-ink/60">{app.user_agent ?? "—"}</span>],
            ]}
          />
        </div>

        <Panel className="p-6 lg:sticky lg:top-6 lg:col-span-4">
          <h2 className="font-display text-xl font-semibold">Update</h2>
          <form action={updateApplication} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={app.id} />
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Status
              <select
                name="status"
                defaultValue={app.status}
                className="h-11 rounded-xl border border-castle-200 bg-white px-3 text-[15px] font-normal outline-none focus:border-castle-500"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Internal notes
              <textarea
                name="admin_notes"
                rows={7}
                maxLength={5000}
                defaultValue={app.admin_notes ?? ""}
                placeholder="Calls made, documents received, decision reasons…"
                className="rounded-xl border border-castle-200 bg-white px-3 py-2.5 text-[15px] font-normal outline-none focus:border-castle-500"
              />
            </label>
            <button type="submit" className="h-11 w-full rounded-xl bg-castle-600 font-semibold text-white hover:bg-castle-700">
              Save changes
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

function Details({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <Panel>
      <h2 className="border-b border-castle-100 px-6 py-4 font-display text-xl font-semibold">{title}</h2>
      <dl className="divide-y divide-castle-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-6 py-3.5 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-ink/60">{label}</dt>
            <dd className="text-[15px] break-words sm:col-span-2">{value === null || value === undefined || value === "" ? "—" : value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
