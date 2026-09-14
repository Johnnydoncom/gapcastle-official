"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import {
  contactMessages,
  funFoodDonations,
  funFoodRegistrations,
  loanApplications,
  newsletterSubscribers,
} from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { db, dbErrorCode, makeReference } from "@/lib/db";
import { funFood } from "@/lib/fun-food";
import {
  notifyContactMessage,
  notifyDonation,
  notifyFunFoodRegistration,
  notifyLoanApplication,
  notifyNewsletterSignup,
} from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import {
  contactSchema,
  donationSchema,
  fieldErrorsFrom,
  formDataToRecord,
  funFoodRegistrationSchema,
  loanApplicationSchema,
  newsletterSchema,
  type LoanType,
} from "@/lib/validation";

const TEN_MINUTES = 10 * 60 * 1000;

async function client() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || h.get("x-real-ip") || "unknown",
    userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
  };
}

/**
 * Every submission is saved first; emails are sent after the response, so a
 * slow or unavailable mail server never delays or fails the visitor's request.
 * Delivery outcomes are recorded in email_log.
 */
function emailInBackground(label: string, task: () => Promise<void>) {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error(`[notify] ${label} failed:`, error);
    }
  });
}

const money = (value: number | undefined) => (value === undefined ? null : value.toFixed(2));

const saveFailed = (values: Record<string, string>): ActionState => ({
  status: "error",
  message: `We could not save your submission just now. Please try again in a moment, or call us on ${site.phones[0]}.`,
  values,
});

const throttled = (values: Record<string, string>): ActionState => ({
  status: "error",
  message: "You have sent several submissions in a short time. Please wait a few minutes and try again.",
  values,
});

const invalid = (values: Record<string, string>, fieldErrors: Record<string, string>): ActionState => ({
  status: "error",
  message: "A few details need your attention — they are highlighted below.",
  fieldErrors,
  values,
});

/** Bots fill every field; people never see this one. Pretend success so they move on. */
const isBot = (values: Record<string, string>) => Boolean(values.website);

/* ------------------------------------------------------------------ */

const loanPrefix: Record<LoanType, string> = {
  school: "SCH",
  travel: "TRV",
  personal: "PER",
  business: "BUS",
};

export async function submitLoanApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToRecord(formData);
  if (isBot(values)) return { status: "success", reference: makeReference("APP") };

  const { ip, userAgent } = await client();
  if (!(await rateLimit(`loan:${ip}`, 5, TEN_MINUTES))) return throttled(values);

  const parsed = loanApplicationSchema.safeParse(values);
  if (!parsed.success) return invalid(values, fieldErrorsFrom(parsed.error));

  const d = parsed.data;
  const reference = makeReference(loanPrefix[d.loanType]);

  try {
    await db.insert(loanApplications).values({
      reference,
      loan_type: d.loanType,
      application_type: d.applicationType,
      surname: d.surname,
      first_name: d.firstName,
      middle_name: d.middleName,
      email: d.email,
      phone: d.phone,
      date_of_birth: d.dateOfBirth,
      home_address: d.homeAddress,
      office_address: d.officeAddress,
      business_name: d.businessName,
      business_registered:
        d.businessRegistered === undefined ? null : d.businessRegistered === "yes" ? 1 : 0,
      business_registration_date: d.businessRegistered === "yes" ? d.businessRegistrationDate : null,
      loan_amount: d.loanAmount.toFixed(2),
      loan_purpose: d.loanPurpose,
      repayment_months: d.repaymentMonths,
      school_name: d.loanType === "school" ? d.schoolName : null,
      number_of_children: d.loanType === "school" ? d.numberOfChildren : null,
      travel_destination: d.loanType === "travel" ? d.travelDestination : null,
      travel_date: d.loanType === "travel" ? d.travelDate : null,
      travel_purpose: d.loanType === "travel" ? d.travelPurpose : null,
      employer: d.employer,
      monthly_income: money(d.monthlyIncome),
      consent: 1,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("[loan_applications] insert failed:", error);
    return saveFailed(values);
  }

  emailInBackground("loan application", () => notifyLoanApplication(d, reference));

  return {
    status: "success",
    reference,
    message: `Thank you, ${d.firstName}. Your application has been received and a loan officer will contact you within one working day.`,
  };
}

/* ------------------------------------------------------------------ */

export async function submitContactMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToRecord(formData);
  if (isBot(values)) return { status: "success", reference: makeReference("MSG") };

  const { ip, userAgent } = await client();
  if (!(await rateLimit(`contact:${ip}`, 6, TEN_MINUTES))) return throttled(values);

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return invalid(values, fieldErrorsFrom(parsed.error));

  const d = parsed.data;
  const reference = makeReference("MSG");

  try {
    await db.insert(contactMessages).values({
      reference,
      name: d.name,
      email: d.email,
      phone: d.phone,
      topic: d.topic,
      subject: d.subject,
      message: d.message,
      preferred_contact: d.preferredContact,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("[contact_messages] insert failed:", error);
    return saveFailed(values);
  }

  emailInBackground("contact message", () => notifyContactMessage(d, reference));

  return {
    status: "success",
    reference,
    message: `Thanks, ${d.name.split(" ")[0]}. We have your message and will reply by ${
      d.preferredContact === "email" ? "email" : d.preferredContact === "whatsapp" ? "WhatsApp" : "phone"
    } within one working day.`,
  };
}

/* ------------------------------------------------------------------ */

export async function submitFunFoodRegistration(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToRecord(formData);
  if (isBot(values)) return { status: "success", reference: makeReference("FFR") };

  const { ip } = await client();
  if (!(await rateLimit(`ffr:${ip}`, 5, TEN_MINUTES))) return throttled(values);

  const parsed = funFoodRegistrationSchema.safeParse(values);
  if (!parsed.success) return invalid(values, fieldErrorsFrom(parsed.error));

  const d = parsed.data;
  const reference = makeReference("FFR");

  try {
    await db.insert(funFoodRegistrations).values({
      reference,
      surname: d.surname,
      first_name: d.firstName,
      middle_name: d.middleName,
      phone: d.phone,
      email: d.email,
      date_of_birth: d.dateOfBirth,
      home_address: d.homeAddress,
      marital_status: d.maritalStatus,
      number_of_children: d.numberOfChildren,
      employment_type: d.employmentType,
      place_of_work: d.placeOfWork,
      line_of_business: d.lineOfBusiness,
      work_address: d.workAddress,
      ip_address: ip,
    });
  } catch (error) {
    console.error("[fun_food_registrations] insert failed:", error);
    return saveFailed(values);
  }

  emailInBackground("fun food registration", () => notifyFunFoodRegistration(d, reference));

  return {
    status: "success",
    reference,
    message: `You are registered, ${d.firstName}. Participation is by invitation — if you are selected, we will contact you at least 48 hours before the game day.`,
  };
}

/* ------------------------------------------------------------------ */

export async function submitDonation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formDataToRecord(formData);
  if (isBot(values)) return { status: "success", reference: makeReference("DON") };

  const { ip } = await client();
  if (!(await rateLimit(`donation:${ip}`, 5, TEN_MINUTES))) return throttled(values);

  const parsed = donationSchema.safeParse(values);
  if (!parsed.success) return invalid(values, fieldErrorsFrom(parsed.error));

  const d = parsed.data;
  const reference = makeReference("DON");

  try {
    await db.insert(funFoodDonations).values({
      reference,
      name: d.name,
      email: d.email,
      phone: d.phone,
      donation_type: d.donationType,
      amount: d.donationType === "cash" ? money(d.amount) : null,
      food_items: d.donationType === "food" ? d.foodItems : null,
      note: d.note,
      ip_address: ip,
    });
  } catch (error) {
    console.error("[fun_food_donations] insert failed:", error);
    return saveFailed(values);
  }

  emailInBackground("donation", () => notifyDonation(d, reference));

  return {
    status: "success",
    reference,
    message:
      d.donationType === "cash"
        ? `Thank you, ${d.name.split(" ")[0]}. Please transfer your gift to ${funFood.donation.accountName}, ${funFood.donation.bank} ${funFood.donation.accountNumber}, and quote your reference so we can acknowledge it.`
        : `Thank you, ${d.name.split(" ")[0]}. We have your pledge of food items and will be in touch shortly.`,
  };
}

/* ------------------------------------------------------------------ */

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToRecord(formData);
  if (isBot(values)) return { status: "success" };

  const { ip } = await client();
  if (!(await rateLimit(`newsletter:${ip}`, 5, TEN_MINUTES))) return throttled(values);

  const parsed = newsletterSchema.safeParse(values);
  if (!parsed.success) return invalid(values, fieldErrorsFrom(parsed.error));

  const source = (values.source || "website").slice(0, 40);
  let isNew = true;

  try {
    await db.insert(newsletterSubscribers).values({ email: parsed.data.email, source });
  } catch (error) {
    // an existing subscriber is a success from the visitor's point of view
    if (dbErrorCode(error) !== "ER_DUP_ENTRY") {
      console.error("[newsletter_subscribers] insert failed:", error);
      return saveFailed(values);
    }
    isNew = false;
  }

  emailInBackground("newsletter", () => notifyNewsletterSignup(parsed.data.email, source, isNew));

  return { status: "success", message: "You are subscribed. We will only write when there is something worth reading." };
}
