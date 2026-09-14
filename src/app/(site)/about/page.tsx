import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Clock, Pin } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { missionVision, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Gap Castle was incorporated in 2020 and registered as a lender to bridge financial gaps in education, travel and small business for Nigerians. Our story, mission, vision and values.",
  alternates: { canonical: "/about" },
};

/* Only verifiable facts — no invented customer counts. */
const facts = [
  { value: "2020", label: "Incorporated in Nigeria as a limited liability company" },
  { value: "<24", suffix: "hrs", label: "From approval to money in motion" },
  { value: "₦3m", suffix: "+", label: "Business facilities arranged through partner lenders" },
  { value: "7", label: "Services, from school fees to everyday bills" },
];

const chapters = [
  {
    year: "Where we began",
    title: "School fees, paid on time.",
    body: "We started where the gap hurts most. By partnering directly with private primary and secondary schools, we pay the school in full and let parents repay at a pace their income allows.",
  },
  {
    year: "Where it led",
    title: "Travel, business and personal finance.",
    body: "The work followed our customers — into study and work abroad, into shops and workshops that needed stock before they could sell, and into the months that simply ran short.",
  },
  {
    year: "Beyond lending",
    title: "Advice, bills and community.",
    body: "Owners asked us to help them read their own numbers, so we built business review and advisory. Then came everyday bill payments, and the Fun Food Factory for the communities we serve.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "About" }]}
        eyebrow="About Gap Castle"
        title={
          <>
            We live in the space between <span className="text-castle-600">where you are and where you are going.</span>
          </>
        }
        lede={`Gap Castle was incorporated in ${site.incorporated} and registered as a lender to support individuals and small businesses with the financial bridge they need — especially in education, travel and enterprise.`}
        image={{
          src: "/images/graduation.jpg",
          alt: "Graduating Nigerian university students in red gowns celebrating together",
        }}
        actions={
          <>
            <ButtonLink href="/services" withArrow>
              What we do
            </ButtonLink>
            <TextLink href="#visit">Visit our office</TextLink>
          </>
        }
      />

      {/* ---------- facts ---------- */}
      <section className="border-b border-castle-100 bg-white">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {facts.map((f, i) => (
              <Reveal
                key={f.label}
                delay={i * 80}
                className="border-castle-100 py-10 pr-4 odd:border-r lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 [&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 max-lg:even:pl-6"
              >
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="block font-display text-[clamp(2.4rem,1.8rem+2.2vw,3.5rem)] leading-none font-semibold text-castle-600">
                    {f.value}
                    {f.suffix && <span className="text-gold-600">{f.suffix}</span>}
                  </span>
                  <span className="mt-3 block max-w-[14rem] text-sm leading-snug text-ink/60">{f.label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* ---------- story: chapters beside a photo stack ---------- */}
      <Section tone="paper" className="overflow-hidden">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow>Our story</Eyebrow>
              <SectionTitle>A gap in timing, not a lack of ambition.</SectionTitle>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
                Most of the families and business owners we meet are not short of plans. They are short of
                time — the fee is due before the salary lands, the stock is needed before the sale.
              </p>
            </Reveal>

            <ol className="relative mt-14 space-y-12 border-l-2 border-dashed border-castle-200 pl-8">
              {chapters.map((c, i) => (
                <Reveal as="li" key={c.title} delay={i * 100} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1 -left-[41px] h-4 w-4 rounded-full border-4 border-paper bg-gold-500"
                  />
                  <p className="text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">{c.year}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">{c.title}</h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-ink/65">{c.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal delay={120} className="relative lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-32">
              <Image
                src="/images/classroom-computers.jpg"
                alt="Pupils working at computers in a Nigerian school computer room"
                width={1920}
                height={1280}
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="photo-tone h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[440px]"
              />
              <Image
                src="/images/lagos-bridge.jpg"
                alt="Traffic crossing the Third Mainland Bridge in Lagos"
                width={1920}
                height={1280}
                sizes="(min-width: 1024px) 22vw, 60vw"
                className="photo-tone relative -mt-20 ml-auto h-48 w-3/5 rounded-[24px] border-8 border-paper object-cover shadow-lift lg:h-56"
              />
              <p className="mt-5 max-w-sm text-sm text-ink/60">
                A bridge is the right picture for what we do: nobody wants to stay on it — they want to get
                across.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- vision & mission ---------- */}
      <Section tone="navy" className="overflow-hidden">
        <svg
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 text-white/6"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 4" />
        </svg>
        <Container className="relative grid gap-14 lg:grid-cols-2 lg:gap-0">
          <Reveal className="lg:border-r lg:border-white/15 lg:pr-14">
            <Eyebrow tone="light">Our vision</Eyebrow>
            <p className="mt-6 font-display text-[clamp(1.5rem,1.15rem+1.5vw,2.2rem)] leading-snug font-medium">
              {missionVision.vision}
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:pl-14">
            <Eyebrow tone="light">Our mission</Eyebrow>
            <p className="mt-6 font-display text-[clamp(1.5rem,1.15rem+1.5vw,2.2rem)] leading-snug font-medium">
              {missionVision.mission}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- values ---------- */}
      <Section tone="white">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow>How we work</Eyebrow>
            <SectionTitle>Four promises we hold ourselves to.</SectionTitle>
          </Reveal>
          <ol className="border-t border-castle-200 lg:col-span-8">
            {missionVision.values.map((value, i) => (
              <Reveal
                as="li"
                key={value.title}
                delay={i * 80}
                className="grid gap-2 border-b border-castle-200 py-7 sm:grid-cols-12 sm:gap-6"
              >
                <span className="font-display text-sm font-bold text-gold-600 sm:col-span-1 sm:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl font-semibold sm:col-span-5">{value.title}</h3>
                <p className="leading-relaxed text-ink/65 sm:col-span-6">{value.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------- social impact ---------- */}
      <Section tone="gold" className="overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow tone="gold">Social impact</Eyebrow>
            <SectionTitle className="text-castle-900">Finance is personal. So is community.</SectionTitle>
            <p className="mt-5 max-w-xl leading-relaxed text-castle-900/75">
              The Fun Food Factory is our Corporate Social Responsibility programme: free game days in
              Ikeja where members of the public play simple games and win food items — our way of
              helping to bridge the food shortage gap in some homes. No loan attached, no small print.
            </p>
            <ButtonLink href="/fun-food-factory" withArrow className="mt-9 bg-castle-900 text-white hover:bg-castle-800">
              Discover the Fun Food Factory
            </ButtonLink>
          </Reveal>
          <Reveal delay={120} as="figure" className="lg:col-span-5 lg:col-start-8">
            <Image
              src="/images/community-market.jpg"
              alt="Women from a community in Ugep, Cross River State, preparing food together outdoors"
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="photo-tone h-80 w-full rounded-[30px] border-8 border-white object-cover shadow-lift-lg lg:h-[420px] lg:rotate-2"
            />
          </Reveal>
        </Container>
      </Section>

      {/* ---------- visit ---------- */}
      <Section tone="paper" id="visit" size="tight" className="scroll-mt-28">
        <Container className="grid gap-8 rounded-[30px] border border-castle-100 bg-white p-8 lg:grid-cols-12 lg:items-center lg:p-12">
          <div className="lg:col-span-5">
            <Eyebrow>Visit us</Eyebrow>
            <p className="mt-4 font-display text-3xl font-semibold">A real office, with real people.</p>
          </div>
          <div className="flex gap-4 lg:col-span-4">
            <Pin className="mt-1 h-5 w-5 shrink-0 text-gold-600" />
            <p className="leading-relaxed text-ink/70">{site.address.full}</p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-3">
            <p className="flex gap-3 text-ink/70">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              Mon–Fri, 9am–4pm
            </p>
            <TextLink href="/contact#map">Get directions</TextLink>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
