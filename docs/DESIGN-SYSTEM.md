# Gap Castle — Design System & Art Direction

This document is the reference for anyone extending the site. It explains *why* the
interface looks the way it does, so new pages feel designed for Gap Castle rather
than assembled from a theme.

---

## 1. Concept — "The Span"

The Gap Castle logo shows a figure leaping across a gap inside the "G", and the
brand line is *your bridge to financial gap*. The visual system is built on that
single idea: **a span between two anchor points**.

It appears as:

| Motif | Where | Implementation |
| --- | --- | --- |
| Hairline arc with a sky-blue node | Home hero, process steps | Inline SVG `path` in `hero.tsx`, `process.tsx` |
| Span rule — hairline with sky-blue end-dots | Section dividers | `.span-rule` utility, `<SpanRule />` |
| Offset colour block behind a photo | Every editorial image | Absolutely positioned `div` in `ProductRow`, `PageHero` |
| Dashed "bridge" joining numbered steps | How it works, Fun Food journey | SVG / dashed border |
| A bridge with its middle missing | 404 page | `not-found.tsx` |

If a new section needs decoration, use one of these — never a blurred gradient
blob, glassmorphism panel or decorative icon grid.

---

## 2. Colour

Both brand blues are sampled **exactly** from the official logo artwork. The single
accent is **azure** — a brighter, clearer cousin of the logo sky, strong enough to carry
calls to action on navy. The palette is all-blue: no yellow or warm accent.

| Token | Hex | Role |
| --- | --- | --- |
| `castle-600` | `#242E9B` | **Logo blue.** Primary buttons, links, headings accents |
| `castle-200` | `#D4E2F9` | **Logo sky.** Tints, check-mark discs, offset blocks |
| `castle-900` | `#0E1238` | Deep navy surfaces: utility bar, footer, dark bands |
| `castle-50 / 100` | `#F5F7FE / #EDF3FD` | Quiet panels, hover rows |
| `azure-500` | `#4BB3F2` | Accent fills: CTAs on dark, Fun Food Factory, badges, focus ring |
| `azure-400` | `#8FD0FA` | Accent **text on dark** surfaces |
| `azure-300` | `#C7E6FC` | Accent tints: soft highlights, featured labels |
| `azure-600` | `#0B69AD` | Accent **text on light** surfaces (index numbers, kickers) |
| `ink` | `#14172E` | Body text |
| `paper` | `#FBFBFE` | Page background |

### Contrast rules (WCAG 2.2 AA)

- `castle-600` on white — 10.8 : 1. `castle-900` on `azure-500` — 7.8 : 1. `azure-600` on white — 5.8 : 1.
- **Never** set text in `azure-400/500` on a light background; use `azure-600`.
- Secondary text on light: `text-ink/60` minimum. Don't go below it, except for placeholder text (`placeholder:text-ink/35`).
- Secondary text on navy: `text-white/55` minimum.

### Surface rhythm

Pages alternate surfaces so each section reads as its own chapter:
`paper → white → paper → navy/deep → azure → paper`. Avoid two navy bands in a row.

---

## 3. Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display (h1–h3, numbers, quotes) | **Fraunces** 500–700 | Echoes the italic serif of the logo tagline |
| UI & body | **Inter** 400–700 | Chosen for legibility on low-end Android screens |

Both are self-hosted through `next/font` (no layout shift, no third-party request).

| Token | Size | Usage |
| --- | --- | --- |
| Hero h1 | `clamp(2.5rem, 1.4rem + 4.6vw, 4.3rem)` | One per page |
| Section title | `clamp(2rem, 1.3rem + 3vw, 3.25rem)` | `<SectionTitle>` |
| Eyebrow | 11px, 700, `tracking-[0.22em]`, uppercase + sky-blue dot | `<Eyebrow>` |
| Lede | 18px / relaxed, `ink/65` | `<Lede>` |
| Body | 15–16px / relaxed | — |

Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

---

## 4. Layout & spacing

- **Container:** `container-editorial` — 80rem max, 20px gutters (32px ≥ 1024px).
- **Grid:** 12 columns. Editorial spreads use **5 / 6-offset-1** or **6 / 5-offset-1**,
  never 6 / 6. Asymmetry is intentional.
- **Section padding:** `py-20 lg:py-28` (default), `py-14 lg:py-20` (tight), `py-24 lg:py-36` (loose).
- **Radii:** photos `28–34px`; panels `24–30px`; inputs `12px`; buttons fully rounded.
  Rounded panels are for *containers of interaction* (forms, CTAs) — not for listing content.

### Listing content without card grids

| Content | Pattern | Example |
| --- | --- | --- |
| Loan products | Alternating editorial spreads | `ProductRow` |
| Product benefits | Numbered rows separated by hairlines | `/loans/[slug]` |
| Services | Editorial index (number · thumb · name · line · arrow) | `/services` |
| Comparison | Real `<table>` with hairlines | `/loans#compare` |
| Categories | Typographic grid with shared borders | `/bill-payments` |
| Large-facility types | Big serif list on navy | `/services#large-financing` |

---

## 5. Components

| Component | File | Purpose |
| --- | --- | --- |
| `SiteHeader` | `components/layout/site-header.tsx` | Utility bar, sticky nav, Services mega menu, mobile drawer |
| `SiteFooter` | `components/layout/site-footer.tsx` | Knockout logo, sitemap columns, contact |
| `PageHero` / `Breadcrumbs` | `components/shared/page-hero.tsx` | Internal page hero + BreadcrumbList JSON-LD |
| `ProductRow` | `components/shared/product-row.tsx` | Editorial loan spread with stat callout |
| `NeedFinder` | `components/home/need-finder.tsx` | "I need…" chips → one large panel |
| `Process` | `components/home/process.tsx` | Three bridged steps |
| `PhoneMock` | `components/shared/phone-mock.tsx` | Rendered app surface (not a stock photo) |
| `CtaBand` | `components/shared/cta-band.tsx` | Closing consultation prompt |
| `Faq` | `components/shared/faq.tsx` | `<details>` accordion + FAQPage JSON-LD |
| `ButtonLink` / `Button` / `TextLink` | `components/ui/button.tsx` | `primary` · `accent` · `outline` · `ghost` · `onDark` |
| `Section` / `Container` / `Eyebrow` / `SectionTitle` | `components/ui/section.tsx` | Layout primitives |
| `Reveal` | `components/ui/reveal.tsx` | Below-the-fold scroll reveal |
| Form fields | `components/forms/fields.tsx` | `TextField`, `SelectField`, `TextareaField`, `ChoiceCards`, `CheckboxField`, `SuccessPanel` |

### Buttons

- **Primary** (logo blue) — the one action a section wants.
- **Accent** (azure) — primary action on navy, or travel/bills where the logo blue would disappear.
- **TextLink** — secondary action beside a button, with the animated sky-blue underline.
- One primary button per section. Application CTAs are prominent but never
  repeated back-to-back.

### Forms

- Label above input; **"Optional" tag on optional fields** instead of asterisks on required ones.
- Errors appear under the field in `red-700`, announced with `role="alert"`, and the
  input gets `aria-invalid` + `aria-describedby`.
- Choices that change the rest of the form use `ChoiceCards`, not a `<select>`.
- Loan applications are a three-step flow (*The loan → About you → Review*). Each step
  validates before advancing; server errors jump back to the step that owns the field.
- Every form has a honeypot field and server-side rate limiting.

---

## 6. Motion

| Motion | Rule |
| --- | --- |
| Above the fold | CSS-only `.rise` keyframe — paints on first frame, no JS dependency |
| Below the fold | `Reveal` — 26px lift + fade, 850ms `ease-out-expo`, once |
| Hover | Buttons lift 2px; arrows nudge 4px; photos scale ≤ 1.05 |
| Marquee | 34s linear, pauses on hover |
| Reduced motion | `prefers-reduced-motion` disables all of the above |

Reveal content is hidden only when `html.js` is present, so nothing is ever invisible
without JavaScript.

---

## 7. Photography & art direction

### Principles

1. **People and outcomes, not objects.** A child in class beats a school building; a trader
   at her stall beats a pile of naira notes.
2. **Nigerian, specific, unstaged.** Real uniforms, real markets, real Lagos. No generic
   "diverse office" stock.
3. **Warm light, honest colour.** The `.photo-tone` treatment adds a touch of saturation
   and contrast to unify sources — it never recolours skin.
4. **Always framed.** Photos sit in large-radius frames with an offset colour block, or run
   full-bleed under a navy wash. Never float a raw rectangle.
5. **Leave room for type.** Compose with calm space at the bottom (for captions) or on one
   side (for the stat callout).

> **Current imagery** is openly-licensed documentary photography from Wikimedia Commons
> (see `/image-credits`). It is authentic but uneven in quality. The shot list below is the
> brief for a commissioned shoot, which should replace it before launch.

### Section-by-section shot list

| Page / section | Current file | What to commission |
| --- | --- | --- |
| **Home — hero** | `education-students.jpg` | Portrait-orientation group of secondary pupils in uniform, genuinely laughing, shot at eye level in a Lagos private school courtyard. Space at bottom-left for the caption. |
| Home — hero inset | `market-trader.jpg` | Tight crop of an entrepreneur's hands and face mid-sale. Must read at 200px wide. |
| Home — need finder / Bills | `lagos-traffic.jpg` | Wide Lagos street life — danfos, stalls, movement — for the "everyday" story. |
| **School Fee Loan** | `education-students.jpg`, `classroom-computers.jpg` | A parent handing over a school bag at the gate; a pupil at a desk. Never a sad child. |
| **Travel Loan** | `travel-terminal.jpg`, `travel-tarmac.jpg` | Departure hall at Murtala Muhammed Airport; a young woman with passport and admission letter; family goodbye at the terminal. |
| **Personal Loan** | `family-generations.jpg` | Salary-earner at home with family, relaxed — relief, not distress. |
| **Business & SME Loan** | `market-trader.jpg`, `artisan-workshop.jpg` | Trader restocking; tailor or carpenter at work; a shop owner reviewing a ledger. |
| **Advisory** | `market-grain.jpg` | Gap Castle officer and a business owner looking at the same notebook — collaboration, not a lecture. |
| **Large financing** | `lagos-cbd.jpg` | Lagos Island / Victoria Island skyline at golden hour; a warehouse loading bay. |
| **About — hero** | `graduation.jpg` | Graduation or convocation — the long-term outcome of an education loan. |
| About — story | `classroom-computers.jpg`, `lagos-bridge.jpg` | Third Mainland Bridge at dawn (the literal bridge); the Ikeja office team. |
| **Fun Food Factory** | `community-cooking.jpg`, `jollof-rice.jpg`, `market-grain.jpg`, `fun-food-flyer.jpg` (the real campaign flyer) | Real game-day coverage in Ikeja: adult participants mid-game (all participants are 18+), winners holding cartons of Indomie and bags of rice, the venue set-up. Colourful and candid; shoot wide + detail pairs. Participants consent to photography under the programme's terms. |
| **Contact** | `lagos-bridge.jpg` (hero wash) | Exterior of the Ikeja office with visible signage; a staff member answering the phone. |
| **Bill payments / Apps** | `phone-hands.jpg`, `PhoneMock` | Hands paying on an Android phone in a real setting (market, bus, kitchen). Show the actual app UI once available. |

### Technical specs

- Deliver ≥ 2400px on the long edge, sRGB, JPEG quality 85+.
- Provide both 3:2 landscape and 4:5 portrait crops of hero shots.
- Obtain signed model releases for every recognisable person.
- Write alt text that describes the scene, not the brand message.

---

## 8. Accessibility & performance checklist

- [ ] One `h1` per page; headings in order.
- [ ] Every image has meaningful `alt`, or `alt=""` + `aria-hidden` when decorative.
- [ ] Interactive elements reachable by keyboard with a visible sky-blue focus ring.
- [ ] Text contrast follows §2.
- [ ] Hero image uses `priority`; everything else lazy-loads through `next/image` (AVIF/WebP).
- [ ] No layout shift from fonts (`next/font`) or images (explicit `width`/`height` or `fill`).
- [ ] Works at 360px width with no horizontal scroll.
