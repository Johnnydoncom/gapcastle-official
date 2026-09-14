import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/section";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * Shared hero for internal pages. Asymmetric split when an image is given,
 * a single editorial column when not. Uses the CSS-only `.rise` entrance so the
 * largest contentful paint never waits on JavaScript.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  breadcrumbs,
  actions,
  aside,
  accent = "azure",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  image?: { src: string; alt: string; position?: string };
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  /** Rendered inside the image frame — for a floating stat or badge. */
  aside?: ReactNode;
  accent?: "azure" | "sky" | "castle";
}) {
  return (
    <section className="relative overflow-hidden border-b border-castle-100 bg-paper">
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[620px] w-[620px] text-castle-200"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 5" />
      </svg>

      <div className="relative container-editorial pt-8 pb-16 lg:pt-12 lg:pb-24">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

        <div className={cn("mt-8 grid items-center gap-14 lg:mt-10 lg:gap-10", image && "lg:grid-cols-12")}>
          <div className={image ? "lg:col-span-6" : "max-w-3xl"}>
            <div className="rise">
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
            <h1
              className="rise mt-5 font-display text-[clamp(2.35rem,1.45rem+3.6vw,3.9rem)] leading-[1.05] font-semibold"
              style={delay(60)}
            >
              {title}
            </h1>
            {lede && (
              <div className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink/65" style={delay(120)}>
                {lede}
              </div>
            )}
            {actions && (
              <div className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={delay(180)}>
                {actions}
              </div>
            )}
          </div>

          {image && (
            <div className="rise lg:col-span-6" style={delay(140)}>
              <div className="relative">
                <div
                  aria-hidden
                  className={cn(
                    "absolute -bottom-5 -left-5 h-32 w-32 rounded-[26px] lg:-bottom-7 lg:-left-7 lg:h-40 lg:w-40",
                    accent === "azure" && "bg-azure-500",
                    accent === "sky" && "bg-castle-200",
                    accent === "castle" && "bg-castle-600",
                  )}
                />
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1920}
                  height={1280}
                  priority
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className={cn(
                    "photo-tone relative h-72 w-full rounded-[32px] object-cover shadow-lift-lg sm:h-[420px] lg:h-[480px]",
                    image.position,
                  )}
                />
                {aside}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const onDark = tone === "dark";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, site.url).toString() } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("rise text-sm", onDark ? "text-white/55" : "text-ink/60")}>
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className={onDark ? "text-white/30" : "text-castle-300"}>
                /
              </span>
            )}
            {c.href && i < trail.length - 1 ? (
              <Link
                href={c.href}
                className={cn("transition-colors", onDark ? "hover:text-azure-400" : "hover:text-castle-600")}
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-medium", onDark ? "text-white/85" : "text-ink/75")}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
