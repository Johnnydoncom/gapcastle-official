"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert, SubmitButton, TextField } from "@/components/forms/fields";
import { Mail } from "@/components/ui/icons";
import { initialActionState } from "@/lib/action-state";
import { forgotPassword } from "../actions";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialActionState);

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="space-y-5">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-azure-500 text-castle-900">
          <Mail className="h-6 w-6" />
        </span>
        <p className="leading-relaxed text-ink/75">{state.message}</p>
        <p className="text-sm leading-relaxed text-ink/60">
          Nothing after a few minutes? Check your spam folder, or ask an administrator to send you a reset link from the Users page.
        </p>
        <Link href="/admin/login" className="inline-flex font-semibold text-castle-600 hover:underline">
          Back to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && !state.fieldErrors && <FormAlert message={state.message} />}
      <TextField
        name="email"
        type="email"
        label="Email address"
        autoComplete="username"
        autoFocus
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Sending…" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}
