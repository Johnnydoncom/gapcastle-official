import { cn } from "@/lib/cn";

const defaultItems = [
  "School fee loans",
  "Travel & proof of funds",
  "Personal loans",
  "Business & SME support",
  "Business review & advisory",
  "Large business financing",
  "Bill payments",
  "Airtime & data",
];

/**
 * An editorial running line rather than a banner: it inherits the colour of the
 * section it sits in, is framed by hairlines, and fades out at both edges so it
 * reads as the closing line of that section instead of a separate band.
 */
export function Marquee({
  items = defaultItems,
  label = "What we fund",
  className,
  starClassName = "text-gold-500",
}: {
  items?: string[];
  label?: string | null;
  className?: string;
  starClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-8 border-y py-5", className)}>
      {label && (
        <p className="hidden shrink-0 items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          {label}
        </p>
      )}

      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track [animation-duration:55s]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
              {items.map((item) => (
                <li key={item} className="flex items-center whitespace-nowrap">
                  <span className="px-7 font-display text-lg italic lg:text-[1.35rem]">{item}</span>
                  <span aria-hidden className={cn("text-xs", starClassName)}>
                    ✦
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
