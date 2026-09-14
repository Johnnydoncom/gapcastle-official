import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { LoanProduct } from "@/lib/site";
import { cn } from "@/lib/cn";

const accentBlock: Record<LoanProduct["accent"], string> = {
  castle: "bg-gold-500",
  gold: "bg-castle-200",
  deep: "bg-castle-600",
};

const statTone: Record<LoanProduct["accent"], string> = {
  castle: "bg-white text-ink border border-castle-100",
  gold: "bg-castle-900 text-white",
  deep: "bg-gold-500 text-castle-900",
};

/**
 * One loan product, laid out as an editorial spread.
 * Alternates sides so the page reads as a rhythm rather than a stack of cards.
 */
export function ProductRow({
  product,
  flip = false,
  showCta = true,
}: {
  product: LoanProduct;
  flip?: boolean;
  showCta?: boolean;
}) {
  return (
    <Reveal className="grid items-center gap-14 lg:grid-cols-12">
      {/* ---- image side ---- */}
      <figure
        className={cn(
          "relative lg:col-span-5",
          flip ? "lg:order-2 lg:col-start-8" : "lg:order-1",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute h-28 w-28 rounded-[26px] lg:h-32 lg:w-32",
            accentBlock[product.accent],
            flip
              ? "-right-5 -bottom-6 lg:-right-8 lg:-bottom-8"
              : "-top-6 -left-5 lg:-top-8 lg:-left-8",
          )}
        />
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={1920}
          height={1280}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="photo-tone relative h-80 w-full rounded-[30px] object-cover shadow-lift-lg lg:h-[440px]"
        />

        {product.stat && (
          <figcaption
            className={cn(
              "absolute -bottom-7 rounded-2xl px-5 py-4 shadow-lift",
              statTone[product.accent],
              flip ? "-left-3 lg:-left-8" : "-right-3 lg:-right-8",
            )}
          >
            <p className="font-display text-3xl leading-none font-bold">
              {product.stat.value}
              {product.stat.suffix && (
                <span
                  className={cn(
                    product.accent === "castle" && "text-gold-600",
                    product.accent === "gold" && "text-gold-400",
                    product.accent === "deep" && "text-castle-700",
                  )}
                >
                  {product.stat.suffix}
                </span>
              )}
            </p>
            <p
              className={cn(
                "mt-1.5 max-w-36 text-xs leading-snug font-medium",
                product.accent === "castle" ? "text-ink/60" : "opacity-70",
              )}
            >
              {product.stat.label}
            </p>
          </figcaption>
        )}
      </figure>

      {/* ---- copy side ---- */}
      <div
        className={cn(
          "lg:col-span-6",
          flip ? "lg:order-1 lg:col-start-1" : "lg:order-2 lg:col-start-7",
        )}
      >
        <p className="font-display text-lg font-bold text-gold-600">
          {product.index} — {product.kicker}
        </p>
        <h3 className="mt-2 font-display text-[clamp(1.75rem,1.2rem+2vw,2.6rem)] leading-tight font-semibold">
          {product.name}
        </h3>
        <p className="mt-5 max-w-xl leading-relaxed text-ink/65">{product.summary}</p>

        <ul className="mt-7 space-y-4">
          {product.highlights.map((h) => (
            <li key={h.label} className="flex gap-3.5">
              <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-castle-200">
                <Check className="h-3 w-3 text-castle-700" />
              </span>
              <span className="text-[15px]">
                <span className="font-semibold text-ink">{h.label}</span>
                <span className="text-ink/60"> — {h.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        {showCta && (
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink
              href={`/apply/${product.slug}`}
              variant={product.accent === "gold" ? "accent" : "primary"}
              withArrow
            >
              {product.ctaLabel}
            </ButtonLink>
            <TextLink href={`/loans/${product.slug}`}>Full product details</TextLink>
          </div>
        )}
      </div>
    </Reveal>
  );
}
