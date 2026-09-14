import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";

export type FaqItem = { q: string; a: string };

/** Native <details> accordion — works without JavaScript — plus FAQPage structured data. */
export function Faq({
  items,
  eyebrow = "Questions",
  title = "Straight answers.",
  tone = "white",
}: {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  tone?: "white" | "paper";
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <Section tone={tone}>
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <SectionTitle>{title}</SectionTitle>
        </div>

        <div className="border-t border-castle-100 lg:col-span-8">
          {items.map((item) => (
            <details key={item.q} className="group border-b border-castle-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-xl font-semibold transition-colors hover:text-castle-600 lg:text-[1.35rem]">
                {item.q}
                <span
                  aria-hidden
                  className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-castle-200 transition-colors group-open:border-castle-600 group-open:bg-castle-600"
                >
                  <span className="absolute h-0.5 w-3.5 rounded bg-castle-600 group-open:bg-white" />
                  <span className="absolute h-3.5 w-0.5 rounded bg-castle-600 transition-transform duration-300 group-open:scale-y-0 group-open:bg-white" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 leading-relaxed text-ink/65">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Section>
  );
}
