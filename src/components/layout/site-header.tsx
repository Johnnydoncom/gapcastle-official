"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ChevronDown, Clock, Close, Mail, Menu, Phone } from "@/components/ui/icons";
import { allNavLinks, primaryNav, site, telHref } from "@/lib/site";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus after navigation. Adjusting state during render avoids an extra effect-driven pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  const openWithDelay = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ---------- utility bar ---------- */}
      <div className="bg-castle-900 text-[13px] text-white/85">
        <div className="container-editorial flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-5">
            <a
              href={telHref(site.phones[0])}
              className="flex items-center gap-2 transition-colors hover:text-gold-400"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{site.phones[0]}</span>
              <span className="sm:hidden">Call us</span>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="hidden items-center gap-2 transition-colors hover:text-gold-400 md:flex"
            >
              <Mail className="h-3.5 w-3.5" />
              {site.email}
            </a>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-2 text-white/60 lg:flex">
              <Clock className="h-3.5 w-3.5" />
              Mon–Fri, 9:00am–4:00pm
            </span>
            <span className="flex items-center gap-2 font-semibold text-gold-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
              </span>
              Funds in under 24 hours
            </span>
          </div>
        </div>
      </div>

      {/* ---------- main bar ---------- */}
      <div
        className={cn(
          "border-b border-castle-100 bg-white/92 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_10px_30px_-20px_rgb(14_18_56_/_0.5)]",
        )}
      >
        <div className="container-editorial flex h-20 items-center justify-between gap-6">
          <Link href="/" aria-label={`${site.name} — home`} className="shrink-0">
            <Image
              src="/logo-lockup.png"
              alt={`${site.name} — ${site.tagline}`}
              width={2137}
              height={1538}
              priority
              className="h-12 w-auto lg:h-14"
            />
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              if (!item.menu) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors",
                      active ? "text-castle-600" : "text-ink/75 hover:text-castle-600",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              const open = openMenu === item.label;
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => openWithDelay(item.label)}
                  onMouseLeave={closeWithDelay}
                >
                  <Link
                    href={item.href}
                    aria-expanded={open}
                    onFocus={() => openWithDelay(item.label)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors",
                      active || open ? "text-castle-600" : "text-ink/75 hover:text-castle-600",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        open && "rotate-180",
                      )}
                    />
                  </Link>

                  <div
                    className={cn(
                      "absolute top-full left-1/2 w-[640px] -translate-x-1/2 pt-3 transition-all duration-200",
                      open
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0",
                    )}
                  >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-3xl border border-castle-100 bg-white p-6 shadow-lift-lg">
                      {item.menu.map((group) => (
                        <div key={group.heading}>
                          <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">
                            {group.heading}
                          </p>
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-castle-50"
                            >
                              <span className="block text-[14.5px] font-semibold text-ink">
                                {link.label}
                              </span>
                              <span className="mt-0.5 block text-[13px] leading-snug text-ink/60">
                                {link.blurb}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ButtonLink href="/apply/school-fee-loan" variant="accent" withArrow className="hidden md:inline-flex">
              Apply for a loan
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="grid h-11 w-11 place-items-center rounded-full border border-castle-200 text-castle-700 transition-colors hover:bg-castle-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- mobile drawer ---------- */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-castle-950/45 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-castle-100 px-5 py-4">
            <Image
              src="/logo-lockup.png"
              alt=""
              width={2137}
              height={1538}
              className="h-10 w-auto"
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-castle-200 text-castle-700"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Mobile">
            <ul className="space-y-1">
              {allNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[15.5px] font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-castle-50 text-castle-600"
                        : "text-ink/80 hover:bg-castle-50",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 mb-2 px-4 text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">
              Apply now
            </p>
            <ul className="space-y-1">
              {primaryNav[1].menu?.[0].links.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl px-4 py-2.5 text-[14.5px] text-ink/70 hover:bg-castle-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-castle-100 p-4">
            <ButtonLink href="/apply/school-fee-loan" variant="accent" withArrow className="w-full">
              Apply for a loan
            </ButtonLink>
            <a
              href={telHref(site.phones[0])}
              className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-castle-700"
            >
              <Phone className="h-4 w-4" />
              {site.phones[0]}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
