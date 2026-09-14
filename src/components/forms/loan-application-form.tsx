"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { submitLoanApplication } from "@/app/actions";
import {
  CheckboxField,
  ChoiceCards,
  FormAlert,
  Honeypot,
  SelectField,
  SubmitButton,
  SuccessPanel,
  TextareaField,
  TextField,
} from "@/components/forms/fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { cn } from "@/lib/cn";
import type { LoanType } from "@/lib/validation";

/* ------------------------------------------------------------------ */

const STEPS = [
  { id: "loan", title: "The loan", blurb: "What you need" },
  { id: "you", title: "About you", blurb: "How to reach you" },
  { id: "review", title: "Review", blurb: "Check & submit" },
] as const;

/** Which step owns each field — used to jump to the right step on a server error. */
const STEP_OF: Record<string, number> = {
  applicationType: 0, businessName: 0, businessRegistered: 0, businessRegistrationDate: 0,
  loanAmount: 0, repaymentMonths: 0, loanPurpose: 0, schoolName: 0, numberOfChildren: 0,
  travelDestination: 0, travelDate: 0, travelPurpose: 0, employer: 0, monthlyIncome: 0,
  surname: 1, firstName: 1, middleName: 1, email: 1, phone: 1, dateOfBirth: 1,
  homeAddress: 1, officeAddress: 1,
  consent: 2,
};

const repaymentOptions = [1, 2, 3, 4, 5, 6, 9, 12, 18, 24].map((m) => ({
  value: String(m),
  label: m === 1 ? "1 month" : `${m} months`,
}));

const childrenOptions = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: i === 0 ? "1 child" : `${i + 1} children`,
}));

const travelPurposeOptions = [
  { value: "study", label: "Study abroad" },
  { value: "business", label: "Business trip" },
  { value: "tourism", label: "Holiday / tourism" },
  { value: "medical", label: "Medical treatment" },
  { value: "family", label: "Visiting family" },
  { value: "other", label: "Something else" },
] as const;

const LABELS: Record<string, string> = {
  applicationType: "Applying as",
  businessName: "Business name",
  businessRegistered: "Business registered",
  businessRegistrationDate: "Registration date",
  schoolName: "School",
  numberOfChildren: "Children covered",
  travelDestination: "Destination",
  travelPurpose: "Purpose of trip",
  travelDate: "Travel date",
  employer: "Employer",
  monthlyIncome: "Monthly income",
  loanAmount: "Loan amount",
  repaymentMonths: "Repayment period",
  loanPurpose: "Purpose",
  surname: "Surname",
  firstName: "First name",
  middleName: "Middle name",
  dateOfBirth: "Date of birth",
  email: "Email",
  phone: "Phone",
  homeAddress: "Home address",
  officeAddress: "Office address",
};

const naira = (raw: string) => {
  const n = Number(raw.replace(/[₦,\s]/g, ""));
  return Number.isFinite(n) && raw.trim() ? `₦${n.toLocaleString("en-NG")}` : raw;
};

function describe(key: string, value: string) {
  if (key === "loanAmount" || key === "monthlyIncome") return naira(value);
  if (key === "applicationType") return value === "corporate" ? "A company / business" : "An individual";
  if (key === "businessRegistered") return value === "yes" ? "Yes" : "No";
  if (key === "repaymentMonths") return `${value} month${value === "1" ? "" : "s"}`;
  if (key === "travelPurpose") return travelPurposeOptions.find((o) => o.value === value)?.label ?? value;
  if (key === "dateOfBirth" || key === "travelDate" || key === "businessRegistrationDate") {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  }
  return value;
}

/* ------------------------------------------------------------------ */

export function LoanApplicationForm({
  loanType,
  productName,
}: {
  loanType: LoanType;
  productName: string;
}) {
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState<[string, string][]>([]);

  const [state, formAction] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await submitLoanApplication(prev, formData);
      if (result.status === "error") {
        const firstField = Object.keys(result.fieldErrors ?? {})[0];
        setStep(firstField !== undefined && firstField in STEP_OF ? STEP_OF[firstField] : STEPS.length - 1);
      }
      return result;
    },
    initialActionState,
  );

  const v = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  const [applicationType, setApplicationType] = useState(
    v.applicationType ?? (loanType === "business" ? "corporate" : "individual"),
  );
  const [registered, setRegistered] = useState(v.businessRegistered ?? "");
  const showBusiness = applicationType === "corporate" || loanType === "business";

  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Bring the step header (or success panel) into view after each server response.
  useEffect(() => {
    if (state.status !== "idle") topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state]);

  const controlsIn = (index: number) =>
    Array.from(
      formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[data-step="${index}"] :is(input, select, textarea)`,
      ) ?? [],
    );

  const firstInvalid = (index: number) => controlsIn(index).find((c) => !c.checkValidity());

  const goTo = (index: number) => {
    if (index === STEPS.length - 1 && formRef.current) {
      const data = new FormData(formRef.current);
      setSummary(
        Object.keys(LABELS)
          .map((k) => [k, String(data.get(k) ?? "").trim()] as [string, string])
          .filter(([, val]) => val !== ""),
      );
    }
    setStep(index);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Intermediate steps: validate what is on screen, then advance.
    if (step < STEPS.length - 1) {
      event.preventDefault();
      const bad = firstInvalid(step);
      if (bad) bad.reportValidity();
      else goTo(step + 1);
      return;
    }
    // Final step: every step must be valid before the action runs.
    for (let i = 0; i < STEPS.length; i++) {
      const bad = firstInvalid(i);
      if (bad) {
        event.preventDefault();
        setStep(i);
        requestAnimationFrame(() => bad.reportValidity());
        return;
      }
    }
  };

  if (state.status === "success") {
    return (
      <div ref={topRef} className="scroll-mt-32">
        <SuccessPanel title="Application received" message={state.message} reference={state.reference}>
          <p className="text-sm text-ink/60">
            Keep this reference handy — quote it when you call or email us about your {productName.toLowerCase()}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" variant="outline">
              Back to home
            </ButtonLink>
            <ButtonLink href="/loans" withArrow>
              Explore other products
            </ButtonLink>
          </div>
        </SuccessPanel>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate={false} className="relative">
      <input type="hidden" name="loanType" value={loanType} />
      <Honeypot />

      {/* ---------- stepper ---------- */}
      <div ref={topRef} className="scroll-mt-32">
        <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Application progress">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && goTo(i)}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "group flex w-full flex-col items-start gap-2 text-left disabled:cursor-default",
                    i < step && "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-full rounded-full transition-colors duration-500",
                      done || current ? "bg-castle-600" : "bg-castle-100",
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                        done && "bg-castle-600 text-white",
                        current && "bg-azure-500 text-castle-900",
                        !done && !current && "bg-castle-100 text-ink/60",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] font-semibold sm:text-sm",
                        current ? "text-ink" : "text-ink/60",
                        done && "group-hover:text-castle-600",
                      )}
                    >
                      {s.title}
                    </span>
                  </span>
                  <span className="hidden pl-8 text-xs text-ink/60 sm:block">{s.blurb}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {state.status === "error" && (
        <div className="mt-8">
          <FormAlert message={state.message} />
        </div>
      )}

      {/* ================= STEP 1 — THE LOAN ================= */}
      <div data-step="0" hidden={step !== 0} className="mt-10 space-y-10">
        <ChoiceCards
          name="applicationType"
          legend="Who is applying?"
          value={applicationType}
          onChange={setApplicationType}
          error={errors.applicationType}
          options={[
            { value: "individual", label: "An individual", description: "Applying in your own name." },
            { value: "corporate", label: "A company or business", description: "Applying on behalf of a business." },
          ]}
        />

        {loanType === "school" && (
          <FormGroup title="About the school">
            <TextField
              name="schoolName"
              label="Name of the school"
              placeholder="e.g. Corona Secondary School, Agbara"
              defaultValue={v.schoolName}
              error={errors.schoolName}
              className="sm:col-span-2"
            />
            <SelectField
              name="numberOfChildren"
              label="Children the fees cover"
              options={childrenOptions}
              defaultValue={v.numberOfChildren}
              error={errors.numberOfChildren}
            />
          </FormGroup>
        )}

        {loanType === "travel" && (
          <FormGroup title="About your trip">
            <TextField
              name="travelDestination"
              label="Destination"
              placeholder="e.g. Toronto, Canada"
              defaultValue={v.travelDestination}
              error={errors.travelDestination}
            />
            <SelectField
              name="travelPurpose"
              label="Purpose of the trip"
              options={travelPurposeOptions}
              defaultValue={v.travelPurpose}
              error={errors.travelPurpose}
            />
            <TextField
              name="travelDate"
              type="date"
              label="Planned travel date"
              hint="An estimate is fine."
              optional
              defaultValue={v.travelDate}
              error={errors.travelDate}
            />
          </FormGroup>
        )}

        {loanType === "personal" && (
          <FormGroup title="About your income">
            <TextField
              name="employer"
              label="Employer"
              placeholder="Where you currently work"
              autoComplete="organization"
              defaultValue={v.employer}
              error={errors.employer}
            />
            <TextField
              name="monthlyIncome"
              label="Monthly take-home pay"
              prefix="₦"
              inputMode="decimal"
              placeholder="250,000"
              defaultValue={v.monthlyIncome}
              error={errors.monthlyIncome}
            />
          </FormGroup>
        )}

        {showBusiness && (
          <FormGroup title="About the business">
            <TextField
              name="businessName"
              label="Business name"
              autoComplete="organization"
              defaultValue={v.businessName}
              error={errors.businessName}
              className="sm:col-span-2"
            />
            <ChoiceCards
              name="businessRegistered"
              legend="Is the business registered with CAC?"
              value={registered}
              onChange={setRegistered}
              required
              error={errors.businessRegistered}
              className="sm:col-span-2"
              options={[
                { value: "yes", label: "Yes, it is registered" },
                { value: "no", label: "Not yet" },
              ]}
            />
            {registered === "yes" && (
              <TextField
                name="businessRegistrationDate"
                type="date"
                label="Date of registration"
                defaultValue={v.businessRegistrationDate}
                error={errors.businessRegistrationDate}
              />
            )}
            {loanType === "business" && (
              <TextField
                name="monthlyIncome"
                label="Average monthly revenue"
                prefix="₦"
                inputMode="decimal"
                placeholder="1,500,000"
                optional
                defaultValue={v.monthlyIncome}
                error={errors.monthlyIncome}
              />
            )}
          </FormGroup>
        )}

        <FormGroup title="The loan">
          <TextField
            name="loanAmount"
            label="How much do you need?"
            prefix="₦"
            inputMode="decimal"
            placeholder={loanType === "business" ? "2,000,000" : "350,000"}
            hint={
              loanType === "business"
                ? "Up to ₦3,000,000 direct. Larger amounts are arranged through our partner lenders."
                : "Minimum ₦10,000."
            }
            defaultValue={v.loanAmount}
            error={errors.loanAmount}
          />
          <SelectField
            name="repaymentMonths"
            label="Preferred repayment period"
            hint="We will confirm what is available."
            optional
            placeholder="No preference"
            options={repaymentOptions}
            defaultValue={v.repaymentMonths}
            error={errors.repaymentMonths}
          />
          <TextareaField
            name="loanPurpose"
            label="What is the loan for?"
            placeholder={
              {
                school: "e.g. First-term fees for two children in JSS2 and SS1.",
                travel: "e.g. Tuition deposit and proof of funds for a Master's programme.",
                personal: "e.g. Annual rent renewal due next month.",
                business: "e.g. Restocking inventory ahead of the festive season.",
              }[loanType]
            }
            maxLength={600}
            defaultValue={v.loanPurpose}
            error={errors.loanPurpose}
            className="sm:col-span-2"
          />
        </FormGroup>
      </div>

      {/* ================= STEP 2 — ABOUT YOU ================= */}
      <div data-step="1" hidden={step !== 1} className="mt-10 space-y-10">
        <FormGroup title="Your details">
          <TextField name="surname" label="Surname" autoComplete="family-name" defaultValue={v.surname} error={errors.surname} />
          <TextField name="firstName" label="First name" autoComplete="given-name" defaultValue={v.firstName} error={errors.firstName} />
          <TextField name="middleName" label="Middle name" optional autoComplete="additional-name" defaultValue={v.middleName} error={errors.middleName} />
          <TextField name="dateOfBirth" type="date" label="Date of birth" hint="You must be 18 or older." defaultValue={v.dateOfBirth} error={errors.dateOfBirth} />
        </FormGroup>

        <FormGroup title="How we reach you">
          <TextField name="email" type="email" label="Email address" autoComplete="email" placeholder="you@example.com" defaultValue={v.email} error={errors.email} />
          <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" placeholder="0806 446 9668" defaultValue={v.phone} error={errors.phone} />
          <TextField name="homeAddress" label="Home address" autoComplete="street-address" defaultValue={v.homeAddress} error={errors.homeAddress} className="sm:col-span-2" />
          <TextField name="officeAddress" label="Office address" optional defaultValue={v.officeAddress} error={errors.officeAddress} className="sm:col-span-2" />
        </FormGroup>
      </div>

      {/* ================= STEP 3 — REVIEW ================= */}
      <div data-step="2" hidden={step !== 2} className="mt-10 space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold">Check your application</h3>
            <button type="button" onClick={() => goTo(0)} className="link-span text-sm font-semibold text-castle-600">
              Edit
            </button>
          </div>
          <p className="mt-2 text-[15px] text-ink/60">
            You are applying for a <strong className="font-semibold text-ink">{productName}</strong>.
          </p>

          {summary.length > 0 && (
            <dl className="mt-6 divide-y divide-castle-100 overflow-hidden rounded-2xl border border-castle-100 bg-castle-50/60">
              {summary.map(([key, value]) => (
                <div key={key} className="grid gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-[13.5px] font-medium text-ink/60">{LABELS[key]}</dt>
                  <dd className="text-[15px] break-words text-ink sm:col-span-2">{describe(key, value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <CheckboxField name="consent" error={errors.consent} defaultChecked={v.consent === "on"}>
          I confirm these details are accurate, and I consent to Gap Castle contacting me and verifying
          this information to assess my application, as described in the{" "}
          <a href="/privacy-policy" target="_blank" className="font-semibold text-castle-600 underline underline-offset-2">
            privacy policy
          </a>
          .
        </CheckboxField>
      </div>

      {/* ---------- navigation ---------- */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-castle-100 pt-8">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => goTo(step - 1)}>
            Back
          </Button>
        ) : (
          <span className="text-sm text-ink/60">Takes about 5 minutes</span>
        )}

        {step < STEPS.length - 1 ? (
          <Button type="submit" size="lg" withArrow>
            Continue
          </Button>
        ) : (
          <SubmitButton pendingLabel="Submitting…">Submit application</SubmitButton>
        )}
      </div>
    </form>
  );
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-5 flex w-full items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">
        {title}
        <span aria-hidden className="h-px flex-1 bg-castle-100" />
      </legend>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
