import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const text = (label: string, max = 160) =>
  z
    .string({ message: `${label} is required.` })
    .trim()
    .min(1, { message: `${label} is required.` })
    .max(max, { message: `${label} must be under ${max} characters.` });

const optionalText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max, { message: `Keep this under ${max} characters.` })
    .optional()
    .transform((v) => (v ? v : undefined));

const email = z
  .string({ message: "Email address is required." })
  .trim()
  .toLowerCase()
  .min(1, { message: "Email address is required." })
  .max(160)
  .email({ message: "Enter a valid email address." });

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address.",
  });

/** Nigerian mobile numbers (0806…, +234806…) or any international +number. */
const phone = z
  .string({ message: "Phone number is required." })
  .trim()
  .min(1, { message: "Phone number is required." })
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .refine((v) => /^(?:(?:\+?234|0)[789][01]\d{8}|\+(?!234)\d{8,15})$/.test(v), {
    message: "Enter a valid phone number, e.g. 0806 446 9668.",
  });

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/[\s().-]/g, "") : undefined))
  .refine((v) => v === undefined || /^(?:(?:\+?234|0)[789][01]\d{8}|\+\d{8,15})$/.test(v), {
    message: "Enter a valid phone number.",
  });

const isoDate = (label: string) =>
  z
    .string({ message: `${label} is required.` })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: `Enter a valid ${label.toLowerCase()}.` })
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: `Enter a valid ${label.toLowerCase()}.` });

const optionalIsoDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), {
    message: "Enter a valid date.",
  });

const ageOnDate = (iso: string) => {
  const dob = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

const adultDateOfBirth = isoDate("Date of birth").refine(
  (v) => {
    const age = ageOnDate(v);
    return age >= 18 && age <= 100;
  },
  { message: "Applicants must be at least 18 years old." },
);

const todayIso = () => new Date().toISOString().slice(0, 10);

const nairaNumber = (v: string) => Number(v.replace(/[₦,\s]/g, ""));

const nairaAmount = (label: string, min: number, max: number) =>
  z
    .string({ message: `${label} is required.` })
    .trim()
    .min(1, { message: `${label} is required.` })
    .transform(nairaNumber)
    .refine((n) => Number.isFinite(n), { message: `Enter ${label.toLowerCase()} as a number.` })
    .refine((n) => n >= min, { message: `The minimum is ₦${min.toLocaleString("en-NG")}.` })
    .refine((n) => n <= max, { message: `The maximum is ₦${max.toLocaleString("en-NG")}.` });

const optionalNaira = (min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? nairaNumber(v) : undefined))
    .refine((n) => n === undefined || (Number.isFinite(n) && n >= min && n <= max), {
      message: `Enter an amount between ₦${min.toLocaleString("en-NG")} and ₦${max.toLocaleString("en-NG")}.`,
    });

const optionalInt = (min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((n) => n === undefined || (Number.isInteger(n) && n >= min && n <= max), {
      message: `Enter a whole number between ${min} and ${max}.`,
    });

const optionalEnum = <const T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v): v is T[number] | undefined => v === undefined || values.includes(v), {
      message: "Choose one of the options.",
    })
    .transform((v) => v as T[number] | undefined);

const consent = z
  .string()
  .optional()
  .refine((v) => v === "on" || v === "true", {
    message: "Please confirm so we can process your request.",
  });

/* ------------------------------------------------------------------ */
/* Loan application                                                    */
/* ------------------------------------------------------------------ */

export const LOAN_TYPES = ["school", "travel", "personal", "business"] as const;
export type LoanType = (typeof LOAN_TYPES)[number];

export const TRAVEL_PURPOSES = ["study", "business", "tourism", "medical", "family", "other"] as const;

export const loanApplicationSchema = z
  .object({
    loanType: z.enum(LOAN_TYPES, { message: "Choose a loan product." }),
    applicationType: z.enum(["individual", "corporate"], {
      message: "Choose whether you are applying as an individual or a company.",
    }),

    surname: text("Surname", 80),
    firstName: text("First name", 80),
    middleName: optionalText(80),
    email,
    phone,
    dateOfBirth: adultDateOfBirth,
    homeAddress: text("Home address", 255),
    officeAddress: optionalText(255),

    businessName: optionalText(160),
    businessRegistered: optionalEnum(["yes", "no"] as const),
    businessRegistrationDate: optionalIsoDate,

    loanAmount: nairaAmount("Loan amount", 10_000, 500_000_000),
    repaymentMonths: optionalInt(1, 36),
    loanPurpose: text("Loan purpose", 600),

    schoolName: optionalText(160),
    numberOfChildren: optionalInt(1, 20),
    travelDestination: optionalText(120),
    travelDate: optionalIsoDate,
    travelPurpose: optionalEnum(TRAVEL_PURPOSES),
    employer: optionalText(160),
    monthlyIncome: optionalNaira(1_000, 1_000_000_000),

    consent,
  })
  .superRefine((d, ctx) => {
    const require = (missing: boolean, path: string, message: string) => {
      if (missing) ctx.addIssue({ code: "custom", path: [path], message });
    };

    if (d.applicationType === "corporate" || d.loanType === "business") {
      require(!d.businessName, "businessName", "Business name is required.");
      require(!d.businessRegistered, "businessRegistered", "Tell us whether the business is registered.");
    }
    if (d.businessRegistered === "yes") {
      require(!d.businessRegistrationDate, "businessRegistrationDate", "Enter the date the business was registered.");
    }
    if (d.businessRegistrationDate && d.businessRegistrationDate > todayIso()) {
      require(true, "businessRegistrationDate", "Registration date cannot be in the future.");
    }

    switch (d.loanType) {
      case "school":
        require(!d.schoolName, "schoolName", "Name of the school is required.");
        require(d.numberOfChildren === undefined, "numberOfChildren", "Tell us how many children the fees cover.");
        break;
      case "travel":
        require(!d.travelDestination, "travelDestination", "Destination is required.");
        require(!d.travelPurpose, "travelPurpose", "Choose the purpose of your trip.");
        if (d.travelDate && d.travelDate < todayIso()) {
          require(true, "travelDate", "Travel date must be today or later.");
        }
        break;
      case "personal":
        require(!d.employer, "employer", "Employer is required for a personal loan.");
        require(d.monthlyIncome === undefined, "monthlyIncome", "Monthly income is required for a personal loan.");
        break;
    }
  });

export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const CONTACT_TOPICS = [
  "general",
  "school",
  "travel",
  "personal",
  "business",
  "advisory",
  "large_financing",
  "bills",
  "fun_food",
] as const;

export const contactSchema = z.object({
  name: text("Your name", 120),
  email,
  phone,
  topic: z.enum(CONTACT_TOPICS, { message: "Choose what your enquiry is about." }),
  subject: optionalText(160),
  message: z
    .string({ message: "Message is required." })
    .trim()
    .min(10, { message: "Tell us a little more — at least 10 characters." })
    .max(3000, { message: "Keep your message under 3,000 characters." }),
  preferredContact: z.enum(["phone", "email", "whatsapp"], {
    message: "Choose how you would like us to reply.",
  }),
});

/* ------------------------------------------------------------------ */
/* Fun Food Factory                                                    */
/* ------------------------------------------------------------------ */

export const funFoodRegistrationSchema = z
  .object({
    surname: text("Surname", 80),
    firstName: text("First name", 80),
    middleName: optionalText(80),
    phone,
    email: optionalEmail,
    dateOfBirth: adultDateOfBirth,
    homeAddress: text("Home address", 255),
    maritalStatus: optionalEnum(["single", "married", "divorced", "widow", "widower"] as const),
    numberOfChildren: optionalInt(0, 20),
    employmentType: optionalEnum(["employee", "self_employed", "unemployed", "student"] as const),
    placeOfWork: optionalText(160),
    lineOfBusiness: optionalText(160),
    workAddress: optionalText(255),
    consent,
  })
  .superRefine((d, ctx) => {
    if (d.employmentType === "employee" || d.employmentType === "self_employed") {
      if (!d.placeOfWork) {
        ctx.addIssue({ code: "custom", path: ["placeOfWork"], message: "Place of work is required." });
      }
      if (!d.lineOfBusiness) {
        ctx.addIssue({ code: "custom", path: ["lineOfBusiness"], message: "Line of business is required." });
      }
    }
  });

export const donationSchema = z
  .object({
    name: text("Your name", 120),
    email,
    phone: optionalPhone,
    donationType: z.enum(["cash", "food"], { message: "Choose a cash gift or food items." }),
    amount: optionalNaira(500, 100_000_000),
    foodItems: optionalText(255),
    note: optionalText(600),
  })
  .superRefine((d, ctx) => {
    if (d.donationType === "cash" && d.amount === undefined) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter the amount you would like to give." });
    }
    if (d.donationType === "food" && !d.foodItems) {
      ctx.addIssue({ code: "custom", path: ["foodItems"], message: "Tell us which food items you will donate." });
    }
  });

export const newsletterSchema = z.object({ email });

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Plain string record from FormData, dropping React's internal $ACTION keys and files. */
export function formDataToRecord(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    out[key] = value;
  }
  return out;
}

/** First message per top-level field. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
