import { ArrowRight, Check } from "@/components/ui/icons";

const quickPay = [
  { label: "Electricity", detail: "Prepaid & postpaid" },
  { label: "Airtime", detail: "All networks" },
  { label: "Data", detail: "Instant delivery" },
  { label: "TV", detail: "Subscriptions" },
];

const activity = [
  { label: "Ikeja Electric", meta: "Prepaid token", amount: "₦15,000" },
  { label: "MTN Airtime", meta: "080… 9668", amount: "₦2,000" },
  { label: "Data bundle", meta: "10GB · 30 days", amount: "₦5,000" },
];

/**
 * A rendered product surface rather than a stock photo — it shows what the
 * Gap Castle app actually does, in the brand's own colours.
 */
export function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* device */}
      <div className="relative rounded-[42px] border border-white/15 bg-castle-950 p-3 shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.75)]">
        <div className="relative overflow-hidden rounded-[32px] bg-paper">
          {/* status strip */}
          <div className="flex items-center justify-between bg-castle-600 px-5 pt-4 pb-3 text-[10px] font-semibold text-white/70">
            <span>9:41</span>
            <span className="h-1.5 w-16 rounded-full bg-white/25" />
            <span>100%</span>
          </div>

          {/* balance */}
          <div className="bg-castle-600 px-5 pb-7 text-white">
            <p className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
              Wallet balance
            </p>
            <p className="mt-1.5 font-display text-3xl font-bold">₦124,500</p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-gold-500 px-3.5 py-1.5 text-[11px] font-bold text-castle-900">
                Fund wallet
              </span>
              <span className="rounded-full border border-white/25 px-3.5 py-1.5 text-[11px] font-semibold">
                Transfer
              </span>
            </div>
          </div>

          {/* quick pay */}
          <div className="-mt-4 rounded-t-[24px] bg-white px-5 pt-5 pb-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-castle-600 uppercase">
              Quick pay
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickPay.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-castle-100 bg-castle-50 px-3 py-2.5"
                >
                  <p className="text-[12px] font-semibold text-ink">{item.label}</p>
                  <p className="mt-0.5 text-[10px] text-ink/60">{item.detail}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-[11px] font-bold tracking-[0.16em] text-castle-600 uppercase">
              Recent
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {activity.map((row) => (
                <li key={row.label} className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-castle-100">
                    <Check className="h-3 w-3 text-castle-600" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">
                      {row.label}
                    </span>
                    <span className="block truncate text-[10px] text-ink/60">{row.meta}</span>
                  </span>
                  <span className="text-[12px] font-semibold text-ink">{row.amount}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-castle-900 px-4 py-3 text-white">
              <span className="text-[12px] font-semibold">Apply for a loan</span>
              <ArrowRight className="h-3.5 w-3.5 text-gold-400" />
            </div>
          </div>
        </div>
      </div>

      {/* floating confirmation chip */}
      <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-lift sm:-left-10">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-500">
          <Check className="h-3 w-3 text-castle-900" />
        </span>
        <span className="text-[11px] font-semibold text-ink">Token delivered</span>
      </div>
    </div>
  );
}
