import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { DonationForm, FunFoodRegistrationForm, NewsletterForm } from "@/components/forms/fun-food-forms";
import { Marquee } from "@/components/home/marquee";
import { CopyButton } from "@/components/shared/copy-button";
import { Breadcrumbs } from "@/components/shared/page-hero";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Check, Quote } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { funFood } from "@/lib/fun-food";

export const metadata: Metadata = {
  title: "Fun Food Factory",
  description:
    "Play fun games, win food items. Gap Castle's CSR programme gives members of the public free, invitation-only game days in Ikeja, Lagos — with ₦2,000 transport support. Register free or donate.",
  alternates: { canonical: "/fun-food-factory" },
};

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

const nextSteps = [
  "Registration is free — you will never be asked to pay",
  "If selected, your invitation arrives at least 48 hours before the game day",
  "On the day, you receive ₦2,000 towards transport to the venue in Ikeja",
];

/** Nigeria's flag, drawn rather than loaded — three stripes don't need an image request. */
function NigeriaFlag({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 ${className ?? ""}`}>
      <span className="w-1/3 bg-[#008751]" />
      <span className="w-1/3 bg-white" />
      <span className="w-1/3 bg-[#008751]" />
    </span>
  );
}

export default function FunFoodFactoryPage() {
  return (
    <>
      {/* ================= campaign hero ================= */}
      <section className="relative overflow-hidden bg-gold-500 text-castle-900">
        <svg
          aria-hidden
          className="pointer-events-none absolute -top-44 -right-44 h-[560px] w-[560px] text-castle-900/12"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative container-editorial pt-8 pb-20 lg:pt-12 lg:pb-24">
          <Breadcrumbs items={[{ label: "Fun Food Factory" }]} />

          <div className="mt-10 grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <p className="rise inline-flex items-center gap-2.5 rounded-full bg-castle-900 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-gold-400 uppercase">
                <NigeriaFlag />
                <span className="hidden sm:inline">Gap Castle CSR ·</span>
                {funFood.story.signoff}
              </p>
              <h1
                className="rise mt-7 font-display text-[clamp(2.8rem,1.5rem+5.4vw,5.2rem)] leading-[0.98] font-semibold tracking-tight"
                style={delay(60)}
              >
                Play fun games.
                <br />
                <span className="italic">Win food items.</span>
              </h1>
              <p className="rise mt-7 max-w-lg text-lg leading-relaxed text-castle-900/80" style={delay(120)}>
                {funFood.intro}
              </p>

              <ul className="rise mt-7 flex flex-wrap gap-2" style={delay(160)}>
                {["Free to register", "Ages 18+", "Ikeja, Lagos", "One Saturday a month"].map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-castle-900/20 bg-white/35 px-3.5 py-1.5 text-[13px] font-semibold"
                  >
                    {chip}
                  </li>
                ))}
              </ul>

              <div className="rise mt-9 flex flex-wrap items-center gap-4" style={delay(200)}>
                <ButtonLink href="#register" size="lg" withArrow className="bg-castle-900 text-white shadow-lift hover:bg-castle-800">
                  Register for free
                </ButtonLink>
                <ButtonLink href="#donate" size="lg" variant="ghost" className="border border-castle-900/25 text-castle-900 hover:bg-castle-900/8">
                  Donate
                </ButtonLink>
              </div>
            </div>

            {/* collage: event photography plus the real campaign flyer, pinned */}
            <div className="rise relative h-[440px] sm:h-[540px] lg:col-span-6" style={delay(140)}>
              <figure className="absolute top-12 left-0 h-[60%] w-[60%] -rotate-3 overflow-hidden rounded-[26px] border-8 border-white shadow-lift-lg">
                <Image
                  src="/images/community-cooking.jpg"
                  alt="Community members cooking together over open fires at a neighbourhood gathering"
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  className="photo-tone object-cover"
                />
              </figure>

              <figure className="absolute top-0 right-1 w-[40%] rotate-[4deg] sm:w-[38%]">
                <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-6 bg-white/75 shadow-sm" />
                <Image
                  src="/images/fun-food-flyer.jpg"
                  alt="Fun Food Factory flyer: stand a chance to win cartons of Indomie, spaghetti, vegetable oil, bags of 5kg rice, beans, Maggi, airtime, cash and other items"
                  width={1414}
                  height={2000}
                  priority
                  sizes="(min-width: 1024px) 22vw, 40vw"
                  className="h-auto w-full rounded-lg border-[6px] border-white shadow-lift-lg"
                />
              </figure>

              <figure className="absolute bottom-0 left-[22%] h-[34%] w-[42%] rotate-2 overflow-hidden rounded-[22px] border-[7px] border-white shadow-lift">
                <Image
                  src="/images/jollof-rice.jpg"
                  alt="A close-up of freshly cooked jollof rice"
                  fill
                  sizes="(min-width: 1024px) 22vw, 42vw"
                  className="photo-tone object-cover"
                />
              </figure>

              <div className="absolute right-2 bottom-8 grid h-28 w-28 -rotate-12 place-items-center rounded-full bg-castle-900 p-3 text-center shadow-lift-lg sm:h-32 sm:w-32">
                <span className="font-display text-lg leading-tight font-semibold text-gold-400 sm:text-xl">
                  Free
                  <br />
                  to join
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* running line of prizes — closes the hero in its own colours */}
        <div className="relative container-editorial pb-10 lg:pb-12">
          <Marquee
            label="Up for grabs"
            className="border-castle-900/20 text-castle-900"
            starClassName="text-castle-900/45"
            items={[...funFood.prizes.slice(0, 8)]}
          />
        </div>
      </section>

      {/* ================= why it exists ================= */}
      <Section tone="white">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow>Why we started</Eyebrow>
            <Quote className="mt-8 h-10 w-10 text-gold-500" />
            <p className="mt-4 font-display text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] leading-[1.15] font-semibold">
              {funFood.story.lead}
            </p>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5 lg:col-start-8 lg:pt-20">
            <div className="space-y-5 text-lg leading-relaxed text-ink/70">
              <p>{funFood.story.paragraphs[0]}</p>
              <p>
                As part of our Corporate Social Responsibility, we have decided to make some food items available to
                members of the public. This will no doubt{" "}
                <mark className="bg-gold-300/70 px-1 font-semibold text-ink">bridge the food shortage gap</mark> in some
                homes.
              </p>
              <p>{funFood.story.paragraphs[2]}</p>
            </div>
            <p className="mt-9 flex items-center gap-3 border-t border-castle-100 pt-6 font-display text-xl italic text-castle-700">
              <NigeriaFlag className="h-4 w-6" />
              {funFood.story.signoff}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ================= at a glance ================= */}
      <Section tone="deep" size="tight">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {funFood.facts.map((fact, i) => (
              <Reveal
                key={fact.label}
                delay={i * 80}
                className="flex flex-col border-white/15 py-8 max-lg:odd:border-r max-lg:odd:pr-5 max-lg:even:pl-5 max-lg:[&:nth-child(n+3)]:border-t lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="order-2 mt-3 max-w-[15rem] text-sm leading-snug text-white/70">{fact.label}</dt>
                <dd className="order-1 font-display text-[clamp(2rem,1.5rem+2vw,3.2rem)] leading-none font-semibold text-gold-400">
                  {fact.value}
                </dd>
              </Reveal>
            ))}
          </dl>
          <p className="mt-2 border-t border-white/15 pt-6 text-white/70">{funFood.schedule}</p>
        </Container>
      </Section>

      {/* ================= how it works ================= */}
      <Section tone="paper">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>How to take part</Eyebrow>
              <SectionTitle>From free registration to food on the table.</SectionTitle>
            </div>
            <TextLink href="#terms">Read the terms first</TextLink>
          </Reveal>

          <div className="relative mt-16">
            <div aria-hidden className="absolute top-7 right-[12.5%] left-[12.5%] hidden border-t-2 border-dashed border-gold-500 lg:block" />
            <ol className="relative grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {funFood.steps.map((step, i) => (
                <Reveal as="li" key={step.step} delay={i * 100} className="text-center lg:px-2">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-4 border-paper bg-gold-500 font-display text-xl font-bold text-castle-900 shadow-gold">
                    {step.step}
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{step.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink/65">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-castle-200 bg-white px-6 py-4 text-center">
            <span className="h-2 w-2 rounded-full bg-gold-500" />
            <p className="font-display text-lg font-semibold text-castle-700">{funFood.inviteOnly}</p>
            <p className="text-ink/65">Registering does not guarantee a place at a particular game day.</p>
          </Reveal>
        </Container>
      </Section>

      {/* ================= prizes ================= */}
      <Section tone="white" className="overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal as="figure" className="relative lg:col-span-5">
            <div aria-hidden className="absolute -top-6 -left-5 h-32 w-32 rounded-[26px] bg-gold-500 lg:-top-8 lg:-left-8" />
            <Image
              src="/images/market-grain.jpg"
              alt="Women selling grains and food staples at a busy Nigerian market"
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="photo-tone relative h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[520px]"
            />
            <figcaption className="absolute -right-3 -bottom-7 rounded-2xl bg-castle-900 px-5 py-4 text-white shadow-lift lg:-right-8">
              <p className="font-display text-3xl leading-none font-bold">
                10<span className="text-gold-400"> max</span>
              </p>
              <p className="mt-1.5 max-w-36 text-xs leading-snug text-white/70">winners in each game session</p>
            </figcaption>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <Eyebrow>Items to be won</Eyebrow>
            <SectionTitle>Stand a chance to win.</SectionTitle>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/65">
              Winners take home the everyday essentials that ease the pressure on a household&rsquo;s food budget.
            </p>
            <ol className="mt-10 grid border-t border-castle-200 sm:grid-cols-2 sm:gap-x-10">
              {funFood.prizes.map((prize, i) => (
                <li key={prize} className="flex items-baseline gap-4 border-b border-castle-200 py-4">
                  <span className="w-6 font-display text-sm font-bold text-gold-600">{pad(i + 1)}</span>
                  <span className="font-display text-[1.4rem] leading-tight font-semibold">{prize}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* ================= games ================= */}
      <Section tone="navy" className="overflow-hidden">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow tone="light">Proposed games</Eyebrow>
              <SectionTitle className="text-white">Games you could play on the day.</SectionTitle>
            </div>
            <p className="max-w-sm text-white/70">
              Gap Castle decides which games are played at each session, so the line-up can change.
            </p>
          </Reveal>

          <ol className="mt-12 grid grid-cols-2 border-t border-l border-white/15 lg:grid-cols-4">
            {funFood.games.map((game, i) => (
              <Reveal
                as="li"
                key={game}
                delay={i * 40}
                className="flex min-h-28 flex-col justify-between gap-4 border-r border-b border-white/15 p-4 transition-colors hover:bg-white/6 sm:min-h-36 sm:gap-6 sm:p-6"
              >
                <span className="font-display text-sm font-bold text-gold-400">{pad(i + 1)}</span>
                <span className="font-display text-[1.05rem] leading-snug font-semibold text-white sm:text-xl">{game}</span>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ================= terms ================= */}
      <Section tone="paper" id="terms" className="scroll-mt-28">
        <Container className="grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:sticky lg:top-32 lg:col-span-4">
            <Eyebrow>Before you register</Eyebrow>
            <SectionTitle>Terms &amp; conditions</SectionTitle>
            <div className="mt-8 rounded-[24px] border-l-4 border-gold-500 bg-white p-6 shadow-lift">
              <p className="text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">Please note</p>
              <p className="mt-3 leading-relaxed text-ink/75">{funFood.note}</p>
              <p className="mt-4 font-display text-xl font-semibold text-castle-700">{funFood.inviteOnly}</p>
            </div>
          </Reveal>

          <ol className="border-t border-castle-200 lg:col-span-7 lg:col-start-6">
            {funFood.terms.map((term, i) => (
              <Reveal as="li" key={term} delay={i * 50} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-castle-200 py-6">
                <span className="font-display text-2xl leading-none font-semibold text-castle-300">{pad(i + 1)}</span>
                <p className="text-[16.5px] leading-relaxed text-ink/80">{term}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ================= register ================= */}
      <Section tone="white" id="register" className="scroll-mt-28">
        <Container className="grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:sticky lg:top-32 lg:col-span-4">
            <Eyebrow>Take part</Eyebrow>
            <SectionTitle>Register for free.</SectionTitle>
            <p className="mt-5 leading-relaxed text-ink/65">
              Tell us a little about you and your household. It takes about three minutes and helps us plan each game
              day in Ikeja.
            </p>
            <p className="mt-8 text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">What happens next</p>
            <ul className="mt-4 space-y-3.5">
              {nextSteps.map((s) => (
                <li key={s} className="flex gap-3 text-[15px] text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500">
                    <Check className="h-3 w-3 text-castle-900" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <TextLink href="#terms" className="mt-7">
              Review the terms &amp; conditions
            </TextLink>
          </Reveal>

          <Reveal delay={100} className="rounded-[30px] border border-castle-100 bg-paper p-6 sm:p-9 lg:col-span-8 lg:p-11">
            <FunFoodRegistrationForm />
          </Reveal>
        </Container>
      </Section>

      {/* ================= donate ================= */}
      <Section tone="deep" id="donate" className="scroll-mt-28 overflow-hidden">
        <Container className="grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow tone="light">Support the Factory</Eyebrow>
            <SectionTitle className="text-white">{funFood.donation.title}</SectionTitle>
            <p className="mt-5 text-lg leading-relaxed text-white/70">{funFood.donation.intro}</p>

            {/* a transfer slip — the details a donor actually needs, copyable */}
            <div className="mt-9 overflow-hidden rounded-[24px] bg-white text-ink shadow-lift-lg">
              <div className="flex items-center justify-between gap-4 bg-gold-500 px-6 py-3.5 text-castle-900">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Payment information</span>
                <span className="font-semibold">{funFood.donation.bank}</span>
              </div>
              <dl className="px-6 py-5">
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-ink/60 uppercase">Account name</dt>
                  <dd className="mt-1 text-lg font-semibold">{funFood.donation.accountName}</dd>
                </div>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-castle-200 pt-5">
                  <div>
                    <dt className="text-xs font-semibold tracking-wider text-ink/60 uppercase">Account number</dt>
                    <dd className="mt-1 font-mono text-[1.9rem] leading-none font-semibold tracking-[0.12em] text-castle-700">
                      {funFood.donation.accountNumber}
                    </dd>
                  </div>
                  <CopyButton value={funFood.donation.accountNumber} label="Copy number" />
                </div>
              </dl>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              After a transfer, send the form so we can acknowledge your gift. Giving food items instead? Pledge them
              with the form and our team will be in touch.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-[30px] bg-white p-6 text-ink shadow-lift-lg sm:p-9 lg:col-span-7">
            <h2 className="font-display text-2xl font-semibold">Tell us about your donation</h2>
            <p className="mt-1.5 text-[15px] text-ink/60">Fill out the form below, and we will be in touch shortly.</p>
            <div className="mt-7">
              <DonationForm />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ================= updates ================= */}
      <Section tone="paper" size="tight">
        <Container className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-md">
            <p className="font-display text-3xl leading-tight font-semibold">Hear when new game days are announced.</p>
            <p className="mt-2 text-ink/60">One short email when the Factory adds dates or locations. Nothing else.</p>
          </div>
          <NewsletterForm source="fun_food" />
        </Container>
      </Section>
    </>
  );
}
