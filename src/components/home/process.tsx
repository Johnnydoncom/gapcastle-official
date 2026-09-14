import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { processSteps } from "@/lib/site";

export function Process() {
  return (
    <Section tone="paper">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>Three steps, and the money moves.</SectionTitle>
        </div>

        <div className="relative mt-16">
          {/* the bridge — a dashed span joining the three nodes */}
          <svg
            aria-hidden
            className="pointer-events-none absolute top-0 right-[16.5%] left-[16.5%] hidden h-14 text-castle-300 lg:block"
            viewBox="0 0 800 56"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* arcs bow upward between node centres so they never cross the copy below */}
            <path
              d="M0 28 Q 200 -10, 400 28 Q 600 -10, 800 28"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 10"
              strokeLinecap="round"
            />
          </svg>

          <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
            {processSteps.map((step, i) => (
              <Reveal key={step.step} as="li" delay={i * 110} className="text-center lg:px-6">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-4 border-paper bg-castle-600 font-display text-xl font-bold text-white shadow-lift">
                  {step.step}
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink/60">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
