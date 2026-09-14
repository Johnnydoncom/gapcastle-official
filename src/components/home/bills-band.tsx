import { AppStoreButtons } from "@/components/shared/app-store-buttons";
import { PhoneMock } from "@/components/shared/phone-mock";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const tiles = [
  { title: "Electricity", body: "Prepaid and postpaid tokens from every major disco." },
  { title: "Airtime & Data", body: "All networks, delivered the moment you confirm." },
  { title: "TV & Utilities", body: "Subscriptions and household bills in one place." },
];

export function BillsBand() {
  return (
    <Section tone="deep" id="bills" className="overflow-hidden">
      {/* geometric span, echoing the hero arc */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[560px] w-[560px] text-white/8"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="1" />
      </svg>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-6">
            <Eyebrow tone="light">Bill payments & mobile app</Eyebrow>
            <SectionTitle className="text-white">Everyday payments, zero wahala.</SectionTitle>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
              Settle utility bills, buy airtime and data, and manage your Gap Castle account
              from the web platform or our mobile app — the same account that carries your
              loan.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {tiles.map((tile) => (
                <div
                  key={tile.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  <p className="font-semibold">{tile.title}</p>
                  <p className="mt-1.5 text-sm leading-snug text-white/55">{tile.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/bill-payments" variant="accent" withArrow>
                Pay a bill
              </ButtonLink>
              <ButtonLink href="/mobile-apps" variant="onDark">
                About the apps
              </ButtonLink>
            </div>

            <div className="mt-8">
              <AppStoreButtons />
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-5 lg:col-start-8">
            <PhoneMock />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
