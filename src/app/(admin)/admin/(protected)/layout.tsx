import { redirect } from "next/navigation";
import { AdminShellNav } from "@/components/admin/admin-sidebar";
import { MarkerStaffReporter } from "@/components/shared/marker-widget";
import { navCounts } from "@/lib/admin-data";
import { getCurrentAdmin } from "@/lib/auth";
import { markerEnabled } from "@/lib/marker";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");

  const counts = await navCounts();

  return (
    <div className="min-h-full flex-1 lg:pl-[17.5rem]">
      <AdminShellNav user={{ name: user.name, email: user.email, role: user.role }} counts={counts} />
      {markerEnabled() && <MarkerStaffReporter email={user.email} fullName={user.name} role={user.role} />}
      <main className="mx-auto w-full max-w-[84rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
