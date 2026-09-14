import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/shared/cta-band";
import { Faq } from "@/components/shared/faq";
import { PageHero } from "@/components/shared/page-hero";
import { ProductRow } from "@/components/shared/product-row";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { loanProducts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Loan Products",
  description:
    "Compare Gap Castle's school fee, travel, personal and business loans — what each covers, who it is for and how repayment works. Funds within 24 hours of approval.",
  alternates: { canonical: "/loans" },
};

/** At-a-glance comparison, keyed by product slug. */
const compare: Record<string, { forWho: string; covers: string; repay: string; paidTo: string }> = {
  "school-fee-loan": {
    forWho: "Parents & guardians",
    covers: "Primary and secondary school fees",
    repay: "Term-by-term instalments",
    paidTo: "Directly to the school",
  },
  "travel-loan": {
    forWho: "Students, professionals & families",
    covers: "Tickets, visas, insurance, proof of funds",
    repay: "Flexible instalments",
    paidTo: "Your travel plan",
  },
  "personal-loan": {
    forWho: "Salary earners",
    covers: "Rent, medical bills, urgent obligations",
    repay: "Monthly, in step with salary",
    paidTo: "Your account",
  },
  "business-loan": {
    forWho: "Traders, artisans & SMEs",
    covers: "Stock, equipment, working capital",
    repay: "Agreed with your loan officer",
    paidTo: "Your business account",
  },
};

const faqs = [
  {
    q: "How quickly will I receive the money?",
    a: "Applications are reviewed the same working day. Once a loan is approved, funds are disbursed within 24 hours — to the school, your travel plan, or your account.",
  },
  {
    q: "Who can apply?",
    a: "Individuals aged 18 and over, and businesses operating in Nigeria. You can apply in your own name or on behalf of a company.",
  },
  {
    q: "Do you really pay the school directly?",
    a: "Yes. Gap Castle partners with private primary and secondary schools, and school fee loans are paid straight to the school so your child's place is secured.",
  },
  {
    q: "My business needs more than ₦3,000,000. Can you help?",
    a: "Yes. We fund up to ₦3,000,000 directly. Above that, we arrange term loans, overdrafts, invoice discounting, LPO financing, mortgages and blocked funds through our partner banks and finance houses.",
  },
  {
    q: "What documents will I need?",
    a: "It depends on the product and the amount. Typically a valid ID, proof of address and a recent bank statement. Your loan officer confirms the exact list after you apply — you do not upload anything on the form.",
  },
  {
    q: "Can I apply in person instead?",
    a: "Of course. Visit our office at 29b Olorunnimbe Street, Wemabod Estate, off Adeniyi Jones, Ikeja, Monday to Friday between 9am and 4pm.",
  },
];

export default function LoansPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Loan products" }]}
        eyebrow="Loan products"
        title={
          <>
            Four ways <span className="text-castle-600">across the gap.</span>
          </>
        }
        lede="Each Gap Castle loan is built around one real situation — a school term, a journey, a month that runs short, a business that needs stock. Find yours, then apply in about five minutes."
        image={{
          src: "/images/graduation.jpg",
          alt: "Graduating Nigerian university students in red gowns celebrating together",
        }}
        actions={
          <>
            <ButtonLink href="#compare" withArrow>
              Compare products
            </ButtonLink>
            <TextLink href="/contact?topic=general">Talk to a loan officer</TextLink>
          </>
        }
      />

      {/* ---------- comparison ---------- */}
      <Section tone="white" id="compare">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>At a glance</Eyebrow>
            <SectionTitle>Which loan fits your situation?</SectionTitle>
          </Reveal>

          <Reveal delay={100} className="mt-12 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <caption className="sr-only">Comparison of Gap Castle loan products</caption>
              <thead>
                <tr className="border-b-2 border-castle-600 text-[11px] font-bold tracking-[0.18em] text-castle-600 uppercase">
                  <th scope="col" className="py-4 pr-6 font-bold">Product</th>
                  <th scope="col" className="py-4 pr-6 font-bold">Best for</th>
                  <th scope="col" className="py-4 pr-6 font-bold">Covers</th>
                  <th scope="col" className="py-4 pr-6 font-bold">Repayment</th>
                  <th scope="col" className="py-4 pr-6 font-bold">Paid to</th>
                  <th scope="col" className="py-4"><span className="sr-only">Apply</span></th>
                </tr>
              </thead>
              <tbody>
                {loanProducts.map((p) => {
                  const row = compare[p.slug];
                  return (
                    <tr key={p.slug} className="group border-b border-castle-100 align-top transition-colors hover:bg-castle-50/70">
                      <th scope="row" className="py-6 pr-6">
                        <span className="block font-display text-sm font-bold text-gold-600">{p.index}</span>
                        <Link
                          href={`/loans/${p.slug}`}
                          className="mt-1 block font-display text-xl font-semibold text-ink transition-colors hover:text-castle-600"
                        >
                          {p.name}
                        </Link>
                      </th>
                      <td className="py-6 pr-6 text-[15px] text-ink/70">{row.forWho}</td>
                      <td className="py-6 pr-6 text-[15px] text-ink/70">{row.covers}</td>
                      <td className="py-6 pr-6 text-[15px] text-ink/70">{row.repay}</td>
                      <td className="py-6 pr-6 text-[15px] font-medium text-ink">{row.paidTo}</td>
                      <td className="py-6 text-right">
                        <Link
                          href={`/apply/${p.slug}`}
                          aria-label={`Apply for a ${p.name}`}
                          className="inline-grid h-11 w-11 place-items-center rounded-full border border-castle-200 text-castle-600 transition-all group-hover:border-castle-600 group-hover:bg-castle-600 group-hover:text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- product spreads ---------- */}
      <Section tone="paper" className="overflow-hidden">
        <Container>
          <div className="space-y-24 lg:space-y-32">
            {loanProducts.map((product, i) => (
              <div key={product.slug} id={product.slug} className="scroll-mt-32">
                <ProductRow product={product} flip={i % 2 === 1} />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- larger facilities ---------- */}
      <Section tone="deep" size="tight">
        <Container className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <Eyebrow tone="light">Need more than ₦3,000,000?</Eyebrow>
            <p className="mt-4 font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.3rem)] leading-snug font-semibold">
              We take larger business requirements to our partner banks and finance houses — and negotiate
              the structure for you.
            </p>
          </div>
          <ButtonLink href="/services#large-financing" variant="accent" size="lg" withArrow>
            Large business financing
          </ButtonLink>
        </Container>
      </Section>

      <Faq items={faqs} title="Before you apply." />
      <CtaBand
        title="Not sure which loan is right?"
        body="Tell us what you are trying to pay for. A loan officer will recommend the right product — or tell you honestly if we are not the right fit."
        primary={{ href: "/contact?topic=general", label: "Ask a loan officer" }}
      />
    </>
  );
}
