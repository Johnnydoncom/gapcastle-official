import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { site, telHref } from "@/lib/site";

export function CtaBand({
  title = "Ready to bridge your financial gap?",
  body = "Get a free consultation today. Call the office or send a message — we answer quickly, and we tell you where you stand.",
  primary = { href: "/contact", label: "Get a free consultation" },
}: {
  title?: string;
  body?: string;
  primary?: { href: string; label: string };
}) {
  return (
    <Section tone="paper" size="tight">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[34px] bg-castle-900 px-8 py-14 text-white lg:px-16 lg:py-16">
          <svg
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-28 h-96 w-96 text-white/8"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
          </svg>

          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] leading-tight font-semibold">
                {title}
              </h2>
              <p className="mt-4 text-lg text-white/65">{body}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href={primary.href} variant="accent" size="lg" withArrow>
                {primary.label}
              </ButtonLink>
              <ButtonLink href={telHref(site.phones[0])} variant="onDark" size="lg">
                {site.phones[0]}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
