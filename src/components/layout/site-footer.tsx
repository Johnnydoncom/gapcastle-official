import Image from "next/image";
import Link from "next/link";
import { Clock, Facebook, Mail, Phone, Pin, WhatsApp } from "@/components/ui/icons";
import { loanProducts, site, telHref } from "@/lib/site";

const company = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services" },
  { label: "Fun Food Factory", href: "/fun-food-factory" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export function SiteFooter() {
  return (
    <footer className="bg-castle-900 text-white">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        {/* brand */}
        <div className="lg:col-span-4">
          <Link href="/" aria-label={`${site.name} — home`}>
            <Image
              src="/logo-lockup-white.png"
              alt={`${site.name} — ${site.tagline}`}
              width={2137}
              height={1538}
              className="h-16 w-auto"
            />
          </Link>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/60">
            Duly incorporated under the laws of the Federal Republic of Nigeria and registered
            to carry on money lending, bill payments and other financial services.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Gap Castle on Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-azure-500 hover:bg-azure-500 hover:text-castle-900"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={site.social.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Chat with Gap Castle on WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-azure-500 hover:bg-azure-500 hover:text-castle-900"
            >
              <WhatsApp className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* company */}
        <div className="lg:col-span-2">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-azure-400 uppercase">Company</h2>
          <ul className="mt-5 space-y-3 text-[15px] text-white/65">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-azure-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* products */}
        <div className="lg:col-span-2">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-azure-400 uppercase">
            Loan Products
          </h2>
          <ul className="mt-5 space-y-3 text-[15px] text-white/65">
            {loanProducts.map((p) => (
              <li key={p.slug}>
                <Link href={`/loans/${p.slug}`} className="transition-colors hover:text-azure-400">
                  {p.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bill-payments" className="transition-colors hover:text-azure-400">
                Bill Payments
              </Link>
            </li>
            <li>
              <Link href="/mobile-apps" className="transition-colors hover:text-azure-400">
                Mobile Apps
              </Link>
            </li>
          </ul>
        </div>

        {/* visit */}
        <div className="lg:col-span-4">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-azure-400 uppercase">Visit Us</h2>
          <ul className="mt-5 space-y-4 text-[15px] text-white/65">
            <li className="flex gap-3">
              <Pin className="mt-0.5 h-4 w-4 shrink-0 text-azure-400" />
              <span>{site.address.full}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-azure-400" />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-azure-400">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-azure-400" />
              <span className="flex flex-col gap-1">
                {site.phones.slice(0, 2).map((p) => (
                  <a key={p} href={telHref(p)} className="transition-colors hover:text-azure-400">
                    {p}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-azure-400" />
              <span>
                {site.hours.weekdays}
                <br />
                <span className="text-white/55">{site.hours.weekend}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-editorial flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-white/55">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>
            Registered money lender · Incorporated in Nigeria since {site.incorporated} ·{" "}
            <Link href="/image-credits" className="underline-offset-4 transition-colors hover:text-azure-400 hover:underline">
              Image credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
