"use client";

import { useActionState, useState } from "react";
import { submitDonation, submitFunFoodRegistration, subscribeNewsletter } from "@/app/actions";
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
import { Check } from "@/components/ui/icons";
import { initialActionState } from "@/lib/action-state";

const maritalOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widow", label: "Widow" },
  { value: "widower", label: "Widower" },
];

const childrenOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? "None" : i === 10 ? "10 or more" : String(i),
}));

/* ------------------------------------------------------------------ */

export function FunFoodRegistrationForm() {
  const [state, formAction] = useActionState(submitFunFoodRegistration, initialActionState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const [employment, setEmployment] = useState(v.employmentType ?? "");
  const working = employment === "employee" || employment === "self_employed";

  if (state.status === "success") {
    return <SuccessPanel title="You are registered" message={state.message} reference={state.reference} />;
  }

  return (
    <form action={formAction} className="relative space-y-10">
      <Honeypot />
      {state.status === "error" && <FormAlert message={state.message} />}

      <Group title="About you">
        <TextField name="surname" label="Surname" autoComplete="family-name" defaultValue={v.surname} error={e.surname} />
        <TextField name="firstName" label="First name" autoComplete="given-name" defaultValue={v.firstName} error={e.firstName} />
        <TextField name="middleName" label="Middle name" optional defaultValue={v.middleName} error={e.middleName} />
        <TextField name="dateOfBirth" type="date" label="Date of birth" hint="Participants must be 18 or older." defaultValue={v.dateOfBirth} error={e.dateOfBirth} />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" placeholder="0806 446 9668" defaultValue={v.phone} error={e.phone} />
        <TextField name="email" type="email" label="Email address" optional autoComplete="email" defaultValue={v.email} error={e.email} />
        <TextField name="homeAddress" label="Home address" autoComplete="street-address" defaultValue={v.homeAddress} error={e.homeAddress} className="sm:col-span-2" />
      </Group>

      <Group title="Your household">
        <SelectField name="maritalStatus" label="Marital status" optional placeholder="Prefer not to say" options={maritalOptions} defaultValue={v.maritalStatus} error={e.maritalStatus} />
        <SelectField name="numberOfChildren" label="Number of children" optional placeholder="Prefer not to say" options={childrenOptions} defaultValue={v.numberOfChildren} error={e.numberOfChildren} />
      </Group>

      <Group title="Work">
        <ChoiceCards
          name="employmentType"
          legend="What best describes you?"
          columns={4}
          value={employment}
          onChange={setEmployment}
          error={e.employmentType}
          className="sm:col-span-2"
          options={[
            { value: "employee", label: "Employed" },
            { value: "self_employed", label: "Self-employed" },
            { value: "student", label: "Student" },
            { value: "unemployed", label: "Not working" },
          ]}
        />
        {working && (
          <>
            <TextField name="placeOfWork" label={employment === "employee" ? "Employer" : "Business name"} defaultValue={v.placeOfWork} error={e.placeOfWork} />
            <TextField name="lineOfBusiness" label="Line of work" placeholder="e.g. Retail, teaching, tailoring" defaultValue={v.lineOfBusiness} error={e.lineOfBusiness} />
            <TextField name="workAddress" label="Work address" optional defaultValue={v.workAddress} error={e.workAddress} className="sm:col-span-2" />
          </>
        )}
      </Group>

      <CheckboxField name="consent" error={e.consent} defaultChecked={v.consent === "on"}>
        I am 18 or older and I agree to the{" "}
        <a href="#terms" className="font-semibold text-castle-600 underline underline-offset-2">
          Fun Food Factory terms &amp; conditions
        </a>
        , including consent to photos and video of my participation being published. Gap Castle may contact me
        about game days and store these details as described in the{" "}
        <a href="/privacy-policy" target="_blank" className="font-semibold text-castle-600 underline underline-offset-2">
          privacy policy
        </a>
        .
      </CheckboxField>

      <div className="border-t border-castle-100 pt-7">
        <SubmitButton pendingLabel="Registering…">Register for free</SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function DonationForm() {
  const [state, formAction] = useActionState(submitDonation, initialActionState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const [kind, setKind] = useState(v.donationType ?? "cash");

  if (state.status === "success") {
    return <SuccessPanel title="Thank you" message={state.message} reference={state.reference} />;
  }

  return (
    <form action={formAction} className="relative grid gap-x-5 gap-y-6 sm:grid-cols-2">
      <Honeypot />
      {state.status === "error" && (
        <div className="sm:col-span-2">
          <FormAlert message={state.message} />
        </div>
      )}

      <ChoiceCards
        name="donationType"
        legend="Item for donation"
        value={kind}
        onChange={setKind}
        required
        error={e.donationType}
        className="sm:col-span-2"
        options={[
          { value: "cash", label: "Cash gift", description: "Transfer to the Wema Bank account shown." },
          { value: "food", label: "Food items", description: "Tell us what you have — we will be in touch." },
        ]}
      />

      {kind === "cash" ? (
        <TextField name="amount" label="Amount" prefix="₦" inputMode="decimal" placeholder="10,000" defaultValue={v.amount} error={e.amount} className="sm:col-span-2" />
      ) : (
        <TextField name="foodItems" label="Food items" placeholder="e.g. 2 bags of rice, 5 litres of vegetable oil" defaultValue={v.foodItems} error={e.foodItems} className="sm:col-span-2" />
      )}

      <TextField name="name" label="Your name" autoComplete="name" defaultValue={v.name} error={e.name} />
      <TextField name="email" type="email" label="Email address" autoComplete="email" defaultValue={v.email} error={e.email} />
      <TextField name="phone" type="tel" label="Phone number" optional autoComplete="tel" defaultValue={v.phone} error={e.phone} />
      <TextareaField name="note" label="A note for the team" optional rows={2} maxLength={600} defaultValue={v.note} error={e.note} className="sm:col-span-2" />

      <div className="border-t border-castle-100 pt-6 sm:col-span-2">
        <SubmitButton variant="accent" pendingLabel="Sending…">
          Pledge my donation
        </SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function NewsletterForm({ source }: { source: string }) {
  const [state, formAction] = useActionState(subscribeNewsletter, initialActionState);

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-3 font-semibold text-castle-700">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-500">
          <Check className="h-4 w-4 text-castle-900" />
        </span>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="relative w-full max-w-lg">
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className="h-13 flex-1 rounded-full border border-castle-200 bg-white px-6 text-[15px] outline-none transition-shadow focus:border-castle-500 focus:ring-4 focus:ring-castle-600/12"
        />
        <SubmitButton pendingLabel="Saving…">Notify me</SubmitButton>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-2 pl-6 text-[13px] font-medium text-red-700">
          {state.fieldErrors?.email ?? state.message}
        </p>
      )}
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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
