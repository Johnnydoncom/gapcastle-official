"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert, SubmitButton, TextField } from "@/components/forms/fields";
import { initialActionState } from "@/lib/action-state";
import { login } from "../actions";

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialActionState);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && <FormAlert message={state.message} />}
      <TextField
        name="email"
        type="email"
        label="Email address"
        autoComplete="username"
        autoFocus
        defaultValue={state.values?.email}
      />
      <div>
        <TextField name="password" type="password" label="Password" autoComplete="current-password" />
        <p className="mt-2 text-right">
          <Link href="/admin/forgot-password" className="text-sm font-semibold text-castle-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
