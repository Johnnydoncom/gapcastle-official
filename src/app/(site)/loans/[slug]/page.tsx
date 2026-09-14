import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Process } from "@/components/home/process";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { ArrowRight, Quote } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { loanBySlug, loanProducts, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return loanProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/loans/[slug]">): Promise<Metadata> {
  const product = loanBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.promise} ${product.summary}`,
    alternates: { canonical: `/loans/${product.slug}` },
    openGraph: { images: [{ url: product.image.src, alt: product.image.alt }] },
  };
}

export default async function LoanDetailPage({ params }: PageProps<"/loans/[slug]">) {
  const product = loanBySlug((await params).slug);
  if (!product) notFound();

  const others = loanProducts.filter((p) => p.slug !== product.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LoanOrCredit",
    name: product.name,
    description: product.summary,
    url: `${site.url}/loans/${product.slug}`,
    currency: "NGN",
    areaServed: "NG",
    provider: { "@type": "FinancialService", name: site.legalName, url: site.url },
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Loan products", href: "/loans" }, { label: product.name }]}
        eyebrow={`${product.index} — ${product.kicker}`}
        title={product.name}
        lede={product.promise}
        image={product.image}
        accent={product.accent === "azure" ? "sky" : product.accent === "deep" ? "castle" : "azure"}
        actions={
          <>
            <ButtonLink href={`/apply/${product.slug}`} size="lg" withArrow>
              {product.ctaLabel}
            </ButtonLink>
            <TextLink href={`/contact?topic=${product.dbType}`}>Talk to a loan officer</TextLink>
          </>
        }
        aside={
          product.stat && (
            <div className="absolute -right-3 -bottom-7 rounded-2xl border border-castle-100 bg-white px-5 py-4 shadow-lift lg:-right-6">
              <p className="font-display text-3xl leading-none font-bold text-castle-600">
                {product.stat.value}
                {product.stat.suffix && <span className="text-azure-600">{product.stat.suffix}</span>}
              </p>
              <p className="mt-1.5 max-w-40 text-xs leading-snug font-medium text-ink/60">{product.stat.label}</p>
            </div>
          )
        }
      />

      {/* ---------- in plain terms ---------- */}
      <Section tone="white">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Quote className="h-9 w-9 text-azure-500" />
            <p className="mt-5 font-display text-[clamp(1.6rem,1.2rem+1.7vw,2.4rem)] leading-snug font-semibold">
              {product.summary}
            </p>
          </Reveal>
          <Reveal delay={100} className="space-y-6 lg:col-span-6 lg:col-start-7 lg:pt-14">
            <Eyebrow>In plain terms</Eyebrow>
            {product.body.map((para) => (
              <p key={para.slice(0, 24)} className="text-lg leading-relaxed text-ink/70">
                {para}
              </p>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* ---------- what you get: numbered editorial rows, not cards ---------- */}
      <Section tone="paper">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>What you get</Eyebrow>
            <SectionTitle>Designed around how it actually works.</SectionTitle>
          </Reveal>

          <ol className="mt-14 border-t border-castle-200">
            {product.highlights.map((h, i) => (
              <Reveal
                as="li"
                key={h.label}
                delay={i * 80}
                className="grid gap-3 border-b border-castle-200 py-8 sm:grid-cols-12 sm:gap-6 lg:py-10"
              >
                <span className="font-display text-4xl leading-none font-semibold text-castle-200 sm:col-span-2 lg:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl leading-tight font-semibold sm:col-span-4 lg:text-[1.75rem]">
                  {h.label}
                </h3>
                <p className="text-lg leading-relaxed text-ink/65 sm:col-span-6">{h.detail}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------- secondary image band ---------- */}
      {product.secondaryImage && (
        <section className="bg-paper pb-20 lg:pb-28">
          <Container>
            <Reveal as="figure">
              <div className="relative overflow-hidden rounded-[34px]">
                <Image
                  src={product.secondaryImage.src}
                  alt={product.secondaryImage.alt}
                  width={1920}
                  height={1280}
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  className="photo-tone h-72 w-full object-cover sm:h-[420px] lg:h-[520px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-castle-950/70 via-transparent to-transparent" />
                <figcaption className="absolute right-0 bottom-0 left-0 flex flex-wrap items-end justify-between gap-6 p-7 text-white lg:p-10">
                  <p className="max-w-lg font-display text-2xl leading-snug font-semibold lg:text-3xl">
                    {product.promise}
                  </p>
                  <ButtonLink href={`/apply/${product.slug}`} variant="accent" withArrow>
                    {product.ctaLabel}
                  </ButtonLink>
                </figcaption>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      <Process />

      {/* ---------- other products ---------- */}
      <Section tone="white">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Explore other loans</Eyebrow>
              <SectionTitle>Something else on your mind?</SectionTitle>
            </div>
            <TextLink href="/loans">Compare all products</TextLink>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {others.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={`/loans/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[24px]">
                    <Image
                      src={p.image.src}
                      alt=""
                      width={1920}
                      height={1280}
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="photo-tone h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-5 text-[11px] font-bold tracking-[0.2em] text-azure-600 uppercase">{p.kicker}</p>
                  <h3 className="mt-2 flex items-center justify-between gap-3 font-display text-2xl font-semibold transition-colors group-hover:text-castle-600">
                    {p.name}
                    <ArrowRight
                      className={cn(
                        "h-5 w-5 shrink-0 text-castle-600 transition-transform duration-300 group-hover:translate-x-1",
                      )}
                    />
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink/60">{p.promise}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Ready to apply for a ${product.name.toLowerCase()}?`}
        body="Three short steps and about five minutes. A loan officer calls you within one working day."
        primary={{ href: `/apply/${product.slug}`, label: "Start my application" }}
      />

      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
