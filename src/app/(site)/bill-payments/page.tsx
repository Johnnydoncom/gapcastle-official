import type { Metadata } from "next";
import { AppStoreButtons } from "@/components/shared/app-store-buttons";
import { CtaBand } from "@/components/shared/cta-band";
import { Faq } from "@/components/shared/faq";
import { PageHero } from "@/components/shared/page-hero";
import { PhoneMock } from "@/components/shared/phone-mock";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bill Payments",
  description:
    "Pay electricity bills, buy airtime and data, and renew TV subscriptions in seconds with Gap Castle — on the web portal or the mobile app.",
  alternates: { canonical: "/bill-payments" },
};

const categories = [
  {
    tag: "Prepaid & postpaid",
    name: "Electricity",
    body: "Buy prepaid tokens or settle postpaid bills for your meter without queueing at the office.",
  },
  {
    tag: "MTN · Airtel · Glo · 9mobile",
    name: "Airtime",
    body: "Top up any line on any network — your own, or the phone of someone who needs it.",
  },
  {
    tag: "All networks",
    name: "Internet data",
    body: "Daily, weekly and monthly bundles for home, work and the phone in your pocket.",
  },
  {
    tag: "Subscriptions",
    name: "TV & more",
    body: "Renew cable and satellite TV subscriptions and other household services in the same place.",
  },
];

const steps = [
  { title: "Choose what to pay", body: "Electricity, airtime, data or TV — pick the service from the portal or the app." },
  {
    title: "Enter the details",
    body: "Your meter number, phone number or smartcard number, and the amount you want to pay.",
  },
  { title: "Pay and you are done", body: "Confirm the payment and receive your token or confirmation straight away." },
];

const faqs = [
  {
    q: "Where do I make a payment?",
    a: `On the Gap Castle payment portal at ${site.payPortal.replace("https://", "")}, or in the Gap Castle mobile app. Both use the same account.`,
  },
  {
    q: "Do I need a Gap Castle loan to pay bills?",
    a: "No. Bill payments are a separate service — you do not need to have, or apply for, a loan to use them.",
  },
  {
    q: "Which networks can I buy airtime and data for?",
    a: "MTN, Airtel, Glo and 9mobile.",
  },
  {
    q: "What if a payment does not go through?",
    a: `Keep your transaction details and contact us on ${site.phones[0]} or ${site.email}. Our team will look into it and get back to you.`,
  },
];

export default function BillPaymentsPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "Bill payments" }]}
        eyebrow="Bill payments"
        title={
          <>
            Everyday payments, <span className="text-castle-600">zero wahala.</span>
          </>
        }
        lede="Pay utility bills, buy airtime and internet data, and renew subscriptions from our web platform or the mobile app — in the time it takes to read this sentence."
        image={{
          src: "/images/phone-hands.jpg",
          alt: "Hands holding a smartphone with an illuminated screen",
        }}
        accent="sky"
        actions={
          <>
            <ButtonLink href={site.payPortal} size="lg" withArrow>
              Pay a bill now
            </ButtonLink>
            <TextLink href="/mobile-apps">Get the mobile app</TextLink>
          </>
        }
      />

      {/* ---------- categories: a typographic grid, not an icon grid ---------- */}
      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>What you can pay</Eyebrow>
            <SectionTitle>The bills that never skip a month.</SectionTitle>
          </Reveal>

          <div className="mt-12 grid border-t border-l border-castle-200 sm:grid-cols-2">
            {categories.map((c, i) => (
              <Reveal
                key={c.name}
                delay={i * 80}
                className="group border-r border-b border-castle-200 p-7 transition-colors hover:bg-castle-50 lg:p-10"
              >
                <p className="text-[11px] font-bold tracking-[0.18em] text-castle-600 uppercase">{c.tag}</p>
                <h3 className="mt-3 font-display text-[clamp(2rem,1.5rem+1.8vw,3rem)] leading-none font-semibold">
                  {c.name}
                </h3>
                <p className="mt-4 max-w-sm leading-relaxed text-ink/60">{c.body}</p>
                <a
                  href={site.payPortal}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-span mt-6 inline-flex items-center gap-2 text-sm font-semibold text-castle-600"
                >
                  Pay {c.name.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- how it works ---------- */}
      <Section tone="paper">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle>Three taps from bill to done.</SectionTitle>
          </Reveal>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 100} className="border-t-2 border-castle-600 pt-6">
                <span className="font-display text-5xl leading-none font-semibold text-castle-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/60">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------- app band ---------- */}
      <Section tone="deep" className="overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow tone="light">On the move</Eyebrow>
            <SectionTitle className="text-white">Your bills, in your pocket.</SectionTitle>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">
              The Gap Castle app puts every bill, top-up and receipt one tap away — and it is the same account
              you use on the web.
            </p>
            <AppStoreButtons className="mt-9" />
            <div className="mt-6">
              <ButtonLink href="/mobile-apps" variant="onDark" withArrow>
                See what the app does
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={140} className="lg:col-span-5 lg:col-start-8">
            <PhoneMock />
          </Reveal>
        </Container>
      </Section>

      <Faq items={faqs} title="Good to know." />
      <CtaBand
        title="Ready to clear this month's bills?"
        body="Open the payment portal and pay in seconds — or call us if you need a hand getting started."
        primary={{ href: site.payPortal, label: "Open the payment portal" }}
      />
    </>
  );
}
