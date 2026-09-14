import type { Metadata } from "next";
import { AddUserForm } from "@/components/admin/settings-forms";
import { AdminHeading, DatabaseError, Notice, Panel, PanelHeader, StatusBadge, param } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-guard";
import { listUsers } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/format";
import { resolveMailConfig } from "@/lib/mailer";
import { sendUserResetLink, updateUserAccess } from "../../actions";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireAdmin("admin");
  const sp = await searchParams;
  const resetFor = Number(param(sp, "reset"));

  let people: Awaited<ReturnType<typeof listUsers>>;
  try {
    people = await listUsers();
  } catch (error) {
    return <DatabaseError error={error} />;
  }
  const resetUser = people.find((u) => u.id === resetFor);
  const mail = await resolveMailConfig();

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeading title="Users" description="Everyone who can sign in to this admin." />

      {resetUser && (
        <Notice>
          A password reset link is being emailed to {resetUser.email}. It expires in 60 minutes. Check the email log if it does not
          arrive.
        </Notice>
      )}

      {!mail.configured && (
        <Notice tone="info">
          Password reset links cannot be emailed yet — {mail.reason.replace(/\.$/, "")}. Until then, use{" "}
          <code className="font-mono">npm run user:password</code> on the server.
        </Notice>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-7">
          <PanelHeader title="Accounts" description={`${people.length} account${people.length === 1 ? "" : "s"}`} />
          <ul className="divide-y divide-castle-100">
            {people.map((u) => {
              const isMe = u.id === me.id;
              return (
                <li key={u.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{u.name}</span>
                    <StatusBadge status={u.role} />
                    {!u.is_active && <StatusBadge status="deactivated" />}
                    {isMe && <span className="text-xs font-semibold text-ink/50">(you)</span>}
                  </div>
                  <p className="mt-0.5 text-sm break-all text-ink/60">{u.email}</p>
                  <p className="text-xs text-ink/50">Last sign-in {u.last_login_at ? formatDateTime(u.last_login_at) : "never"}</p>

                  {!isMe && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <form action={updateUserAccess} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <label htmlFor={`role-${u.id}`} className="sr-only">
                          Role
                        </label>
                        <select
                          id={`role-${u.id}`}
                          name="role"
                          defaultValue={u.role}
                          className="h-9 rounded-lg border border-castle-200 bg-white px-2.5 text-sm outline-none focus:border-castle-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="h-9 rounded-lg bg-castle-600 px-3 text-sm font-semibold text-white hover:bg-castle-700">
                          Save role
                        </button>
                      </form>
                      <form action={updateUserAccess}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="active" value={u.is_active ? "0" : "1"} />
                        <button type="submit" className="h-9 rounded-lg border border-castle-200 px-3 text-sm font-semibold hover:bg-castle-50">
                          {u.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                      {u.is_active ? (
                        <form action={sendUserResetLink}>
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit" className="h-9 rounded-lg border border-castle-200 px-3 text-sm font-semibold hover:bg-castle-50">
                            Send reset link
                          </button>
                        </form>
                      ) : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel className="p-5 sm:p-6 xl:col-span-5">
          <h2 className="font-display text-xl font-semibold">Add a user</h2>
          <p className="mt-1 text-sm text-ink/60">They can change the temporary password from My account, or reset it by email.</p>
          <div className="mt-5">
            <AddUserForm />
          </div>
        </Panel>
      </div>
    </div>
  );
}
