import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin, type AdminRole, type AdminUser } from "@/lib/auth";

/* Server actions are public HTTP endpoints — every mutation re-checks the session. */
export async function requireAdmin(role?: AdminRole): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (role && user.role !== role) redirect("/admin");
  return user;
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export const idFrom = (formData: FormData, key = "id") => {
  const n = Number(formData.get(key));
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const pick = <T extends readonly string[]>(value: FormDataEntryValue | null, allowed: T): T[number] | null => {
  const v = String(value ?? "");
  return (allowed as readonly string[]).includes(v) ? (v as T[number]) : null;
};
