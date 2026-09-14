import type { Metadata } from "next";
import Image from "next/image";
import credits from "../../../../public/images/credits.json";
import { PageHero } from "@/components/shared/page-hero";
import { Container, Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Attribution for the photography used on the Gap Castle website.",
  alternates: { canonical: "/image-credits" },
  robots: { index: false, follow: true },
};

export default function ImageCreditsPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Image credits" }]}
        eyebrow="Attribution"
        title="Image credits"
        lede="Photography on this site is used under open licences from Wikimedia Commons. Thank you to the photographers below."
      />
      <Section tone="white">
        <Container>
          <ul className="border-t border-castle-100">
            {credits.map((c) => (
              <li key={c.file} className="grid items-center gap-5 border-b border-castle-100 py-5 sm:grid-cols-12">
                <Image
                  src={`/images/${c.file}`}
                  alt=""
                  width={1920}
                  height={1280}
                  sizes="160px"
                  className="h-20 w-32 rounded-xl object-cover sm:col-span-2"
                />
                <div className="sm:col-span-7">
                  <p className="font-semibold break-words">{c.title}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {c.artist && c.artist !== "?" ? c.artist.trim() : "Unknown author"} · {c.license}
                  </p>
                </div>
                <a
                  href={c.source}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-span text-sm font-semibold text-castle-600 sm:col-span-3 sm:justify-self-end"
                >
                  View source &amp; licence
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
