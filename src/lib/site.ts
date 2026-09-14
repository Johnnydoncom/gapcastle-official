/**
 * Canonical Gap Castle business content.
 * Sourced from gapcastle.com so the redesign preserves the real offering,
 * contact details and application journeys.
 */

export const site = {
  name: "Gap Castle",
  legalName: "Gap Castle Limited",
  tagline: "Your bridge to financial gap",
  description:
    "Gap Castle bridges financial gaps in education, travel and small business — school-fee loans, travel loans, business funding, advisory and bill payments for Nigerians, processed in under 24 hours.",
  url: "https://gapcastle.com",
  incorporated: 2020,
  address: {
    street: "29b Olorunnimbe Street, Wemabod Estate",
    area: "Off Adeniyi Jones, Ikeja",
    city: "Lagos",
    country: "Nigeria",
    full: "29b Olorunnimbe Street, Wemabod Estate, Off Adeniyi Jones, Ikeja, Lagos",
  },
  phones: ["+234 806 446 9668", "+234 904 222 2296", "+234 904 222 2291"],
  email: "info@gapcastle.com",
  hours: {
    weekdays: "Monday – Friday, 9:00am – 4:00pm",
    weekend: "Saturday & Sunday — Closed",
  },
  social: {
    facebook: "https://web.facebook.com/gapcastle",
    whatsapp: "https://bit.ly/GapCastleLtd",
  },
  payPortal: "https://pay.gapcastle.com",
  mapQuery: "29b Olorunnimbe Street, Wemabod Estate, Adeniyi Jones, Ikeja, Lagos",
} as const;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type MenuLink = { label: string; href: string; blurb: string };

export type NavItem = {
  label: string;
  href: string;
  /** Renders as a two-column mega menu on desktop. */
  menu?: { heading: string; links: MenuLink[] }[];
};

export const primaryNav: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    menu: [
      {
        heading: "Loan products",
        links: [
          { label: "School Fee Loan", href: "/loans/school-fee-loan", blurb: "Keep your child in class." },
          { label: "Travel Loan", href: "/loans/travel-loan", blurb: "Tickets, visas and proof of funds." },
          { label: "Personal Loan", href: "/loans/personal-loan", blurb: "Quick cover for salary earners." },
          { label: "Business & SME Loan", href: "/loans/business-loan", blurb: "Working capital up to ₦3m." },
          { label: "All loan products", href: "/loans", blurb: "Compare every facility side by side." },
        ],
      },
      {
        heading: "More services",
        links: [
          { label: "Business Review & Advisory", href: "/services#advisory", blurb: "We read your numbers with you." },
          { label: "Large Business Financing", href: "/services#large-financing", blurb: "Above ₦3m, via partner lenders." },
          { label: "Bill Payments", href: "/bill-payments", blurb: "Electricity, TV, airtime and data." },
          { label: "Mobile Apps", href: "/mobile-apps", blurb: "Manage everything from your phone." },
        ],
      },
    ],
  },
  { label: "Fun Food Factory", href: "/fun-food-factory" },
  { label: "Bill Payments", href: "/bill-payments" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Flattened for the mobile drawer and the footer. */
export const allNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Loan Products", href: "/loans" },
  { label: "Bill Payments", href: "/bill-payments" },
  { label: "Mobile Apps", href: "/mobile-apps" },
  { label: "Fun Food Factory", href: "/fun-food-factory" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/* ------------------------------------------------------------------ */
/* Loan products                                                       */
/* ------------------------------------------------------------------ */

export type LoanProduct = {
  slug: string;
  /** Value stored in the database `loan_type` column. */
  dbType: string;
  index: string;
  kicker: string;
  name: string;
  shortName: string;
  /** One line used on the need-finder and nav. */
  promise: string;
  summary: string;
  body: string[];
  highlights: { label: string; detail: string }[];
  stat?: { value: string; suffix?: string; label: string };
  image: { src: string; alt: string };
  /** Secondary art-direction note for this product's page. */
  secondaryImage?: { src: string; alt: string };
  ctaLabel: string;
  /** Which "I need…" answer routes here. */
  need: string;
  needLabel: string;
  accent: "castle" | "azure" | "deep";
};

export const loanProducts: LoanProduct[] = [
  {
    slug: "school-fee-loan",
    dbType: "school",
    index: "01",
    kicker: "Education",
    name: "School Fee Loan",
    shortName: "School fees",
    promise: "Keep your child in class while you pay at your own pace.",
    summary:
      "We partner directly with private primary and secondary schools across Nigeria. The school is paid in full and on time; you repay in instalments that respect the family budget.",
    body: [
      "A term should never be missed because fees arrived before salary did. Gap Castle settles the school directly, so your child stays in class and you keep your standing with the school.",
      "Applications are deliberately light on paperwork. Most parents and guardians hear back the same working day, and funds move to the school within 24 hours of approval.",
    ],
    highlights: [
      { label: "Paid direct to the school", detail: "No cash handling, no awkward conversations at the gate." },
      { label: "Term-by-term repayment", detail: "Instalments timed to the school calendar and your income." },
      { label: "Low rates, minimal documents", detail: "Built for salary earners and self-employed parents alike." },
    ],
    stat: { value: "24", suffix: "hrs", label: "average time to disbursement" },
    image: {
      src: "/images/school-fee-students.jpg",
      alt: "A smiling Nigerian secondary school student in uniform writing in her notebook during class in a sunlit classroom",
    },
    secondaryImage: {
      src: "/images/classroom-computers.jpg",
      alt: "Pupils working at computers in a Nigerian school computer room",
    },
    ctaLabel: "Apply for school fees",
    need: "school",
    needLabel: "I need to pay school fees",
    accent: "castle",
  },
  {
    slug: "travel-loan",
    dbType: "travel",
    index: "02",
    kicker: "Travel",
    name: "Travel Loan",
    shortName: "Travel",
    promise: "Fund the whole journey — tickets, visa, proof of funds.",
    summary:
      "Study abroad, business trips, family visits or medical travel. We cover the real cost of getting there, including proof-of-funds support, and you repay in comfortable instalments.",
    body: [
      "The cost of travel is never just the ticket. Visa fees, insurance, proof of funds and pocket money all land at once — usually in a currency that is not doing you any favours.",
      "Our travel loan is sized against the full trip, not a single line item, so nothing derails an application that you have already worked hard for.",
    ],
    highlights: [
      { label: "Flights, visas & insurance", detail: "One facility covering the full cost of departure." },
      { label: "Proof of funds (POF)", detail: "Structured support for student and visitor visa requirements." },
      { label: "Flexible tenure", detail: "Repayment plans matched to your income, not a fixed template." },
    ],
    stat: { value: "100", suffix: "%", label: "of the trip covered — not just the ticket" },
    image: {
      src: "/images/travel-journey.jpg",
      alt: "A confident young Nigerian woman in smart travel attire with suitcase and passport in an international departure hall",
    },
    secondaryImage: {
      src: "/images/travel-tarmac.jpg",
      alt: "Ground crew loading an aircraft on the tarmac at a Nigerian airport",
    },
    ctaLabel: "Plan my trip",
    need: "travel",
    needLabel: "I am travelling abroad",
    accent: "azure",
  },
  {
    slug: "personal-loan",
    dbType: "personal",
    index: "03",
    kicker: "Everyday",
    name: "Personal Loan",
    shortName: "Personal",
    promise: "Quick, low-interest cover for life's sharp edges.",
    summary:
      "Designed for salary earners who need money quickly and want a repayment plan that is finished, not endless. Simple process, honest rate, monthly repayment.",
    body: [
      "Rent that falls due in one lump. A medical bill. A family obligation that cannot wait for month-end. These are ordinary, and they deserve an ordinary, dignified answer.",
      "We keep the process short and the rate low, and we tell you the total cost before you commit — not after.",
    ],
    highlights: [
      { label: "Monthly repayment", detail: "Deducted in step with your salary cycle." },
      { label: "No endless paperwork", detail: "A short form and basic verification — that is it." },
      { label: "Clear total cost", detail: "You see what you will repay before you sign anything." },
    ],
    stat: { value: "< 24", suffix: "hrs", label: "from application to decision" },
    image: {
      src: "/images/family-generations.jpg",
      alt: "A Nigerian family of three generations seated together at home",
    },
    ctaLabel: "Apply for a personal loan",
    need: "personal",
    needLabel: "I need personal support",
    accent: "castle",
  },
  {
    slug: "business-loan",
    dbType: "business",
    index: "04",
    kicker: "Enterprise",
    name: "Business & SME Loan",
    shortName: "Business",
    promise: "Working capital for the shop, the stall and the growing SME.",
    summary:
      "Financing up to ₦3,000,000 at competitive rates for stock, equipment and working capital — with larger facilities sourced through our partner banks and finance houses.",
    body: [
      "Nigerian small business runs on timing. Stock has to be bought before it can be sold; an order has to be fulfilled before it can be invoiced. A short gap in cash should not cost you the contract.",
      "We fund working capital directly up to ₦3,000,000. Above that, we go to our network of banks, lenders and finance houses and negotiate the structure on your behalf.",
    ],
    highlights: [
      { label: "Up to ₦3,000,000 direct", detail: "Stock, equipment and working capital from our own books." },
      { label: "Above ₦3m via partners", detail: "Term loans, overdrafts, invoice discounting, LPO and more." },
      { label: "Rate negotiated for you", detail: "We shop the structure so you are not doing it alone." },
    ],
    stat: { value: "₦3m", suffix: "+", label: "sourced through partner lenders" },
    image: {
      src: "/images/business-sme-enterprise.jpg",
      alt: "Two ambitious young Nigerian entrepreneurs reviewing business strategy documents and laptop on a sunlit Lagos terrace",
    },
    secondaryImage: {
      src: "/images/artisan-workshop.jpg",
      alt: "A young Nigerian carpenter building furniture outside a local workshop",
    },
    ctaLabel: "Grow my business",
    need: "business",
    needLabel: "I am growing a business",
    accent: "deep",
  },
];

export const loanBySlug = (slug: string) => loanProducts.find((p) => p.slug === slug);
export const loanByDbType = (t: string) => loanProducts.find((p) => p.dbType === t);

/* ------------------------------------------------------------------ */
/* Non-loan services                                                   */
/* ------------------------------------------------------------------ */

export type Service = {
  id: string;
  index: string;
  name: string;
  summary: string;
  body: string;
  points: string[];
  href: string;
  ctaLabel: string;
  image?: { src: string; alt: string };
};

export const services: Service[] = [
  {
    id: "advisory",
    index: "05",
    name: "Business Review & Advisory",
    summary: "We read your numbers with you, then advise on what to actually do about them.",
    body:
      "Many small business owners are carrying good businesses and bad bookkeeping. We sit down with owners who are struggling with records, borrowing or simply knowing whether they are profitable, break the business down in plain language, and recommend the funding structure that fits.",
    points: [
      "Bookkeeping and records review",
      "Cash-flow and profitability breakdown",
      "Borrowing readiness and structure advice",
      "Plain-language reporting — no jargon",
    ],
    href: "/contact?subject=Business%20Review",
    ctaLabel: "Book a business review",
    image: {
      src: "/images/market-grain.jpg",
      alt: "Nigerian women trading grain at a busy open-air market",
    },
  },
  {
    id: "large-financing",
    index: "06",
    name: "Large Business Financing",
    summary: "Facilities above ₦3,000,000, arranged through our partner banks and finance houses.",
    body:
      "When a requirement outgrows our own book, we do not turn it away — we take it to the market. Gap Castle maintains relationships with banks, lenders and finance houses, and processes larger facilities on your behalf at the best rate and tenure we can secure.",
    points: [
      "Term loans and overdrafts",
      "Invoice discounting and LPO financing",
      "Mortgage facilitation",
      "Blocked funds processing",
    ],
    href: "/contact?subject=Large%20Business%20Financing",
    ctaLabel: "Discuss a large facility",
    image: {
      src: "/images/lagos-cbd.jpg",
      alt: "The Lagos central business district skyline",
    },
  },
  {
    id: "bills",
    index: "07",
    name: "Bill Payments",
    summary: "Electricity, TV, airtime and data — settled in seconds from web or mobile.",
    body:
      "Everyday payments should be the least interesting part of your month. Pay utility bills, top up airtime, buy internet data and manage your Gap Castle account from our web platform or the mobile app.",
    points: [
      "Electricity — prepaid and postpaid, all major discos",
      "Airtime and data on every network",
      "TV and utility subscriptions",
      "Available on web, Android and iOS",
    ],
    href: "/bill-payments",
    ctaLabel: "Pay a bill",
    image: {
      src: "/images/phone-hands.jpg",
      alt: "Hands holding a smartphone showing an illuminated screen",
    },
  },
];

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export const processSteps = [
  {
    step: "1",
    title: "Tell us what you need",
    body: "Complete a short application online, or walk into our Ikeja office. School fees, travel, personal or business — start where you are.",
  },
  {
    step: "2",
    title: "We review and match the rate",
    body: "Our team reviews your request the same working day and matches you to the lowest rate available — from our own book or our partner lenders.",
  },
  {
    step: "3",
    title: "Funds move within 24 hours",
    body: "On approval the money goes where it is needed: straight to the school, into your travel plan, or to your business account.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Trust markers                                                       */
/* ------------------------------------------------------------------ */

export const trustMarkers = [
  "Incorporated in Nigeria since 2020",
  "Registered money lender",
  "Partnered with banks & finance houses",
] as const;

export const missionVision = {
  vision:
    "To be the No. 1 financial support system — especially in education, at home and abroad — helping people access loans with ease, at the best rate, in the shortest possible time.",
  mission:
    "Becoming a leading financial institution with effective presence anywhere we are, and providing unequalled customer experience.",
  values: [
    {
      title: "Specialists, not generalists",
      body: "Education and travel finance are what we know best, and it shows in how quickly we move.",
    },
    {
      title: "Plain answers",
      body: "We tell you the rate, the tenure and the total cost before you commit — in language you can repeat to your spouse.",
    },
    {
      title: "Precise execution",
      body: "Applications reviewed the same working day; approved funds disbursed within 24 hours.",
    },
    {
      title: "Reachable people",
      body: "A real office in Ikeja, real phone numbers, and someone who answers them.",
    },
  ],
} as const;

/* Fun Food Factory content lives in ./fun-food.ts */
