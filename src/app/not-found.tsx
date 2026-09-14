import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { loanProducts } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative flex-1 overflow-hidden bg-paper">
        <svg
          aria-hidden
          className="pointer-events-none absolute top-10 left-1/2 h-[520px] w-[1400px] -translate-x-1/2 text-castle-200"
          viewBox="0 0 1400 520"
          fill="none"
        >
          {/* a bridge with its middle span missing */}
          <path d="M0 380 C 220 380, 360 140, 560 140" stroke="currentColor" strokeWidth="2" />
          <path d="M840 140 C 1040 140, 1180 380, 1400 380" stroke="currentColor" strokeWidth="2" />
          <circle cx="560" cy="140" r="6" className="fill-azure-500" />
          <circle cx="840" cy="140" r="6" className="fill-azure-500" />
        </svg>

        <div className="relative container-editorial py-24 text-center lg:py-36">
          <p className="font-display text-[clamp(5rem,3rem+9vw,10rem)] leading-none font-semibold text-castle-600">404</p>
          <h1 className="mx-auto mt-6 max-w-xl font-display text-[clamp(1.8rem,1.3rem+2vw,2.8rem)] leading-tight font-semibold">
            This page fell through the gap.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink/60">
            The link may be old or mistyped. Let us get you back across.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/" withArrow>
              Back to home
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Contact us
            </ButtonLink>
          </div>
          <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {loanProducts.map((p) => (
              <li key={p.slug}>
                <Link href={`/loans/${p.slug}`} className="link-span font-semibold text-castle-600">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
