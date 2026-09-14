import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/forms/contact-form";
import { Faq } from "@/components/shared/faq";
import { Breadcrumbs } from "@/components/shared/page-hero";
import { ArrowRight, Clock, Mail, Phone, Pin, WhatsApp } from "@/components/ui/icons";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { site, telHref } from "@/lib/site";
import { CONTACT_TOPICS } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Call, email, WhatsApp or visit Gap Castle in Ikeja, Lagos — or send an enquiry and our team will respond within one working day.",
  alternates: { canonical: "/contact" },
};

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;

const faqs = [
  {
    q: "How quickly will you get back to me?",
    a: "We respond to every enquiry within one working day, and usually much sooner during office hours. For anything urgent, call or WhatsApp us.",
  },
  {
    q: "What can I contact you about?",
    a: "Anything — school fee, travel, personal and business loans, larger facilities through our partner lenders, business review and advisory, bill payments, or taking part in the Fun Food Factory.",
  },
  {
    q: "Do you work with schools directly?",
    a: "Yes. We partner with private primary and secondary schools across Nigeria so fees are settled directly and children stay in class.",
  },
  {
    q: "Where are you, and when are you open?",
    a: `${site.address.full}. We are open Monday to Friday, 9:00am to 4:00pm, and closed at weekends.`,
  },
];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  const defaultTopic =
    typeof topic === "string" && (CONTACT_TOPICS as readonly string[]).includes(topic) ? topic : undefined;

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-castle-600 text-white">
        <Image
          src="/images/lagos-bridge.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-castle-900 via-castle-700/90 to-castle-600/70" />

        <div className="relative container-editorial pt-8 pb-16 lg:pt-12 lg:pb-24">
          <Breadcrumbs items={[{ label: "Contact" }]} tone="dark" />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="rise font-display text-[clamp(2.5rem,1.5rem+4vw,4.2rem)] leading-[1.03] font-semibold">
                Let&rsquo;s talk about your <span className="text-azure-400">gap.</span>
              </h1>
              <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/75" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
                For every service enquiry, send the form or reach us on any of our lines. We come back to you
                quickly — and we make sure you know exactly where you stand.
              </p>
            </div>
            <div className="rise lg:col-span-5 lg:justify-self-end" style={{ "--rise-delay": "140ms" } as React.CSSProperties}>
              <a
                href={telHref(site.phones[0])}
                className="group inline-flex items-center gap-4 rounded-2xl bg-white px-6 py-4 text-castle-700 shadow-lift-lg transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-azure-500 transition-transform duration-300 group-hover:scale-110">
                  <Phone className="h-5 w-5 text-castle-900" />
                </span>
                <span>
                  <span className="block text-xs font-semibold tracking-wider text-ink/60 uppercase">
                    Call us today
                  </span>
                  <span className="block font-display text-xl font-bold">{site.phones[0]}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- form + direct channels ---------- */}
      <section id="enquiry" className="bg-paper py-16 lg:py-24">
        <Container className="grid items-start gap-10 lg:grid-cols-12">
          <Reveal className="rounded-[30px] border border-castle-100 bg-white p-6 shadow-lift sm:p-9 lg:col-span-7 lg:p-11">
            <h2 className="font-display text-3xl font-semibold">Send us a message</h2>
            <p className="mt-2 text-[15px] text-ink/60">
              We respond within one working day — usually much faster.
            </p>
            <div className="mt-8">
              <ContactForm defaultTopic={defaultTopic} />
            </div>
          </Reveal>

          {/* one composed panel rather than a stack of look-alike cards */}
          <Reveal delay={120} as="aside" className="overflow-hidden rounded-[30px] bg-castle-900 text-white lg:sticky lg:top-32 lg:col-span-5">
            <div className="p-7 sm:p-9">
              <p className="text-[11px] font-bold tracking-[0.2em] text-azure-400 uppercase">Reach us directly</p>

              <dl className="mt-6 divide-y divide-white/10">
                <div className="flex gap-4 py-5 first:pt-0">
                  <dt className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8">
                    <Phone className="h-4.5 w-4.5 text-azure-400" />
                    <span className="sr-only">Phone</span>
                  </dt>
                  <dd className="space-y-1.5">
                    {site.phones.map((p) => (
                      <a key={p} href={telHref(p)} className="block text-[15.5px] font-medium transition-colors hover:text-azure-400">
                        {p}
                      </a>
                    ))}
                  </dd>
                </div>

                <div className="flex gap-4 py-5">
                  <dt className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8">
                    <Mail className="h-4.5 w-4.5 text-azure-400" />
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd>
                    <a href={`mailto:${site.email}`} className="text-[15.5px] font-medium transition-colors hover:text-azure-400">
                      {site.email}
                    </a>
                    <p className="mt-1 text-sm text-white/50">Enquiries, partnerships and support.</p>
                  </dd>
                </div>

                <div className="flex gap-4 py-5">
                  <dt className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8">
                    <Pin className="h-4.5 w-4.5 text-azure-400" />
                    <span className="sr-only">Office address</span>
                  </dt>
                  <dd>
                    <p className="text-[15.5px] leading-relaxed">{site.address.full}</p>
                    <a href="#map" className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-400">
                      See it on the map <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </dd>
                </div>

                <div className="flex gap-4 py-5 last:pb-0">
                  <dt className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8">
                    <Clock className="h-4.5 w-4.5 text-azure-400" />
                    <span className="sr-only">Working hours</span>
                  </dt>
                  <dd className="w-full space-y-1.5 text-[15px]">
                    <p className="flex justify-between gap-6">
                      <span className="text-white/65">Monday – Friday</span>
                      <span className="font-semibold">9:00am – 4:00pm</span>
                    </p>
                    <p className="flex justify-between gap-6">
                      <span className="text-white/65">Saturday – Sunday</span>
                      <span className="font-semibold text-white/55">Closed</span>
                    </p>
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href={site.social.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center justify-between gap-4 bg-azure-500 px-7 py-6 text-castle-900 transition-colors hover:bg-azure-400 sm:px-9"
            >
              <span className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-castle-900">
                  <WhatsApp className="h-5 w-5 text-azure-400" />
                </span>
                <span>
                  <span className="block font-display text-xl font-semibold">Chat on WhatsApp</span>
                  <span className="block text-sm text-castle-900/70">Fastest replies during working hours</span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </Container>
      </section>

      {/* ---------- map ---------- */}
      <section id="map" className="scroll-mt-28 bg-paper pb-16 lg:pb-24">
        <Container>
          <Reveal className="relative overflow-hidden rounded-[30px] border border-castle-100 shadow-lift">
            <iframe
              title="Map showing the Gap Castle office off Adeniyi Jones, Ikeja, Lagos"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.336%2C6.590%2C3.372%2C6.620&layer=mapnik&marker=6.6047%2C3.3540"
              loading="lazy"
              className="h-[420px] w-full grayscale-[35%] contrast-[1.05]"
            />
            <div className="absolute top-4 left-4 max-w-[18rem] rounded-2xl border border-castle-100 bg-white px-5 py-4 shadow-lift sm:top-6 sm:left-6">
              <p className="flex items-center gap-2 font-display text-lg font-semibold text-castle-700">
                <Pin className="h-4 w-4 text-azure-600" />
                Gap Castle office
              </p>
              <p className="mt-1 text-sm leading-snug text-ink/60">{site.address.full}</p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-span mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-castle-600"
              >
                Get directions <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      <Faq items={faqs} eyebrow="Before you ask" title="Frequently asked questions." />
    </>
  );
}
