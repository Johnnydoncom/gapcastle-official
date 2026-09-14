import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { funFood } from "@/lib/fun-food";

export function FunFoodTeaser() {
  return (
    <Section tone="azure" className="overflow-hidden">
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 text-castle-900/15"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* event photo with the real campaign flyer pinned over it */}
          <Reveal className="lg:col-span-5">
            <div className="relative pb-10 sm:pb-0">
              <figure className="overflow-hidden rounded-[30px] border-8 border-white shadow-lift-lg lg:-rotate-2">
                <Image
                  src="/images/community-cooking.jpg"
                  alt="Community members cooking together over open fires at a neighbourhood gathering in Nigeria"
                  width={1920}
                  height={1280}
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="photo-tone h-80 w-full object-cover lg:h-[420px]"
                />
              </figure>
              <figure className="absolute -right-3 -bottom-4 w-32 rotate-[5deg] sm:-bottom-10 sm:w-40 lg:-right-8 lg:w-44">
                <Image
                  src="/images/fun-food-flyer.jpg"
                  alt="Fun Food Factory flyer listing food items to be won"
                  width={1414}
                  height={2000}
                  sizes="176px"
                  className="h-auto w-full rounded-md border-[5px] border-white shadow-lift-lg"
                />
              </figure>
            </div>
          </Reveal>

          <Reveal delay={110} className="lg:col-span-6 lg:col-start-7">
            <Eyebrow tone="azure">Corporate social responsibility</Eyebrow>
            <SectionTitle className="text-castle-900">{funFood.title}</SectionTitle>
            <p className="mt-3 font-display text-xl font-semibold text-castle-900/70">{funFood.strap}</p>
            <p className="mt-5 max-w-xl leading-relaxed text-castle-900/75">{funFood.intro}</p>

            <ol className="mt-8 space-y-5">
              {funFood.steps.map((step) => (
                <li key={step.step} className="flex items-start gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-castle-900 font-display font-bold text-azure-400">
                    {step.step}
                  </span>
                  <p className="text-castle-900/85">
                    <strong className="font-semibold">{step.title}.</strong> {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink
                href="/fun-food-factory#register"
                size="lg"
                withArrow
                className="bg-castle-900 text-white hover:bg-castle-800"
              >
                Register for free
              </ButtonLink>
              <TextLink href="/fun-food-factory" className="text-castle-900">
                Terms, games &amp; prizes
              </TextLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
