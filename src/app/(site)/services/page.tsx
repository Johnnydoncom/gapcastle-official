import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { ArrowRight, Check } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { loanProducts, services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Loans for school fees, travel, personal needs and business; business review and financial advisory; large business financing through partner lenders; and bill payments — all from Gap Castle.",
  alternates: { canonical: "/services" },
};

const advisory = services.find((s) => s.id === "advisory")!;
const large = services.find((s) => s.id === "large-financing")!;
const bills = services.find((s) => s.id === "bills")!;

const index = [
  ...loanProducts.map((p) => ({
    n: p.index,
    name: p.name,
    line: p.promise,
    href: `/loans/${p.slug}`,
    image: p.image.src,
  })),
  { n: advisory.index, name: advisory.name, line: advisory.summary, href: "#advisory", image: advisory.image!.src },
  { n: large.index, name: large.name, line: large.summary, href: "#large-financing", image: large.image!.src },
  { n: bills.index, name: bills.name, line: bills.summary, href: "/bill-payments", image: "/images/lagos-traffic.jpg" },
];

const facilities = [
  "Term loans",
  "Overdrafts",
  "Invoice discounting",
  "LPO financing",
  "Mortgage",
  "Blocked funds",
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Services" }]}
        eyebrow="Our services"
        title={
          <>
            Money for the moments that matter — <span className="text-castle-600">and the advice to use it well.</span>
          </>
        }
        lede="Seven services, one promise: we close the gap between what you need and when you can pay for it, without the runaround."
        image={{
          src: "/images/market-grain.jpg",
          alt: "Nigerian women trading grain at a busy open-air market",
        }}
        actions={
          <>
            <ButtonLink href="#index" withArrow>
              See every service
            </ButtonLink>
            <TextLink href="/contact">Book a free consultation</TextLink>
          </>
        }
      />

      {/* ---------- service index: an editorial table of contents ---------- */}
      <Section tone="white" id="index">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>The index</Eyebrow>
            <SectionTitle>Everything we do, in one place.</SectionTitle>
          </Reveal>

          <ul className="mt-12 border-t border-castle-200">
            {index.map((row, i) => (
              <Reveal as="li" key={row.n} delay={i * 50} className="border-b border-castle-200">
                <Link
                  href={row.href}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 sm:grid-cols-12 sm:gap-6 lg:py-7"
                >
                  <span className="row-span-2 self-start font-display text-lg font-bold text-gold-600 sm:col-span-1 sm:row-span-1 sm:self-center">
                    {row.n}
                  </span>
                  <span className="hidden overflow-hidden rounded-xl sm:col-span-2 sm:block">
                    <Image
                      src={row.image}
                      alt=""
                      width={1920}
                      height={1280}
                      sizes="160px"
                      className="photo-tone h-16 w-full object-cover transition-transform duration-500 group-hover:scale-110 lg:h-20"
                    />
                  </span>
                  <span className="font-display text-2xl leading-tight font-semibold transition-colors group-hover:text-castle-600 sm:col-span-4 lg:text-[1.7rem]">
                    {row.name}
                  </span>
                  <span className="col-start-2 text-[15px] leading-snug text-ink/60 sm:col-span-4 sm:col-start-auto">
                    {row.line}
                  </span>
                  <span className="row-span-2 row-start-1 col-start-3 grid h-11 w-11 place-items-center self-center rounded-full border border-castle-200 text-castle-600 transition-all duration-300 group-hover:border-castle-600 group-hover:bg-castle-600 group-hover:text-white sm:col-span-1 sm:row-span-1 sm:col-start-auto sm:justify-self-end">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------- advisory ---------- */}
      <Section tone="paper" id="advisory" className="scroll-mt-28 overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal as="figure" className="relative lg:col-span-5">
            <div aria-hidden className="absolute -top-6 -left-5 h-32 w-32 rounded-[26px] bg-castle-200 lg:-top-8 lg:-left-8" />
            <Image
              src={advisory.image!.src}
              alt={advisory.image!.alt}
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="photo-tone relative h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[460px]"
            />
          </Reveal>

          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="font-display text-lg font-bold text-gold-600">{advisory.index} — Advisory</p>
            <h2 className="mt-2 font-display text-[clamp(1.9rem,1.3rem+2.2vw,2.8rem)] leading-tight font-semibold">
              {advisory.name}
            </h2>
            <p className="mt-3 font-display text-xl text-castle-600">{advisory.summary}</p>
            <p className="mt-5 leading-relaxed text-ink/65">{advisory.body}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {advisory.points.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-castle-200">
                    <Check className="h-3 w-3 text-castle-700" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact?topic=advisory" withArrow className="mt-9">
              {advisory.ctaLabel}
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- large financing: typographic list on navy ---------- */}
      <Section tone="deep" id="large-financing" className="scroll-mt-28 overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow tone="light">{large.index} — Enterprise finance</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,1.3rem+2.2vw,2.8rem)] leading-tight font-semibold text-white">
              {large.name}
            </h2>
            <p className="mt-5 leading-relaxed text-white/65">{large.body}</p>
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              For requirements above ₦3,000,000
            </p>
            <div className="mt-9">
              <ButtonLink href="/contact?topic=large_financing" variant="accent" withArrow>
                {large.ctaLabel}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <ul className="border-t border-white/15">
              {facilities.map((f, i) => (
                <li key={f} className="group flex items-baseline justify-between gap-6 border-b border-white/15 py-5">
                  <span className="font-display text-[clamp(1.6rem,1.2rem+1.8vw,2.6rem)] leading-none font-semibold text-white transition-colors group-hover:text-gold-400">
                    {f}
                  </span>
                  <span className="font-display text-sm font-bold text-white/55">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- bills ---------- */}
      <Section tone="white" id="bills" className="scroll-mt-28 overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:order-2 lg:col-span-5 lg:col-start-8">
            <div className="relative">
              <div aria-hidden className="absolute -right-5 -bottom-6 h-32 w-32 rounded-[26px] bg-gold-500 lg:-right-8 lg:-bottom-8" />
              <Image
                src="/images/lagos-traffic.jpg"
                alt="A busy Lagos street lined with market stalls and yellow danfo buses"
                width={1920}
                height={1280}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="photo-tone relative h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[440px]"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:order-1 lg:col-span-6">
            <p className="font-display text-lg font-bold text-gold-600">{bills.index} — Everyday</p>
            <h2 className="mt-2 font-display text-[clamp(1.9rem,1.3rem+2.2vw,2.8rem)] leading-tight font-semibold">
              {bills.name}
            </h2>
            <p className="mt-5 leading-relaxed text-ink/65">{bills.body}</p>
            <ul className="mt-8 space-y-3.5">
              {bills.points.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-castle-200">
                    <Check className="h-3 w-3 text-castle-700" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href="/bill-payments" withArrow>
                {bills.ctaLabel}
              </ButtonLink>
              <TextLink href={site.payPortal}>Open the payment portal</TextLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
