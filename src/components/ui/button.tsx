import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "onDark";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold " +
  "transition-[transform,background-color,box-shadow,color] duration-300 " +
  "hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-castle-600 text-white hover:bg-castle-700 shadow-lift hover:shadow-lift-lg",
  accent: "bg-gold-500 text-castle-900 hover:bg-gold-400 shadow-gold",
  outline:
    "border border-castle-200 bg-white text-castle-700 hover:border-castle-400 hover:bg-castle-50",
  ghost: "text-castle-700 hover:bg-castle-50",
  onDark: "border border-white/25 text-white hover:bg-white/10 hover:border-white/40",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[15px]",
  lg: "px-7 py-4 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const external = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  const classes = cn(base, variants[variant], sizes[size], "group", className);

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
        {withArrow && <Arrow />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], "group", className)} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </button>
  );
}

const Arrow = () => (
  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
);

/** Text link with the animated gold "span" underline. */
export function TextLink({
  href,
  children,
  className,
  withArrow = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  withArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "link-span group inline-flex items-center gap-2 font-semibold text-castle-600",
        className,
      )}
    >
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </Link>
  );
}
