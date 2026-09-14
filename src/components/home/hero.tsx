import Image from "next/image";
import type { CSSProperties } from "react";
import { Marquee } from "@/components/home/marquee";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { RotatingWord } from "@/components/ui/rotating-word";
import { trustMarkers } from "@/lib/site";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* The "span" — a hairline arc bridging the two halves of the hero.
          Geometric, not a blurred gradient blob. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[760px] w-[1600px] -translate-x-1/2 text-castle-200"
        viewBox="0 0 1600 760"
        fill="none"
      >
        <path d="M-40 620 C 320 620, 420 120, 800 120 S 1280 620, 1640 620" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M-40 680 C 320 680, 420 180, 800 180 S 1280 680, 1640 680"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 9"
          opacity="0.8"
        />
        <circle cx="800" cy="120" r="5" className="fill-azure-500" />
      </svg>

      <div className="relative container-editorial pt-10 pb-8 lg:pt-20 lg:pb-12">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ---------- copy (painted immediately — no JS-gated reveal above the fold) ---------- */}
          <div className="lg:col-span-6">
            <p className="rise inline-flex items-center gap-2.5 rounded-full border border-castle-200 bg-white px-4 py-2 text-[11.5px] font-bold tracking-[0.16em] text-castle-600 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-azure-500" />
              Registered money lender
              <span className="hidden sm:inline">· Ikeja, Lagos</span>
            </p>

            <h1
              className="rise mt-7 font-display text-[clamp(2.5rem,1.4rem+4.6vw,4.3rem)] leading-[1.03] font-semibold tracking-tight"
              style={delay(60)}
            >
              Bridge the gap to{" "}
              <span className="text-castle-600">
                <RotatingWord words={["education", "travel", "business", "opportunity"]} />
              </span>
            </h1>

            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink/65" style={delay(120)}>
              School-fee loans, travel finance, business funding and effortless bill payments — built
              for Nigerian families, professionals and entrepreneurs, and disbursed in{" "}
              <strong className="font-semibold text-ink">under 24 hours</strong>.
            </p>

            <div className="rise mt-9 flex flex-wrap items-center gap-x-5 gap-y-4" style={delay(180)}>
              <ButtonLink href="/apply/school-fee-loan" size="lg" withArrow>
                Start your application
              </ButtonLink>
              <TextLink href="/loans">See all loan products</TextLink>
            </div>

            <ul className="rise mt-11 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink/60" style={delay(240)}>
              {trustMarkers.map((marker) => (
                <li key={marker} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-castle-600" />
                  {marker}
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- editorial image composition ---------- */}
          <div className="rise lg:col-span-6" style={delay(140)}>
            <div className="relative">
              {/* sky-blue anchor block behind the main frame */}
              <div
                aria-hidden
                className="absolute -top-5 -right-4 h-36 w-36 rounded-[28px] bg-azure-500 lg:-right-6 lg:h-44 lg:w-44"
              />

              <figure className="relative overflow-hidden rounded-[32px] shadow-lift-lg">
                <Image
                  src="/images/Homepage-school-business-student-load-support.webp"
                  alt="A proud Nigerian mother in a tailored navy suit standing with her smiling daughter in a crisp secondary school uniform on a sunlit Lagos terrace"
                  width={1920}
                  height={1280}
                  priority
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="photo-tone h-[380px] w-full object-cover object-center sm:h-[500px] lg:h-[560px]"
                />
                {/* <figcaption className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-castle-950/90 via-castle-950/45 to-transparent p-7 pt-20 text-white sm:block">
                  <div className="max-w-[15rem] lg:max-w-[17rem]">
                    <p className="font-display text-xl font-semibold">Every child belongs in class.</p>
                    <p className="mt-1 text-sm text-white/75">
                      School fees paid directly to our partner schools.
                    </p>
                  </div>
                </figcaption> */}
              </figure>

              {/* offset secondary frame — sits on the left edge, clear of the caption */}
              <figure className="absolute top-1/2 -left-5 hidden w-40 -translate-y-1/2 overflow-hidden rounded-[22px] border-[6px] border-paper shadow-lift sm:block lg:-left-12 lg:w-48">
                <Image
                  src="/images/market-trader.jpg"
                  alt="A Nigerian market trader smiling behind a stall of fresh produce"
                  width={1920}
                  height={1280}
                  sizes="13vw"
                  className="photo-tone h-28 w-full object-cover lg:h-32"
                />
              </figure>
            </div>
          </div>
        </div>

        {/* the hero's closing line — aligned to the same grid as the copy above */}
        <div className="rise mt-20 lg:mt-24" style={delay(320)}>
          <Marquee className="border-castle-200 text-castle-700" />
        </div>
      </div>
    </section>
  );
}
