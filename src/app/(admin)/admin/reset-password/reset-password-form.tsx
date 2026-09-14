"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert, SubmitButton, TextField } from "@/components/forms/fields";
import { initialActionState } from "@/lib/action-state";
import { resetPassword } from "../actions";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, formAction] = useActionState(resetPassword, initialActionState);
  const e = state.fieldErrors ?? {};
  const expired = state.status === "error" && !state.fieldErrors;

  return (
    <form action={formAction} className="space-y-6">
      {expired && (
        <div className="space-y-3">
          <FormAlert message={state.message} />
          <Link href="/admin/forgot-password" className="inline-flex text-sm font-semibold text-castle-600 hover:underline">
            Request a new link →
          </Link>
        </div>
      )}
      <input type="hidden" name="token" value={token} />
      {/* lets password managers attach the new password to the right account */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <TextField
        name="password"
        type="password"
        label="New password"
        hint="10–72 characters. A short phrase is easier to remember and harder to guess."
        autoComplete="new-password"
        autoFocus
        error={e.password}
      />
      <TextField name="confirmPassword" type="password" label="Confirm new password" autoComplete="new-password" error={e.confirmPassword} />
      <SubmitButton pendingLabel="Saving…" className="w-full">
        Save and sign in
      </SubmitButton>
    </form>
  );
}
