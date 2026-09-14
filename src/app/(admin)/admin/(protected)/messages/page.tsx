import type { Metadata } from "next";
import { AdminHeading, DatabaseError, EmptyState, FilterTabs, Pagination, Panel, StatusBadge, StatusForm, param } from "@/components/admin/ui";
import { MESSAGE_STATUSES, PER_PAGE, listMessages } from "@/lib/admin-data";
import { formatDateTime, humanize, whatsappLink } from "@/lib/format";
import { updateMessageStatus } from "../../actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const status = param(sp, "status");
  const page = Number(param(sp, "page") ?? 1);

  let result: Awaited<ReturnType<typeof listMessages>>;
  try {
    result = await listMessages({ status, page });
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Messages" description="Enquiries sent through the contact page." />

      <FilterTabs
        basePath="/admin/messages"
        param="status"
        current={status}
        options={[{ label: "All" }, ...MESSAGE_STATUSES.map((s) => ({ value: s, label: humanize(s) }))]}
      />

      {result.rows.length === 0 ? (
        <Panel>
          <EmptyState>No messages here.</EmptyState>
        </Panel>
      ) : (
        <ul className="space-y-4">
          {result.rows.map((m) => (
            <li key={m.id}>
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-semibold">{m.name}</span>
                      <StatusBadge status={m.status} />
                      <span className="rounded-full bg-castle-100 px-2.5 py-1 text-xs font-semibold text-castle-700">
                        {humanize(m.topic)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-ink/60">
                      {formatDateTime(m.created_at)} · prefers {m.preferred_contact === "whatsapp" ? "WhatsApp" : m.preferred_contact} ·{" "}
                      <span className="font-mono">{m.reference}</span>
                    </p>
                  </div>
                  <StatusForm action={updateMessageStatus} id={m.id} current={m.status} options={MESSAGE_STATUSES} />
                </div>

                {m.subject && <p className="mt-4 font-semibold">{m.subject}</p>}
                <p className="mt-2 leading-relaxed break-words whitespace-pre-line text-ink/75">{m.message}</p>

                <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-castle-100 pt-4 text-sm font-semibold">
                  <a href={`tel:${m.phone}`} className="text-castle-600 hover:underline">
                    {m.phone}
                  </a>
                  <a href={whatsappLink(m.phone)} target="_blank" rel="noreferrer noopener" className="text-castle-600 hover:underline">
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your enquiry ${m.reference}`)}`}
                    className="break-all text-castle-600 hover:underline"
                  >
                    {m.email}
                  </a>
                </p>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      {result.total > PER_PAGE && (
        <Panel>
          <Pagination page={result.page} total={result.total} perPage={PER_PAGE} basePath="/admin/messages" params={{ status }} />
        </Panel>
      )}
    </div>
  );
}
