import Image from "next/image";
import { Quote } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

export function ImpactQuote() {
  return (
    <section className="relative overflow-hidden bg-castle-600 py-24 text-white lg:py-32">
      <Image
        src="/images/lagos-cbd.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-castle-700/60 via-castle-600/70 to-castle-800/80" />

      <Reveal className="relative container-editorial max-w-4xl text-center">
        <Quote className="mx-auto h-10 w-10 text-azure-400" />
        <blockquote className="mt-7 font-display text-[clamp(1.5rem,1.1rem+2.2vw,2.25rem)] leading-snug font-medium tracking-tight">
          “Bridging financial gaps — especially in education, travel and small businesses —
          so our children stay in school, our people travel, and our businesses grow.”
        </blockquote>
        <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-azure-400 uppercase">
          The Gap Castle promise
        </p>
      </Reveal>
    </section>
  );
}
