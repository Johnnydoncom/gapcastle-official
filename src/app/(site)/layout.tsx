import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/lib/site";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: site.legalName,
  alternateName: site.name,
  url: site.url,
  logo: `${site.url}/logo-lockup.png`,
  slogan: site.tagline,
  description: site.description,
  foundingDate: String(site.incorporated),
  email: site.email,
  telephone: site.phones[0],
  areaServed: "NG",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.street}, ${site.address.area}`,
    addressLocality: site.address.city,
    addressCountry: "NG",
  },
  openingHours: "Mo-Fr 09:00-16:00",
  sameAs: [site.social.facebook],
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-castle-600 px-6 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
