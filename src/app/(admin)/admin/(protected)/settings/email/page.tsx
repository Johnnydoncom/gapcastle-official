import type { Metadata } from "next";
import { MailStatusSummary } from "@/components/admin/mail-status";
import { EmailServerForm, TestEmailForm } from "@/components/admin/settings-forms";
import { AdminHeading, Panel, SettingsTabs } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-guard";
import { resolveMailConfig } from "@/lib/mailer";
import { encryptionAvailable, openSecret } from "@/lib/secret-box";
import { readSettingsIncludingSecrets } from "@/lib/settings";

export const metadata: Metadata = { title: "Email server" };

export default async function EmailServerSettingsPage() {
  const user = await requireAdmin();
  const isAdmin = user.role === "admin";
  const mail = await resolveMailConfig();

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Settings" description="Who is told about website submissions, and how the site sends email." />
      <SettingsTabs current="email" />

      {isAdmin ? <AdminView email={user.email} mail={mail} /> : (
        <Panel className="p-5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Email server</h2>
          <p className="mt-1 text-sm text-ink/60">Only admins can view or change the email server.</p>
          <div className="mt-5">
            <MailStatusSummary mail={mail} detailed={false} />
          </div>
        </Panel>
      )}
    </div>
  );
}

async function AdminView({ email, mail }: { email: string; mail: Awaited<ReturnType<typeof resolveMailConfig>> }) {
  const s = await readSettingsIncludingSecrets();
  const passwordSaved = Boolean(s.smtp_pass);
  const passwordUnreadable = passwordSaved && openSecret(s.smtp_pass) === null;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-12">
      <Panel className="p-5 sm:p-8 xl:col-span-7">
        <h2 className="font-display text-2xl font-semibold">SMTP server</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          Every email the website sends — form notifications, confirmations, password reset links and tests — goes through this
          server. Get these details from your email provider.
        </p>
        <div className="mt-6">
          {/* only non-secret values are passed to the browser */}
          <EmailServerForm
            initial={{
              smtp_host: s.smtp_host,
              smtp_port: s.smtp_port,
              smtp_security: s.smtp_security,
              smtp_user: s.smtp_user,
              mail_from_address: s.mail_from_address,
              mail_from_name: s.mail_from_name,
            }}
            passwordSaved={passwordSaved}
            passwordUnreadable={passwordUnreadable}
            encryptionReady={encryptionAvailable()}
          />
        </div>
      </Panel>

      <div className="space-y-6 xl:sticky xl:top-8 xl:col-span-5">
        <Panel className="p-5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">In use now</h2>
          <div className="mt-4">
            <MailStatusSummary mail={mail} detailed />
          </div>
        </Panel>

        <Panel className="p-5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Send a test</h2>
          <p className="mt-1 text-sm text-ink/60">Sends a real email using the settings in use now. Save any changes first.</p>
          <div className="mt-5">
            <TestEmailForm defaultTo={email} disabled={!mail.configured} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
