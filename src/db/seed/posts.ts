// Starter blog posts inserted by `npm run db:seed` when the blog is empty.
// Content is drawn only from facts already published on the site.
// Covers are copied from public/images into the media library.

export type StarterPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** slug of a category in ./categories */
  category: string;
  cover: { file: string; alt: string };
  is_featured: 0 | 1;
  days_ago: number;
  /** HTML, as the rich text editor produces it */
  content: string;
};

export const starterPosts: StarterPost[] = [
  {
    slug: "introducing-the-fun-food-factory",
    title: "Introducing the Fun Food Factory",
    excerpt:
      "Food prices have climbed across Nigeria. Our CSR programme gives members of the public the chance to win food items through fun, free game days in Ikeja.",
    category: "community",
    cover: { file: "community-cooking.jpg", alt: "Community members cooking together over open fires" },
    is_featured: 1,
    days_ago: 2,
    content: `
<p>Food prices in Nigeria have climbed sharply, and for some households even one meal a day has become hard to afford — despite the abundant resources in the country.</p>
<p>As part of our Corporate Social Responsibility, Gap Castle has decided to make food items available to members of the public. We called the programme the <strong>Fun Food Factory</strong>, because the food is distributed through fun games.</p>
<h2>How it works</h2>
<ol>
  <li><p><strong>Register for free.</strong> Any member of the public aged 18 or above can register on the <a href="/fun-food-factory#register">Fun Food Factory page</a>.</p></li>
  <li><p><strong>Receive an invitation.</strong> Participation is strictly by invitation, and invites are sent at least 48 hours before the game day.</p></li>
  <li><p><strong>Come and play.</strong> Games hold one Saturday every month in Ikeja, Lagos. Every invited participant receives ₦2,000 towards transport to the venue.</p></li>
  <li><p><strong>Win food items.</strong> Up to 10 people win in each game session.</p></li>
</ol>
<h2>What you could win</h2>
<p>Prizes include cartons of Indomie, spaghetti, vegetable oil, bags of 5kg rice, beans, Maggi, airtime and cash.</p>
<h2>The games</h2>
<p>The company decides the games for each session. Proposed games include a balloon burst showdown, balloon bowling, picking cups with pegs and “jump correctly and win cash”.</p>
<blockquote><p>Participation is free and limited to once a quarter. Please read the full <a href="/fun-food-factory#terms">terms and conditions</a> before you register.</p></blockquote>
<h2>Support the Factory</h2>
<p>Every contribution helps us reach more homes. You can give cash or food items — see the <a href="/fun-food-factory#donate">donation details</a>.</p>`,
  },
  {
    slug: "how-a-school-fee-loan-works",
    title: "How a school fee loan from Gap Castle works",
    excerpt:
      "Fees paid directly to your child's school, repaid in instalments. Here is what happens from application to disbursement — and what to have ready.",
    category: "education",
    cover: { file: "education-students.jpg", alt: "Nigerian secondary school students in uniform" },
    is_featured: 0,
    days_ago: 9,
    content: `
<p>A school term should never be missed because fees fell due before salary arrived. That timing gap is exactly what our school fee loan is designed to close.</p>
<h2>Paid directly to the school</h2>
<p>Gap Castle partners with private primary and secondary schools in Nigeria. When your loan is approved, we pay the school directly, so your child's place is secured and you do not have to handle cash.</p>
<h2>Repay in instalments</h2>
<p>Instead of one large payment at the start of term, you repay over time. Your loan officer agrees the repayment plan with you before anything is finalised.</p>
<h2>Applying takes about five minutes</h2>
<p>Our online application has three short steps:</p>
<ol>
  <li><p><strong>The loan</strong> — the school, how many children the fees cover, the amount and what it is for.</p></li>
  <li><p><strong>About you</strong> — your contact details and address.</p></li>
  <li><p><strong>Review</strong> — check everything and submit.</p></li>
</ol>
<p>Applications are reviewed the same working day, and approved funds move within 24 hours.</p>
<h2>What you may be asked for</h2>
<p>Your loan officer confirms the exact list, but it helps to have these ready:</p>
<ul>
  <li><p>A valid government ID</p></li>
  <li><p>The school's fee invoice for the term</p></li>
  <li><p>Proof of address</p></li>
  <li><p>A recent bank statement</p></li>
</ul>
<p>Ready to start? <a href="/apply/school-fee-loan">Apply for a school fee loan</a>, or <a href="/contact?topic=school">talk to a loan officer</a> first.</p>`,
  },
  {
    slug: "what-a-travel-loan-can-cover",
    title: "Travelling abroad? What a travel loan can cover",
    excerpt:
      "Tickets, visa fees, insurance and proof of funds rarely arrive one at a time. A travel loan is sized against the whole trip.",
    category: "travel",
    cover: {
      file: "travel-terminal.jpg",
      alt: "Travellers in the departure hall at Murtala Muhammed International Airport, Lagos",
    },
    is_featured: 0,
    days_ago: 16,
    content: `
<p>Whether it is study abroad, a business trip, visiting family or medical travel, the cost of a journey rarely arrives as a single bill. Tickets, visa fees, insurance and proof of funds tend to land at the same time.</p>
<h2>One facility for the whole trip</h2>
<p>A Gap Castle travel loan is sized against the full cost of getting there — not just the flight. That can include:</p>
<ul>
  <li><p>Flight tickets</p></li>
  <li><p>Visa application fees</p></li>
  <li><p>Travel insurance</p></li>
  <li><p>Proof of funds (POF) support for student and visitor visa applications</p></li>
</ul>
<h2>Before you apply</h2>
<p>Have these details to hand to make the application quicker:</p>
<ul>
  <li><p>Your destination and the purpose of the trip</p></li>
  <li><p>Your planned travel date, even if it is an estimate</p></li>
  <li><p>The amount you need and what it will cover</p></li>
</ul>
<p>Your loan officer may also ask for your international passport, admission or invitation documents, and a recent bank statement.</p>
<h2>Next steps</h2>
<p><a href="/apply/travel-loan">Apply for a travel loan</a> online in about five minutes. A loan officer will contact you within one working day.</p>`,
  },
];
