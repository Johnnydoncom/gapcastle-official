import Link from "next/link";
import type { ReactNode } from "react";
import { IconSearch } from "@/components/admin/admin-icons";
import { cn } from "@/lib/cn";
import { humanize } from "@/lib/format";

const badgeTone: Record<string, string> = {
  new: "bg-gold-300 text-castle-900",
  pledged: "bg-gold-300 text-castle-900",
  registered: "bg-gold-300 text-castle-900",
  skipped: "bg-gold-300 text-castle-900",
  draft: "bg-ink/10 text-ink/70",
  reviewing: "bg-castle-200 text-castle-800",
  read: "bg-castle-200 text-castle-800",
  confirmed: "bg-castle-200 text-castle-800",
  editor: "bg-castle-100 text-castle-700",
  approved: "bg-emerald-100 text-emerald-800",
  replied: "bg-emerald-100 text-emerald-800",
  received: "bg-emerald-100 text-emerald-800",
  attended: "bg-emerald-100 text-emerald-800",
  sent: "bg-emerald-100 text-emerald-800",
  published: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  disbursed: "bg-castle-600 text-white",
  acknowledged: "bg-castle-600 text-white",
  admin: "bg-castle-600 text-white",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  deactivated: "bg-red-100 text-red-800",
  archived: "bg-ink/10 text-ink/60",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        badgeTone[status] ?? "bg-ink/10 text-ink/70",
      )}
    >
      {label ?? humanize(status)}
    </span>
  );
}

export function AdminHeading({
  title,
  description,
  back,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div>
      {back && (
        <Link href={back.href} className="mb-3 inline-flex text-sm font-semibold text-castle-600 hover:underline">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold sm:text-3xl lg:text-4xl">{title}</h1>
          {description && <p className="mt-1.5 text-[15px] text-ink/60">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{children}</div>}
      </div>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-2xl border border-castle-100 bg-white sm:rounded-3xl", className)}>{children}</div>;
}

export function PanelHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-castle-100 px-5 py-4 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-ink/60">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-6 py-14 text-center text-ink/60">{children}</p>;
}

export function Notice({ tone = "success", children }: { tone?: "success" | "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl border px-5 py-3 text-sm font-semibold",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "info" && "border-castle-200 bg-white text-castle-700",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {children}
    </p>
  );
}

export function StatCard({
  label,
  value,
  href,
  hint,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  href: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl border p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift sm:rounded-3xl sm:p-6",
        highlight ? "border-gold-500 bg-gold-300/40" : "border-castle-100 bg-white",
      )}
    >
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-castle-700 tabular-nums sm:text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
    </Link>
  );
}

export function DatabaseError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <Panel className="border-red-200 bg-red-50 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-red-900">Database unavailable</h2>
      <p className="mt-2 text-red-800">
        Check that the database is reachable and the <code className="font-mono">DB_*</code> settings are correct, then run{" "}
        <code className="font-mono">npm run db:migrate</code>.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-white/70 p-4 font-mono text-xs whitespace-pre-wrap text-red-900">{message}</pre>
    </Panel>
  );
}

/** A status <select> with a Save button — a plain form, so it works without JavaScript. */
export function StatusForm({
  action,
  id,
  current,
  options,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  current: string;
  options: readonly string[];
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`status-${id}`}>
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={current}
        className="h-9 min-w-0 rounded-lg border border-castle-200 bg-white px-2.5 text-sm outline-none focus:border-castle-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {humanize(o)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-9 shrink-0 rounded-lg bg-castle-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-castle-700"
      >
        Save
      </button>
    </form>
  );
}

type Params = Record<string, string | number | undefined>;

export function buildHref(basePath: string, params: Params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  const qs = q.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  page,
  total,
  perPage,
  basePath,
  params,
}: {
  page: number;
  total: number;
  perPage: number;
  basePath: string;
  params: Params;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  const linkClass = "rounded-lg border border-castle-200 bg-white px-3.5 py-2 font-semibold hover:bg-castle-50";
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-castle-100 px-5 py-4 text-sm sm:px-6"
    >
      <span className="text-ink/60">
        Page {page} of {pages} · {total} total
      </span>
      <span className="flex gap-2">
        {page > 1 && (
          <Link href={buildHref(basePath, { ...params, page: page - 1 })} className={linkClass}>
            ← Previous
          </Link>
        )}
        {page < pages && (
          <Link href={buildHref(basePath, { ...params, page: page + 1 })} className={linkClass}>
            Next →
          </Link>
        )}
      </span>
    </nav>
  );
}

/** Pill links that filter a list by one query parameter. Scrolls sideways on small screens. */
export function FilterTabs({
  basePath,
  param,
  current,
  options,
  params = {},
}: {
  basePath: string;
  param: string;
  current: string | undefined;
  options: { value?: string; label: string; count?: number }[];
  params?: Params;
}) {
  return (
    <nav aria-label="Filter" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => {
        const active = (current ?? "") === (o.value ?? "");
        return (
          <Link
            key={o.value ?? "all"}
            href={buildHref(basePath, { ...params, [param]: o.value })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "border-castle-600 bg-castle-600 text-white" : "border-castle-200 bg-white text-ink/75 hover:bg-castle-50",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("text-xs tabular-nums", active ? "text-white/75" : "text-ink/50")}>{o.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function SearchForm({
  q,
  placeholder,
  hidden = {},
  clearHref,
}: {
  q?: string;
  placeholder: string;
  hidden?: Params;
  clearHref?: string;
}) {
  return (
    <form method="get" role="search" className="flex w-full gap-2 sm:max-w-md">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label className="relative flex-1">
        <span className="sr-only">Search</span>
        <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/45" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-castle-200 bg-white pr-3 pl-10 text-[15px] outline-none focus:border-castle-500 focus:ring-4 focus:ring-castle-600/12"
        />
      </label>
      <button type="submit" className="h-11 shrink-0 rounded-xl bg-castle-600 px-4 font-semibold text-white hover:bg-castle-700">
        Search
      </button>
      {q && clearHref && (
        <Link href={clearHref} className="grid h-11 shrink-0 place-items-center px-2 text-sm font-semibold text-castle-600 hover:underline">
          Clear
        </Link>
      )}
    </form>
  );
}

/** Sub-navigation shared by the settings pages. */
export function SettingsTabs({ current }: { current: "general" | "email" }) {
  const tabs = [
    { key: "general", href: "/admin/settings", label: "Notifications" },
    { key: "email", href: "/admin/settings/email", label: "Email server" },
  ] as const;
  return (
    <nav aria-label="Settings sections" className="-mx-4 flex gap-1 overflow-x-auto border-b border-castle-200 px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={current === tab.key ? "page" : undefined}
          className={cn(
            "-mb-px shrink-0 border-b-2 px-4 py-3 text-[15px] font-semibold whitespace-nowrap transition-colors",
            current === tab.key ? "border-castle-600 text-castle-700" : "border-transparent text-ink/60 hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

/** Reads a single string query parameter. */
export const param = (sp: Record<string, string | string[] | undefined>, key: string) =>
  typeof sp[key] === "string" ? (sp[key] as string) : undefined;

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-castle-600 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-castle-700";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-castle-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-castle-700 transition-colors hover:bg-castle-50";
export const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-red-700 transition-colors hover:bg-red-50";
