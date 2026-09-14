import type { Metadata } from "next";
import { ChangePasswordForm, ProfileForm } from "@/components/admin/settings-forms";
import { AdminHeading, Panel, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-guard";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading
        title="My account"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Signed in as {user.email} <StatusBadge status={user.role} />
          </span>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel className="p-5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Your details</h2>
          <p className="mt-1 text-sm text-ink/60">Your name appears as the author of posts you write.</p>
          <div className="mt-6">
            <ProfileForm name={user.name} email={user.email} />
          </div>
        </Panel>

        <Panel className="p-5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Password</h2>
          <p className="mt-1 text-sm text-ink/60">Changing it signs you out everywhere else.</p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </Panel>
      </div>
    </div>
  );
}
