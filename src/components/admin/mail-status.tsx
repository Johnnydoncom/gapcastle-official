import Link from "next/link";
import { StatusBadge } from "@/components/admin/ui";
import { SMTP_SECURITY_LABELS, type MailStatus } from "@/lib/mailer";

/** Server-rendered summary of the email configuration in use. Never includes the password. */
export function MailStatusSummary({ mail, detailed }: { mail: MailStatus; detailed: boolean }) {
  if (!mail.configured) {
    return (
      <div className="rounded-2xl border border-azure-500 bg-azure-300/30 px-4 py-3 text-sm leading-relaxed">
        <p className="flex items-center gap-2 font-semibold">
          <StatusBadge status="skipped" label="Not sending" />
        </p>
        <p className="mt-2">{mail.reason}</p>
        <p className="mt-2 text-ink/65">Submissions are still saved; emails are recorded as “skipped” in the email log.</p>
      </div>
    );
  }

  const { config } = mail;
  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge status="active" label="Sending" />
        <span className="text-ink/60">
          {config.source === "dashboard" ? "Using the settings saved here" : "Using the server's SMTP_* environment variables"}
        </span>
      </p>
      {detailed && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-ink/60">Server</dt>
          <dd className="break-all">
            {config.host}:{config.port}
          </dd>
          <dt className="text-ink/60">Encryption</dt>
          <dd>{SMTP_SECURITY_LABELS[config.security]}</dd>
          <dt className="text-ink/60">Signs in as</dt>
          <dd className="break-all">{config.user || "No sign-in"}</dd>
          <dt className="text-ink/60">Sends as</dt>
          <dd className="break-all">
            {config.fromName} &lt;{config.fromAddress}&gt;
          </dd>
        </dl>
      )}
      <Link href="/admin/email-log" className="inline-flex text-sm font-semibold text-castle-600 hover:underline">
        View the email log →
      </Link>
    </div>
  );
}
