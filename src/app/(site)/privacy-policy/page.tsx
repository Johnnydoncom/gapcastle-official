import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { Container, Section } from "@/components/ui/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Gap Castle Limited collects, uses, shares and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

const updated = "11 September 2026";

type Block = { heading: string; paragraphs?: string[]; list?: string[] };

const blocks: Block[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `${site.legalName} ("Gap Castle", "we", "us") is a company incorporated in Nigeria and registered to carry on money lending, bill payments and other financial services. We are the controller of the personal data described in this policy.`,
      `Our office is at ${site.address.full}. You can reach us at ${site.email} or ${site.phones[0]}.`,
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["We collect only what we need to provide the service you ask for:"],
    list: [
      "Loan applications — your name, date of birth, contact details, home and office addresses, and the details of the loan you request, including business, school, travel or employment information.",
      "Enquiries — your name, contact details and the content of your message.",
      "Fun Food Factory — registration details, including household and employment information you choose to share, and donation pledges.",
      "Technical data — your IP address and browser type when you submit a form, used to prevent fraud and abuse.",
    ],
  },
  {
    heading: "How we use it",
    list: [
      "To assess, process and manage your loan application and any resulting loan.",
      "To verify your identity and the information you provide, and to prevent fraud.",
      "To respond to your enquiries and keep you informed about your application.",
      "To organise Fun Food Factory events and acknowledge donations.",
      "To meet our legal and regulatory obligations.",
    ],
  },
  {
    heading: "Our legal basis",
    paragraphs: [
      "We process personal data in line with the Nigeria Data Protection Act 2023. Depending on the activity, we rely on your consent, the need to take steps at your request before entering into a contract, compliance with a legal obligation, or our legitimate interest in running a safe and sound lending business.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: ["We do not sell your personal data. We share it only where necessary:"],
    list: [
      "Partner banks, lenders and finance houses — when you ask us to arrange a facility through them.",
      "Service providers who host our systems or help us verify information, under contracts that require them to protect it.",
      "Regulators, law enforcement or courts — where the law requires us to.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep application and loan records for as long as the relationship lasts and afterwards for the period required by law and for resolving disputes. Enquiries and event registrations are kept only as long as they are useful for the purpose they were collected for.",
    ],
  },
  {
    heading: "How we protect it",
    paragraphs: [
      "Information is transmitted over encrypted connections and stored on access-controlled systems. Only staff who need your information to do their job can see it.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: ["Subject to the law, you have the right to:"],
    list: [
      "Ask for a copy of the personal data we hold about you.",
      "Ask us to correct information that is inaccurate or incomplete.",
      "Ask us to delete your data, or to restrict or object to how we use it.",
      "Withdraw consent at any time, where we rely on consent.",
      "Complain to the Nigeria Data Protection Commission if you are unhappy with how we handle your data.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "This website uses only the cookies it needs to work, such as keeping authorised staff signed in to the administration area. We do not use advertising cookies.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      `To exercise your rights or ask a question about this policy, email ${site.email} or write to us at ${site.address.full}. We may update this policy from time to time; the date at the top shows when it last changed.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Privacy policy" }]}
        eyebrow="Legal"
        title="Privacy policy"
        lede={<>How we collect, use and protect your personal information. Last updated {updated}.</>}
      />

      <Section tone="white">
        <Container className="grid gap-12 lg:grid-cols-12">
          <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-32 space-y-2.5 border-l border-castle-100 pl-5 text-sm">
              {blocks.map((b, i) => (
                <li key={b.heading}>
                  <a href={`#s-${i}`} className="text-ink/60 transition-colors hover:text-castle-600">
                    {b.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="max-w-2xl lg:col-span-8 lg:col-start-5">
            {blocks.map((b, i) => (
              <section key={b.heading} id={`s-${i}`} className="scroll-mt-32 border-b border-castle-100 py-9 first:pt-0 last:border-0">
                <h2 className="font-display text-2xl font-semibold">
                  <span className="mr-3 text-base font-bold text-gold-600">{String(i + 1).padStart(2, "0")}</span>
                  {b.heading}
                </h2>
                {b.paragraphs?.map((p) => (
                  <p key={p.slice(0, 30)} className="mt-4 leading-relaxed text-ink/70">
                    {p}
                  </p>
                ))}
                {b.list && (
                  <ul className="mt-4 space-y-3">
                    {b.list.map((item) => (
                      <li key={item.slice(0, 30)} className="flex gap-3 leading-relaxed text-ink/70">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </Container>
      </Section>
    </>
  );
}
