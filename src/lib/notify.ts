import type { z } from "zod";
import { renderEmail, type EmailRow } from "@/lib/email-templates";
import { formatDate, formatNaira, humanize } from "@/lib/format";
import { funFood } from "@/lib/fun-food";
import { sendMail } from "@/lib/mailer";
import { getSettings, parseEmailList } from "@/lib/settings";
import { loanByDbType, site } from "@/lib/site";
import type {
  contactSchema,
  donationSchema,
  funFoodRegistrationSchema,
  LoanApplicationInput,
} from "@/lib/validation";

/*
 * One function per website form. Each emails the team and, when the person gave
 * an address and confirmations are enabled, sends them an acknowledgement.
 * Called from server actions inside after(), once the database write succeeded.
 */

const appUrl = () => (process.env.APP_URL || site.url).replace(/\/$/, "");
const firstName = (name: string) => name.trim().split(/\s+/)[0];

async function audience() {
  const settings = await getSettings();
  const team = parseEmailList(settings.notification_emails);
  return {
    team: team.length ? team : [site.email],
    confirm: settings.send_confirmation_emails === "1",
    fromName: settings.mail_from_name || site.name,
  };
}

/* ------------------------------------------------------------------ */

export async function notifyLoanApplication(d: LoanApplicationInput, reference: string) {
  const { team, confirm, fromName } = await audience();
  const product = loanByDbType(d.loanType)?.name ?? humanize(d.loanType);
  const fullName = [d.firstName, d.middleName, d.surname].filter(Boolean).join(" ");

  const rows: EmailRow[] = [
    ["Reference", reference],
    ["Product", product],
    ["Applying as", d.applicationType === "corporate" ? "Company / business" : "Individual"],
    ["Name", fullName],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Date of birth", formatDate(d.dateOfBirth)],
    ["Amount requested", formatNaira(d.loanAmount)],
    ["Repayment period", d.repaymentMonths ? `${d.repaymentMonths} months` : "No preference"],
    ["Purpose", d.loanPurpose],
    ["School", d.loanType === "school" ? d.schoolName : null],
    ["Children covered", d.loanType === "school" ? d.numberOfChildren : null],
    ["Destination", d.loanType === "travel" ? d.travelDestination : null],
    ["Trip purpose", d.loanType === "travel" ? humanize(d.travelPurpose) : null],
    ["Travel date", d.loanType === "travel" && d.travelDate ? formatDate(d.travelDate) : null],
    ["Employer", d.employer],
    ["Monthly income / revenue", d.monthlyIncome !== undefined ? formatNaira(d.monthlyIncome) : null],
    ["Business name", d.businessName],
    ["CAC registered", d.businessRegistered ? humanize(d.businessRegistered) : null],
    ["Home address", d.homeAddress],
    ["Office address", d.officeAddress],
  ];

  const admin = renderEmail({
    preheader: `${product} · ${formatNaira(d.loanAmount)} · ${fullName}`,
    eyebrow: "New loan application",
    heading: `${product} — ${fullName}`,
    intro: `A new application was submitted on the website. Reply to this email to reach ${firstName(d.firstName)} directly.`,
    rows,
    cta: { label: "Open in admin", href: `${appUrl()}/admin/applications?q=${encodeURIComponent(reference)}` },
  });

  const jobs = [
    sendMail({
      event: "loan.team",
      reference,
      to: team,
      subject: `New ${product} application — ${fullName} (${reference})`,
      replyTo: d.email,
      fromName,
      ...admin,
    }),
  ];

  if (confirm) {
    const ack = renderEmail({
      preheader: `We have your ${product.toLowerCase()} application. Reference ${reference}.`,
      eyebrow: "Application received",
      heading: `Thank you, ${d.firstName}.`,
      intro: `We have received your ${product.toLowerCase()} application. A loan officer will contact you within one working day, and approved funds move within 24 hours.`,
      rows: [
        ["Reference", reference],
        ["Product", product],
        ["Amount requested", formatNaira(d.loanAmount)],
      ],
      note: `Please quote ${reference} whenever you contact us about this application. You can reach us on ${site.phones[0]} or ${site.email}.`,
    });
    jobs.push(
      sendMail({
        event: "loan.applicant",
        reference,
        to: d.email,
        subject: `We received your ${product} application (${reference})`,
        fromName,
        ...ack,
      }),
    );
  }

  await Promise.all(jobs);
}

/* ------------------------------------------------------------------ */

export async function notifyContactMessage(d: z.infer<typeof contactSchema>, reference: string) {
  const { team, confirm, fromName } = await audience();
  const topic = humanize(d.topic);

  const admin = renderEmail({
    preheader: `${topic} enquiry from ${d.name}`,
    eyebrow: "New enquiry",
    heading: d.subject || `${topic} enquiry`,
    intro: `${d.name} sent a message through the contact page and prefers to be contacted by ${
      d.preferredContact === "whatsapp" ? "WhatsApp" : d.preferredContact
    }.`,
    rows: [
      ["Reference", reference],
      ["Name", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Topic", topic],
      ["Preferred contact", humanize(d.preferredContact)],
      ["Message", d.message],
    ],
    cta: { label: "Open messages", href: `${appUrl()}/admin/messages` },
  });

  const jobs = [
    sendMail({
      event: "contact.team",
      reference,
      to: team,
      subject: `New enquiry: ${d.subject || topic} — ${d.name} (${reference})`,
      replyTo: d.email,
      fromName,
      ...admin,
    }),
  ];

  if (confirm) {
    const ack = renderEmail({
      preheader: "Thanks for getting in touch with Gap Castle.",
      eyebrow: "Message received",
      heading: `Thanks, ${firstName(d.name)}.`,
      intro: "We have your message and will get back to you within one working day — usually much sooner during office hours.",
      rows: [
        ["Reference", reference],
        ["Topic", topic],
        ["Your message", d.message],
      ],
      note: `Office hours: ${site.hours.weekdays}. For anything urgent, call ${site.phones[0]}.`,
    });
    jobs.push(
      sendMail({
        event: "contact.sender",
        reference,
        to: d.email,
        subject: `We received your message (${reference})`,
        fromName,
        ...ack,
      }),
    );
  }

  await Promise.all(jobs);
}

/* ------------------------------------------------------------------ */

export async function notifyFunFoodRegistration(d: z.infer<typeof funFoodRegistrationSchema>, reference: string) {
  const { team, confirm, fromName } = await audience();
  const fullName = [d.firstName, d.middleName, d.surname].filter(Boolean).join(" ");

  const admin = renderEmail({
    preheader: `Fun Food Factory registration — ${fullName}`,
    eyebrow: "Fun Food Factory",
    heading: `New registration: ${fullName}`,
    intro: "A member of the public registered for the Fun Food Factory.",
    rows: [
      ["Reference", reference],
      ["Name", fullName],
      ["Phone", d.phone],
      ["Email", d.email],
      ["Date of birth", formatDate(d.dateOfBirth)],
      ["Home address", d.homeAddress],
      ["Marital status", d.maritalStatus ? humanize(d.maritalStatus) : null],
      ["Number of children", d.numberOfChildren],
      ["Employment", d.employmentType ? humanize(d.employmentType) : null],
      ["Place of work", d.placeOfWork],
      ["Line of business", d.lineOfBusiness],
      ["Work address", d.workAddress],
    ],
    cta: { label: "Open Fun Food Factory", href: `${appUrl()}/admin/fun-food` },
  });

  const jobs = [
    sendMail({
      event: "funfood.registration.team",
      reference,
      to: team,
      subject: `Fun Food Factory registration — ${fullName} (${reference})`,
      replyTo: d.email,
      fromName,
      ...admin,
    }),
  ];

  if (confirm && d.email) {
    const ack = renderEmail({
      preheader: "You are registered for the Fun Food Factory.",
      eyebrow: "Fun Food Factory",
      heading: `You are registered, ${d.firstName}.`,
      intro: `Thank you for registering. ${funFood.inviteOnly} If you are selected, your invitation will arrive at least 48 hours before the game day, with the venue details in Ikeja.`,
      rows: [
        ["Reference", reference],
        ["Registration", "Free"],
        ["Transport support", "₦2,000 for every invited participant"],
      ],
      note: "Participation is limited to once a quarter and open to adults aged 18 and above. By registering you agreed to the programme's terms and conditions.",
      cta: { label: "Read the terms", href: `${appUrl()}/fun-food-factory#terms` },
    });
    jobs.push(
      sendMail({
        event: "funfood.registration.participant",
        reference,
        to: d.email,
        subject: `Fun Food Factory registration confirmed (${reference})`,
        fromName,
        ...ack,
      }),
    );
  }

  await Promise.all(jobs);
}

/* ------------------------------------------------------------------ */

export async function notifyDonation(d: z.infer<typeof donationSchema>, reference: string) {
  const { team, confirm, fromName } = await audience();
  const gift = d.donationType === "cash" ? formatNaira(d.amount) : d.foodItems ?? "Food items";

  const admin = renderEmail({
    preheader: `Donation pledge from ${d.name}: ${gift}`,
    eyebrow: "Fun Food Factory",
    heading: `New donation pledge: ${gift}`,
    intro: `${d.name} pledged a ${d.donationType === "cash" ? "cash gift" : "donation of food items"}.`,
    rows: [
      ["Reference", reference],
      ["Name", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Type", d.donationType === "cash" ? "Cash gift" : "Food items"],
      ["Amount", d.donationType === "cash" ? formatNaira(d.amount) : null],
      ["Food items", d.donationType === "food" ? d.foodItems : null],
      ["Note", d.note],
    ],
    cta: { label: "Open Fun Food Factory", href: `${appUrl()}/admin/fun-food` },
  });

  const jobs = [
    sendMail({
      event: "funfood.donation.team",
      reference,
      to: team,
      subject: `Donation pledge — ${d.name}: ${gift} (${reference})`,
      replyTo: d.email,
      fromName,
      ...admin,
    }),
  ];

  if (confirm) {
    const { accountName, bank, accountNumber } = funFood.donation;
    const ack = renderEmail({
      preheader: "Thank you for supporting the Fun Food Factory.",
      eyebrow: "Thank you",
      heading: `Thank you, ${firstName(d.name)}.`,
      intro:
        d.donationType === "cash"
          ? "Your support helps us put food on more tables. Please complete your gift with a transfer to the account below and quote your reference."
          : "Your support helps us put food on more tables. Our team will be in touch shortly about your food items.",
      rows:
        d.donationType === "cash"
          ? [
              ["Reference", reference],
              ["Amount pledged", formatNaira(d.amount)],
              ["Account name", accountName],
              ["Bank", bank],
              ["Account number", accountNumber],
            ]
          : [
              ["Reference", reference],
              ["Food items", d.foodItems],
            ],
      note: funFood.donation.intro,
    });
    jobs.push(
      sendMail({
        event: "funfood.donation.donor",
        reference,
        to: d.email,
        subject: `Thank you for your donation pledge (${reference})`,
        fromName,
        ...ack,
      }),
    );
  }

  await Promise.all(jobs);
}

/* ------------------------------------------------------------------ */

export async function notifyNewsletterSignup(email: string, source: string, isNew: boolean) {
  const { team, confirm, fromName } = await audience();
  const jobs = [];

  if (isNew) {
    const admin = renderEmail({
      preheader: `New subscriber: ${email}`,
      eyebrow: "Updates sign-up",
      heading: "New subscriber",
      intro: "Someone signed up for updates on the website.",
      rows: [
        ["Email", email],
        ["Signed up from", humanize(source)],
      ],
    });
    jobs.push(sendMail({ event: "newsletter.team", to: team, subject: `New subscriber: ${email}`, fromName, ...admin }));
  }

  if (confirm) {
    const ack = renderEmail({
      preheader: "You are subscribed to Gap Castle updates.",
      eyebrow: "Subscribed",
      heading: "You are on the list.",
      intro:
        source === "fun_food"
          ? "We will email you when new Fun Food Factory game days or locations are announced. Nothing else."
          : "We will only write when there is something worth reading.",
      cta: source === "fun_food" ? { label: "Visit the Fun Food Factory", href: `${appUrl()}/fun-food-factory` } : undefined,
    });
    jobs.push(sendMail({ event: "newsletter.subscriber", to: email, subject: "You are subscribed to Gap Castle updates", fromName, ...ack }));
  }

  await Promise.all(jobs);
}
