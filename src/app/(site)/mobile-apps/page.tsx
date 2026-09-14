import type { Metadata } from "next";
import Image from "next/image";
import { AppStoreButtons } from "@/components/shared/app-store-buttons";
import { CtaBand } from "@/components/shared/cta-band";
import { Breadcrumbs } from "@/components/shared/page-hero";
import { PhoneMock } from "@/components/shared/phone-mock";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mobile Apps",
  description:
    "Download the Gap Castle app for Android and iOS. Fund your wallet, pay bills, buy airtime and data, and keep every receipt in one place.",
  alternates: { canonical: "/mobile-apps" },
};

const features = [
  { title: "Wallet", body: "Fund your Gap Castle wallet and keep a balance ready for bills and top-ups." },
  { title: "Bills in seconds", body: "Electricity, airtime, data and TV — all paid from the same screen." },
  { title: "Saved beneficiaries", body: "Store the meters and numbers you pay often and skip the typing next time." },
  { title: "Complete history", body: "Every transaction and receipt, kept together and easy to find." },
  { title: "Support built in", body: "Raise a request from inside the app and follow it through to a resolution." },
  { title: "One account", body: "What you do in the app is on the web portal too — and the other way round." },
];

const start = [
  { title: "Download the app", body: "Get Gap Castle from the App Store or Google Play." },
  { title: "Create your account", body: "Sign up with your phone number and verify your details." },
  { title: "Fund and pay", body: "Top up your wallet, then pay your first bill in seconds." },
];

export default function MobileAppsPage() {
  return (
    <>
      {/* ---------- hero: the product itself, on navy ---------- */}
      <section className="relative overflow-hidden bg-castle-900 text-white">
        <svg
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[-12%] h-[860px] w-[860px] -translate-y-1/2 text-white/7"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 4" />
          <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <div className="relative container-editorial pt-8 pb-20 lg:pt-12 lg:pb-28">
          <Breadcrumbs items={[{ label: "Mobile apps" }]} tone="dark" />
          <div className="mt-10 grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <p className="rise flex items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] text-azure-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-azure-500" />
                Android & iOS
              </p>
              <h1
                className="rise mt-5 font-display text-[clamp(2.5rem,1.5rem+4vw,4.2rem)] leading-[1.03] font-semibold"
                style={{ "--rise-delay": "60ms" } as React.CSSProperties}
              >
                Gap Castle, <span className="text-azure-400">in your pocket.</span>
              </h1>
              <p
                className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/70"
                style={{ "--rise-delay": "120ms" } as React.CSSProperties}
              >
                Pay bills, buy airtime and data, fund your wallet and keep every receipt — from a phone that is
                already in your hand.
              </p>
              <div className="rise mt-9" style={{ "--rise-delay": "180ms" } as React.CSSProperties}>
                <AppStoreButtons />
              </div>
              <p className="rise mt-5 text-sm text-white/50" style={{ "--rise-delay": "220ms" } as React.CSSProperties}>
                Prefer the browser?{" "}
                <a href={site.payPortal} target="_blank" rel="noreferrer noopener" className="font-semibold text-azure-400 underline-offset-4 hover:underline">
                  Use the web portal
                </a>
              </p>
            </div>
            <div className="rise lg:col-span-5 lg:col-start-8" style={{ "--rise-delay": "140ms" } as React.CSSProperties}>
              <PhoneMock />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- features: numbered editorial columns ---------- */}
      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>What the app does</Eyebrow>
            <SectionTitle>Small screen. Everything you need.</SectionTitle>
          </Reveal>
          <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal as="li" key={f.title} delay={i * 60} className="border-t border-castle-200 pt-6">
                <span className="font-display text-sm font-bold text-azure-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-2xl font-semibold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/60">{f.body}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------- same account, web or app ---------- */}
      <Section tone="paper" className="overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal as="figure" className="relative lg:col-span-6">
            <div aria-hidden className="absolute -top-6 -left-5 h-32 w-32 rounded-[26px] bg-azure-500 lg:-top-8 lg:-left-8" />
            <Image
              src="/images/lagos-cbd.jpg"
              alt="The Lagos central business district skyline"
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="photo-tone relative h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[440px]"
            />
          </Reveal>
          <Reveal delay={100} className="lg:col-span-5 lg:col-start-8">
            <Eyebrow>Web or app</Eyebrow>
            <SectionTitle>One account, wherever you are.</SectionTitle>
            <p className="mt-5 leading-relaxed text-ink/65">
              Start a payment at your desk and check the receipt on the bus home. Your Gap Castle account is the
              same on the web portal and in the app, so nothing is ever in the wrong place.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href={site.payPortal} withArrow>
                Open the web portal
              </ButtonLink>
              <TextLink href="/bill-payments">About bill payments</TextLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- get started ---------- */}
      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Get started</Eyebrow>
            <SectionTitle>Up and running in three steps.</SectionTitle>
          </Reveal>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {start.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 100} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-castle-600 font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/60">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <CtaBand
        title="Need a loan as well?"
        body="The app handles everyday payments. For school fees, travel, personal or business finance, apply online in about five minutes."
        primary={{ href: "/loans", label: "Explore loan products" }}
      />
    </>
  );
}
