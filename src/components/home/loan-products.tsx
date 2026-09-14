import { ProductRow } from "@/components/shared/product-row";
import { TextLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { loanProducts } from "@/lib/site";

export function LoanProducts() {
  return (
    <Section tone="white" id="loans" className="overflow-hidden">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>Loan products</Eyebrow>
            <SectionTitle>Real money, for real Nigerian life.</SectionTitle>
          </div>
          <TextLink href="/contact">Talk to a loan officer</TextLink>
        </Reveal>

        <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
          {loanProducts.map((product, i) => (
            <ProductRow key={product.slug} product={product} flip={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
