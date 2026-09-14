import type { Metadata } from "next";
import { BillsBand } from "@/components/home/bills-band";
import { FunFoodTeaser } from "@/components/home/fun-food-teaser";
import { Hero } from "@/components/home/hero";
import { ImpactQuote } from "@/components/home/impact-quote";
import { LoanProducts } from "@/components/home/loan-products";
import { NeedFinder } from "@/components/home/need-finder";
import { Process } from "@/components/home/process";
import { CtaBand } from "@/components/shared/cta-band";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <NeedFinder />
      <LoanProducts />
      <Process />
      <BillsBand />
      <FunFoodTeaser />
      <ImpactQuote />
      <CtaBand />
    </>
  );
}
