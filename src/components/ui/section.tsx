import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "paper" | "white" | "navy" | "deep" | "gold" | "none";

const tones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  white: "bg-white text-ink",
  navy: "bg-castle-600 text-white",
  deep: "bg-castle-900 text-white",
  gold: "bg-gold-500 text-castle-900",
  none: "",
};

export function Section({
  children,
  tone = "paper",
  className,
  id,
  size = "default",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  size?: "default" | "tight" | "loose";
}) {
  const pad =
    size === "tight"
      ? "py-14 lg:py-20"
      : size === "loose"
        ? "py-24 lg:py-36"
        : "py-20 lg:py-28";

  return (
    <section id={id} className={cn("relative", tones[tone], pad, className)}>
      {children}
    </section>
  );
}

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("container-editorial", className)}>{children}</div>;
}

/** Small tracked label. The gold dot is the recurring brand tick. */
export function Eyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "gold";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase",
        tone === "dark" && "text-castle-600",
        tone === "light" && "text-gold-400",
        tone === "gold" && "text-castle-900/70",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          tone === "gold" ? "bg-castle-900" : "bg-gold-500",
        )}
      />
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "mt-4 font-display text-[clamp(2rem,1.3rem+3vw,3.25rem)] leading-[1.08] font-semibold",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed text-ink/65", className)}>
      {children}
    </p>
  );
}

/** The "span" divider — a hairline bridging two gold anchor points. */
export function SpanRule({ className }: { className?: string }) {
  return <div aria-hidden className={cn("span-rule w-full", className)} />;
}
