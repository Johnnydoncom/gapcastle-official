import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoanApplicationForm } from "@/components/forms/loan-application-form";
import { Check, Phone, WhatsApp } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { loanBySlug, loanProducts, site, telHref } from "@/lib/site";
import type { LoanType } from "@/lib/validation";

export const dynamicParams = false;

export function generateStaticParams() {
  return loanProducts.map((p) => ({ product: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apply/[product]">): Promise<Metadata> {
  const product = loanBySlug((await params).product);
  if (!product) return {};
  return {
    title: `Apply for a ${product.name}`,
    description: `Apply online for a Gap Castle ${product.name}. ${product.promise} Decisions within one working day.`,
    alternates: { canonical: `/apply/${product.slug}` },
  };
}

/** Indicative documents per product — the loan officer confirms the exact list. */
const documents: Record<LoanType, string[]> = {
  school: [
    "A valid government ID — NIN slip, passport or driver's licence",
    "The school's fee invoice or bill for the term",
    "Proof of address, such as a recent utility bill",
    "Bank statement for the last 3–6 months",
  ],
  travel: [
    "A valid international passport",
    "Admission, invitation or itinerary documents",
    "Bank statement for the last 6 months",
    "Proof of address, such as a recent utility bill",
  ],
  personal: [
    "A valid government ID — NIN slip, passport or driver's licence",
    "Employment letter or your last three payslips",
    "Salary account statement for the last 6 months",
    "Proof of address, such as a recent utility bill",
  ],
  business: [
    "CAC registration documents, if the business is registered",
    "Valid ID for the owner or directors",
    "Business account statement for the last 6–12 months",
    "Any invoice, LPO or contract the funding relates to",
  ],
};

export default async function ApplyPage({ params }: PageProps<"/apply/[product]">) {
  const product = loanBySlug((await params).product);
  if (!product) notFound();
  const loanType = product.dbType as LoanType;

  return (
    <>
      {/* ---------- header band ---------- */}
      <section className="border-b border-castle-100 bg-paper">
        <div className="container-editorial pt-10 pb-10 lg:pt-14 lg:pb-12">
          <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/loans" className="hover:text-castle-600">
                  Loan products
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/loans/${product.slug}`} className="hover:text-castle-600">
                  {product.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-medium text-ink/75">
                Apply
              </li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-[clamp(2.1rem,1.4rem+2.8vw,3.4rem)] leading-[1.06] font-semibold">
                Apply for a {product.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-ink/60">
                Three short steps, about five minutes. A loan officer contacts you within one working day,
                and approved funds move within 24 hours.
              </p>
            </div>
          </div>

          {/* product switcher — for anyone who landed on the wrong form */}
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Switch loan product">
            {loanProducts.map((p) => {
              const active = p.slug === product.slug;
              return (
                <Link
                  key={p.slug}
                  href={`/apply/${p.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-castle-600 bg-castle-600 text-white"
                      : "border-castle-200 bg-white text-ink/65 hover:border-castle-400 hover:text-castle-700",
                  )}
                >
                  {p.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- form + context ---------- */}
      <section className="bg-paper py-12 lg:py-16">
        <div className="container-editorial grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="rounded-[30px] border border-castle-100 bg-white p-6 shadow-lift sm:p-8 lg:col-span-8 lg:p-11">
            <LoanApplicationForm loanType={loanType} productName={product.name} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-32 lg:col-span-4">
            <figure className="overflow-hidden rounded-[26px] bg-castle-900 text-white">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                width={1920}
                height={1280}
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="photo-tone h-44 w-full object-cover"
              />
              <figcaption className="p-6">
                <p className="text-[11px] font-bold tracking-[0.2em] text-gold-400 uppercase">{product.kicker}</p>
                <p className="mt-2 font-display text-xl leading-snug font-semibold">{product.promise}</p>
                <ul className="mt-5 space-y-2.5">
                  {product.highlights.map((h) => (
                    <li key={h.label} className="flex gap-2.5 text-sm text-white/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                      {h.label}
                    </li>
                  ))}
                </ul>
              </figcaption>
            </figure>

            <div className="rounded-[26px] border border-castle-100 bg-white p-6">
              <h2 className="font-sans text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">
                Have these ready
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                You do not need to upload anything now. Your loan officer may ask for:
              </p>
              <ul className="mt-4 space-y-3">
                {documents[loanType].map((doc) => (
                  <li key={doc} className="flex gap-3 text-[14px] leading-snug text-ink/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[26px] bg-castle-50 p-6">
              <p className="font-display text-lg font-semibold">Prefer to talk it through?</p>
              <p className="mt-1.5 text-sm text-ink/60">
                Call the office, {site.hours.weekdays.toLowerCase()}.
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <a href={telHref(site.phones[0])} className="flex items-center gap-2.5 font-semibold text-castle-700 hover:text-castle-600">
                  <Phone className="h-4 w-4" />
                  {site.phones[0]}
                </a>
                <a
                  href={site.social.whatsapp}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 font-semibold text-castle-700 hover:text-castle-600"
                >
                  <WhatsApp className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
