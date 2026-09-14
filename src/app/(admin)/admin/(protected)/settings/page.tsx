import type { Metadata } from "next";
import Link from "next/link";
import { MailStatusSummary } from "@/components/admin/mail-status";
import { NotificationSettingsForm } from "@/components/admin/settings-forms";
import { AdminHeading, Panel, SettingsTabs } from "@/components/admin/ui";
import { getCurrentAdmin } from "@/lib/auth";
import { resolveMailConfig } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentAdmin();
  const isAdmin = user?.role === "admin";
  const [settings, mail] = await Promise.all([getSettings(), resolveMailConfig()]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Settings" description="Who is told about website submissions, and how the site sends email." />
      <SettingsTabs current="general" />

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Panel className="p-5 sm:p-8 xl:col-span-7">
          <h2 className="font-display text-2xl font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-ink/60">Where website submissions are sent, and what visitors receive.</p>
          <div className="mt-6">
            {isAdmin ? (
              <NotificationSettingsForm
                settings={{
                  notification_emails: settings.notification_emails,
                  send_confirmation_emails: settings.send_confirmation_emails,
                  blog_posts_per_page: settings.blog_posts_per_page,
                }}
              />
            ) : (
              <dl className="grid gap-4 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                <dt className="text-ink/60">Sent to</dt>
                <dd className="break-all">{settings.notification_emails}</dd>
                <dt className="text-ink/60">Confirmations</dt>
                <dd>{settings.send_confirmation_emails === "1" ? "On" : "Off"}</dd>
                <dt className="text-ink/60">Posts per page</dt>
                <dd>{settings.blog_posts_per_page}</dd>
                <dd className="text-ink/55 sm:col-span-2">Only admins can change these settings.</dd>
              </dl>
            )}
          </div>
        </Panel>

        <Panel className="p-5 sm:p-8 xl:col-span-5">
          <h2 className="font-display text-2xl font-semibold">Email delivery</h2>
          <div className="mt-4">
            <MailStatusSummary mail={mail} detailed={isAdmin} />
          </div>
          {isAdmin && (
            <Link
              href="/admin/settings/email"
              className="mt-6 flex w-full items-center justify-center rounded-full border border-castle-200 px-5 py-2.5 font-semibold text-castle-700 hover:bg-castle-50 sm:w-auto sm:inline-flex"
            >
              Configure the email server
            </Link>
          )}
        </Panel>
      </div>
    </div>
  );
}
