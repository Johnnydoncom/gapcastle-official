import { Apple, PlayStore } from "@/components/ui/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const stores = [
  { Icon: Apple, kicker: "Download on the", name: "App Store" },
  { Icon: PlayStore, kicker: "Get it on", name: "Google Play" },
];

/**
 * The public store listings are not yet published, so both buttons route to the
 * Gap Castle payment portal where the apps are distributed.
 */
export function AppStoreButtons({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {stores.map(({ Icon, kicker, name }) => (
        <a
          key={name}
          href={site.payPortal}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "inline-flex items-center gap-3 rounded-2xl px-5 py-3 transition-transform duration-300 hover:-translate-y-0.5",
            tone === "light"
              ? "bg-white text-castle-900 shadow-lift"
              : "border border-castle-200 bg-castle-50 text-castle-900",
          )}
        >
          <Icon className="h-6 w-6" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] tracking-wider text-ink/60 uppercase">
              {kicker}
            </span>
            <span className="font-semibold">{name}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
