"use client";

import Image from "next/image";
import { useState } from "react";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Container, Eyebrow, Lede, Section, SectionTitle } from "@/components/ui/section";
import { loanProducts } from "@/lib/site";
import { cn } from "@/lib/cn";

type Option = {
  id: string;
  chip: string;
  kicker: string;
  title: string;
  promise: string;
  points: string[];
  image: { src: string; alt: string };
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

const options: Option[] = [
  ...loanProducts.map((p) => ({
    id: p.need,
    chip: p.needLabel,
    kicker: p.kicker,
    title: p.name,
    promise: p.promise,
    points: p.highlights.map((h) => h.label),
    image: p.image,
    primary: { href: `/apply/${p.slug}`, label: p.ctaLabel },
    secondary: { href: `/loans/${p.slug}`, label: "Read the full details" },
  })),
  {
    id: "bills",
    chip: "I want to pay bills fast",
    kicker: "Everyday",
    title: "Bill Payments",
    promise: "Electricity, TV, airtime and data — settled in seconds, web or mobile.",
    points: [
      "Prepaid & postpaid electricity, all major discos",
      "Airtime and data on every network",
      "TV and utility subscriptions",
    ],
    image: {
      src: "/images/lagos-traffic.jpg",
      alt: "A busy Lagos street lined with market stalls and yellow danfo buses",
    },
    primary: { href: "/bill-payments", label: "Pay a bill" },
    secondary: { href: "/mobile-apps", label: "Get the mobile app" },
  },
];

export function NeedFinder() {
  const [activeId, setActiveId] = useState(options[0].id);
  const active = options.find((o) => o.id === activeId) ?? options[0];

  return (
    // Paper continues straight on from the hero; the hero's closing ticker is the divider.
    <Section tone="paper" id="need-finder" className="pt-14 lg:pt-20">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Start here</Eyebrow>
          <SectionTitle>Tell us what you need. We will point the way.</SectionTitle>
          <Lede>
            No jargon and no runaround. Choose the situation that sounds like yours and we
            will show you exactly which Gap Castle product is built for it.
          </Lede>
        </div>

        {/* one swipeable row on phones instead of five stacked lines; wraps from sm up */}
        <div
          className="-mx-5 mt-10 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Choose the support you need"
        >
          {options.map((option) => {
            const selected = option.id === activeId;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                id={`need-tab-${option.id}`}
                aria-selected={selected}
                aria-controls={`need-panel-${option.id}`}
                onClick={() => setActiveId(option.id)}
                className={cn(
                  "shrink-0 snap-start rounded-full border px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5",
                  selected
                    ? "border-castle-600 bg-castle-600 text-white shadow-lift"
                    : "border-castle-200 bg-white text-ink/70 hover:border-castle-400 hover:text-castle-700",
                )}
              >
                {option.chip}
              </button>
            );
          })}
        </div>

        {/* one large editorial panel — deliberately not a grid of cards */}
        <div
          role="tabpanel"
          id={`need-panel-${active.id}`}
          aria-labelledby={`need-tab-${active.id}`}
          key={active.id}
          className="mt-9 grid overflow-hidden rounded-[32px] border border-castle-100 bg-white lg:grid-cols-12"
        >
          <figure className="relative lg:col-span-5">
            <Image
              src={active.image.src}
              alt={active.image.alt}
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="photo-tone h-64 w-full object-cover sm:h-80 lg:h-full lg:min-h-[440px]"
            />
            <span className="absolute top-5 left-5 rounded-full bg-castle-950/75 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white uppercase backdrop-blur-sm">
              {active.kicker}
            </span>
          </figure>

          <div className="flex flex-col justify-center p-8 lg:col-span-7 lg:p-12">
            <h3 className="font-display text-3xl font-semibold lg:text-[2.4rem]">
              {active.title}
            </h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/65">{active.promise}</p>

            <ul className="mt-7 space-y-3">
              {active.points.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-castle-200">
                    <Check className="h-3 w-3 text-castle-700" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href={active.primary.href} withArrow>
                {active.primary.label}
              </ButtonLink>
              <TextLink href={active.secondary.href}>{active.secondary.label}</TextLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
