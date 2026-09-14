"use client";

import { useState } from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard blocked (insecure context or permissions) — the number stays visible to copy by hand
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        copied
          ? "border-castle-600 bg-castle-600 text-white"
          : "border-castle-200 bg-white text-castle-700 hover:border-castle-400 hover:bg-castle-50",
        className,
      )}
    >
      {copied && <Check className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
