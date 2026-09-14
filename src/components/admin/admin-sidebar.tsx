"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { logout } from "@/app/(admin)/admin/actions";
import {
  IconAccount,
  IconApplications,
  IconAt,
  IconClose,
  IconExternal,
  IconGift,
  IconImage,
  IconInbox,
  IconMenu,
  IconOverview,
  IconPen,
  IconPeople,
  IconSend,
  IconSettings,
  IconSignOut,
  IconTag,
  IconUsers,
} from "@/components/admin/admin-icons";
import type { AdminRole } from "@/lib/auth";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: keyof Counts;
  adminOnly?: boolean;
};
type Counts = { applications: number; messages: number; registrations: number };

const groups: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Overview", icon: IconOverview }] },
  {
    title: "Submissions",
    items: [
      { href: "/admin/applications", label: "Loan applications", icon: IconApplications, badge: "applications" },
      { href: "/admin/messages", label: "Messages", icon: IconInbox, badge: "messages" },
      { href: "/admin/fun-food", label: "Fun Food registrations", icon: IconPeople, badge: "registrations" },
      { href: "/admin/fun-food/donations", label: "Donations", icon: IconGift },
      { href: "/admin/subscribers", label: "Subscribers", icon: IconAt },
    ],
  },
  {
    title: "Blog",
    items: [
      { href: "/admin/blog", label: "Posts", icon: IconPen },
      { href: "/admin/blog/categories", label: "Categories", icon: IconTag },
      { href: "/admin/media", label: "Media library", icon: IconImage },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: IconUsers, adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: IconSettings },
      { href: "/admin/email-log", label: "Email log", icon: IconSend },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items).concat({ href: "/admin/account", label: "My account", icon: IconAccount });

/** The most specific nav item for a path: /admin/blog/categories is Categories, not Posts. */
function activeHref(pathname: string) {
  return allItems
    .filter((item) => (item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

type Props = { user: { name: string; email: string; role: AdminRole }; counts: Counts };

export function AdminShellNav({ user, counts }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the drawer when the route changes (render-time reset, no effect needed).
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const current = allItems.find((i) => i.href === activeHref(pathname));

  return (
    <>
      {/* ---------- mobile & tablet top bar ---------- */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-castle-950 px-4 text-white lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <Image src="/logo-mark-white.png" alt="" width={1069} height={736} className="h-7 w-auto" />
          <span className="truncate font-display text-[17px] font-semibold">{current?.label ?? "Admin"}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 transition-colors hover:bg-white/10"
        >
          <IconMenu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </header>

      {/* ---------- overlay (mobile) ---------- */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-castle-950/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* ---------- sidebar: fixed on desktop, drawer on mobile ---------- */}
      <aside
        id="admin-drawer"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17.5rem] max-w-[85vw] flex-col bg-castle-950 text-white transition-transform duration-300 ease-out",
          "lg:z-20 lg:translate-x-0",
          open ? "translate-x-0 shadow-lift-lg" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5 lg:h-20">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo-mark-white.png" alt="" width={1069} height={736} className="h-8 w-auto" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">Gap Castle</span>
              <span className="block text-[11px] font-semibold tracking-[0.18em] text-azure-400 uppercase">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <IconClose className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
          {groups.map((group, gi) => {
            const items = group.items.filter((i) => !i.adminOnly || user.role === "admin");
            if (!items.length) return null;
            return (
              <div key={group.title ?? gi} className={gi > 0 ? "mt-6" : undefined}>
                {group.title && (
                  <p className="px-3 pb-2 text-[10.5px] font-bold tracking-[0.2em] text-white/40 uppercase">{group.title}</p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} active={current?.href === item.href} count={item.badge ? counts[item.badge] : 0} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <Link
            href="/admin/account"
            aria-current={current?.href === "/admin/account" ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
              current?.href === "/admin/account" ? "bg-white/10" : "hover:bg-white/5",
            )}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-azure-500 text-sm font-bold text-castle-950">
              {initials(user.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-white/55 capitalize">{user.role} · My account</span>
            </span>
          </Link>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconExternal className="h-4 w-4" />
              Website
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <IconSignOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavLink({ item, active, count }: { item: NavItem; active: boolean; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors",
        active ? "bg-white text-castle-900" : "text-white/72 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-castle-600" : "text-white/55 group-hover:text-azure-400")} />
      <span className="flex-1 truncate">{item.label}</span>
      {count > 0 && (
        <span
          className={cn(
            "min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums",
            active ? "bg-castle-600 text-white" : "bg-azure-500 text-castle-950",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
