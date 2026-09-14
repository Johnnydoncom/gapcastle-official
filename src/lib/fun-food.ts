/**
 * Fun Food Factory content, taken from the programme's original page on
 * gapcastle.com (story, schedule, terms, games, prizes and payment details).
 */

export const funFood = {
  title: "The Fun Food Factory",
  strap: "Play fun games. Win food items.",
  intro:
    "Gap Castle's Corporate Social Responsibility programme: food items for members of the public, won through fun games. Registration is free, and we are starting from Lagos.",

  story: {
    lead: "Some Nigerians are unable to afford a meal per day — despite the abundant resources in Nigeria.",
    paragraphs: [
      "Gap Castle acknowledges that the prices of things have gone up in the country, especially food items.",
      "As part of our Corporate Social Responsibility, we have decided to make some food items available to members of the public. This will no doubt bridge the food shortage gap in some homes.",
      "The name “Fun Food Factory” was carefully chosen as the platform for distributing those food items to the public — and the distribution happens through fun games.",
    ],
    signoff: "Contributing our bit to Nigeria",
  },

  facts: [
    { value: "Free", label: "Registration and participation — no payment, ever" },
    { value: "Monthly", label: "One Saturday every month, in Ikeja, Lagos" },
    { value: "₦2,000", label: "Transport support for every invited participant" },
    { value: "10", label: "Winners, at most, in each game session" },
  ],

  schedule:
    "Games hold one Saturday in every month in Ikeja, Lagos, from October 2024. Full details are sent to invited participants.",

  steps: [
    {
      step: "1",
      title: "Register for free",
      body: "Any member of the public aged 18 or above can register below. We are starting from Lagos.",
    },
    {
      step: "2",
      title: "Receive your invitation",
      body: "Participation is strictly by invitation, sent at least 48 hours before the game day with all the details.",
    },
    {
      step: "3",
      title: "Come and play",
      body: "Games hold on a Saturday in Ikeja. Every invited participant receives ₦2,000 towards transport to the venue.",
    },
    {
      step: "4",
      title: "Win food items",
      body: "Up to 10 people win in each game session. You can take part once every quarter.",
    },
  ],

  games: [
    "Balloon burst showdown",
    "Targeting cup",
    "Land football in all the tyres",
    "Draft & matching colours",
    "Matching bottles or drinks",
    "Structure stability",
    "Football aim & target",
    "Picking cups with pegs",
    "Getting balls out of a bottle",
    "Balloon bowling",
    "Jump correctly and win cash",
    "Cup above all",
  ],

  prizes: [
    "Cartons of Indomie",
    "Spaghetti",
    "Vegetable oil",
    "Bags of 5kg rice",
    "Beans",
    "Maggi",
    "Airtime",
    "Cash",
    "Other items",
  ],

  terms: [
    "The age limit is 18 years and above.",
    "Participation is free.",
    "Participation shall only be once a quarter.",
    "The company shall decide the games up for participation.",
    "Participants unconditionally consent to the taking of pictures and video recordings of their participation, and to these being uploaded to the company’s website and social media handles.",
    "No right of action or claim of any kind arising from the games can be made against the company or its representatives by any participant.",
    "Invitations shall be sent at least 48 hours before the games date.",
  ],

  note: "Not more than 10 people will win per game session, and each invited participant is entitled to ₦2,000 to cover transportation to the venue.",
  inviteOnly: "Participation is strictly by invitation.",

  donation: {
    title: "Make a difference today.",
    intro:
      "Your donation helps us continue our mission. Every contribution counts and brings us closer to lasting change.",
    accountName: "Castle Food Support Foundation",
    bank: "Wema Bank",
    accountNumber: "0126947801",
  },
} as const;
