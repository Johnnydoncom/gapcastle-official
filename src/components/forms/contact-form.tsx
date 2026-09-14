"use client";

import { useActionState, useState } from "react";
import { submitContactMessage } from "@/app/actions";
import {
  ChoiceCards,
  FormAlert,
  Honeypot,
  SelectField,
  SubmitButton,
  SuccessPanel,
  TextareaField,
  TextField,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";

const topicOptions = [
  { value: "general", label: "General enquiry" },
  { value: "school", label: "School Fee Loan" },
  { value: "travel", label: "Travel Loan" },
  { value: "personal", label: "Personal Loan" },
  { value: "business", label: "Business & SME Loan" },
  { value: "advisory", label: "Business Review & Advisory" },
  { value: "large_financing", label: "Large Business Financing (₦3m+)" },
  { value: "bills", label: "Bill Payments" },
  { value: "fun_food", label: "Fun Food Factory" },
];

/** Remounting on "send another" gives the form a fresh action state. */
export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <ContactFormInner key={attempt} defaultTopic={defaultTopic} onReset={() => setAttempt((n) => n + 1)} />
  );
}

function ContactFormInner({ defaultTopic, onReset }: { defaultTopic?: string; onReset: () => void }) {
  const [state, formAction] = useActionState(submitContactMessage, initialActionState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <SuccessPanel title="Message received" message={state.message} reference={state.reference}>
        <Button variant="outline" onClick={onReset}>
          Send another message
        </Button>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} className="relative grid gap-x-5 gap-y-6 sm:grid-cols-2">
      <Honeypot />

      {state.status === "error" && (
        <div className="sm:col-span-2">
          <FormAlert message={state.message} />
        </div>
      )}

      <TextField
        name="name"
        label="Full name"
        autoComplete="name"
        placeholder="e.g. Adaeze Okafor"
        defaultValue={v.name}
        error={e.name}
      />
      <TextField
        name="email"
        type="email"
        label="Email address"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={v.email}
        error={e.email}
      />
      <TextField
        name="phone"
        type="tel"
        label="Phone number"
        autoComplete="tel"
        placeholder="0803 000 0000"
        defaultValue={v.phone}
        error={e.phone}
      />
      <SelectField
        name="topic"
        label="What do you need help with?"
        options={topicOptions}
        placeholder="Select a service…"
        defaultValue={v.topic ?? defaultTopic ?? ""}
        error={e.topic}
      />
      <TextField
        name="subject"
        label="Subject"
        optional
        placeholder="A few words about your enquiry"
        defaultValue={v.subject}
        error={e.subject}
        className="sm:col-span-2"
      />
      <TextareaField
        name="message"
        label="Your message"
        placeholder="Tell us a little about what you need…"
        rows={5}
        maxLength={3000}
        defaultValue={v.message}
        error={e.message}
        className="sm:col-span-2"
      />
      <ChoiceCards
        name="preferredContact"
        legend="How should we reply?"
        columns={3}
        required
        defaultValue={v.preferredContact ?? "phone"}
        error={e.preferredContact}
        className="sm:col-span-2"
        options={[
          { value: "phone", label: "Phone call" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "email", label: "Email" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-castle-100 pt-6 sm:col-span-2">
        <p className="max-w-xs text-xs leading-relaxed text-ink/60">
          We only use these details to answer your enquiry. See our{" "}
          <a href="/privacy-policy" className="underline underline-offset-2 hover:text-castle-600">
            privacy policy
          </a>
          .
        </p>
        <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
      </div>
    </form>
  );
}
