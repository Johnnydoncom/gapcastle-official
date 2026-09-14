"use client";

import { useActionState, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import {
  changePassword,
  createUser,
  sendTestEmail,
  testEmailConnection,
  updateEmailSettings,
  updateProfile,
  updateSettings,
} from "@/app/(admin)/admin/actions";
import { CheckboxField, ChoiceCards, FormAlert, SubmitButton, TextareaField, TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/icons";
import { initialActionState, type ActionState } from "@/lib/action-state";

function Success({ state }: { state: ActionState }) {
  return state.status === "success" && state.message ? (
    <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
      {state.message}
    </p>
  ) : null;
}

function Feedback({ state }: { state: ActionState }) {
  return (
    <>
      <Success state={state} />
      {state.status === "error" && <FormAlert message={state.message} />}
    </>
  );
}

/* ------------------------------------------------------------------ */

export function NotificationSettingsForm({
  settings,
}: {
  settings: { notification_emails: string; send_confirmation_emails: string; blog_posts_per_page: string };
}) {
  const [state, formAction] = useActionState(updateSettings, initialActionState);
  const v = state.values;
  const e = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <Feedback state={state} />
      <TextareaField
        name="notification_emails"
        label="Send form notifications to"
        hint="Every application, enquiry, registration, donation and sign-up is emailed here. Separate addresses with commas."
        rows={2}
        defaultValue={v?.notification_emails ?? settings.notification_emails}
        error={e.notification_emails}
      />
      <CheckboxField
        name="send_confirmation_emails"
        required={false}
        defaultChecked={v ? v.send_confirmation_emails === "on" : settings.send_confirmation_emails === "1"}
      >
        Send a confirmation email to people who submit a form (when they give an email address)
      </CheckboxField>
      <TextField
        name="blog_posts_per_page"
        type="number"
        min={3}
        max={30}
        label="Blog posts per page"
        defaultValue={v?.blog_posts_per_page ?? settings.blog_posts_per_page}
        error={e.blog_posts_per_page}
        className="sm:max-w-48"
      />
      <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export type EmailServerValues = {
  smtp_host: string;
  smtp_port: string;
  smtp_security: string;
  smtp_user: string;
  mail_from_address: string;
  mail_from_name: string;
};

const DEFAULT_PORTS: Record<string, string> = { ssl: "465", starttls: "587", none: "25" };

export function EmailServerForm({
  initial,
  passwordSaved,
  passwordUnreadable,
  encryptionReady,
}: {
  initial: EmailServerValues;
  passwordSaved: boolean;
  passwordUnreadable: boolean;
  encryptionReady: boolean;
}) {
  const [saveState, saveAction] = useActionState(updateEmailSettings, initialActionState);
  const [testState, testAction] = useActionState(testEmailConnection, initialActionState);
  const [last, setLast] = useState<"save" | "test">("save");
  const [pending, startTransition] = useTransition();

  // The actions are dispatched from onSubmit rather than <form action>, so React does not reset the
  // form afterwards — a reset would snap the encryption radios back to their first value.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "test" ? "test" : "save";
    const formData = new FormData(event.currentTarget);
    setLast(intent);
    startTransition(() => (intent === "test" ? testAction : saveAction)(formData));
  };

  const [values, setValues] = useState(initial);
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);

  const [seenSave, setSeenSave] = useState(saveState);
  if (seenSave !== saveState) {
    setSeenSave(saveState);
    if (saveState.status === "success") {
      setPassword("");
      setClearPassword(false);
    }
  }

  const state = last === "test" ? testState : saveState;
  const e = state.fieldErrors ?? {};
  const hasUsablePassword = passwordSaved && !passwordUnreadable && !clearPassword;
  const set = (key: keyof EmailServerValues) => (event: ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    // method="post" keeps a pre-hydration submit from putting the password in the URL
    <form method="post" onSubmit={submit} className="space-y-6">
      <Feedback state={state} />
      {!encryptionReady && (
        <FormAlert message="SESSION_SECRET is not set on the server, so an SMTP password cannot be stored securely yet." />
      )}

      <div className="grid gap-5 sm:grid-cols-[1fr_7.5rem]">
        <TextField
          name="smtp_host"
          label="SMTP host"
          optional
          placeholder="smtp.yourprovider.com"
          autoComplete="off"
          spellCheck={false}
          value={values.smtp_host}
          onChange={set("smtp_host")}
          error={e.smtp_host}
        />
        <TextField
          name="smtp_port"
          label="Port"
          type="number"
          inputMode="numeric"
          min={1}
          max={65535}
          value={values.smtp_port}
          onChange={set("smtp_port")}
          error={e.smtp_port}
        />
      </div>

      <ChoiceCards
        name="smtp_security"
        legend="Encryption"
        columns={3}
        required
        value={values.smtp_security}
        onChange={(security) =>
          setValues((current) => ({
            ...current,
            smtp_security: security,
            // follow the usual port for the chosen encryption, unless a custom port was typed
            smtp_port: !current.smtp_port || Object.values(DEFAULT_PORTS).includes(current.smtp_port) ? DEFAULT_PORTS[security] : current.smtp_port,
          }))
        }
        error={e.smtp_security}
        options={[
          { value: "ssl", label: "SSL/TLS", description: "Encrypted from the start. Usually port 465." },
          { value: "starttls", label: "STARTTLS", description: "Upgrades to encryption. Usually port 587." },
          { value: "none", label: "None", description: "Unencrypted. Only for trusted local relays." },
        ]}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="smtp_user"
          label="Username"
          optional
          autoComplete="off"
          spellCheck={false}
          placeholder="Often your email address"
          value={values.smtp_user}
          onChange={set("smtp_user")}
          error={e.smtp_user}
        />
        <TextField
          name="smtp_pass"
          type="password"
          label="Password"
          optional
          autoComplete="new-password"
          placeholder={hasUsablePassword ? "•••••••• (saved)" : "App password or SMTP key"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={e.smtp_pass}
        />
      </div>
      <div className="-mt-2 space-y-2 text-[13px] leading-relaxed text-ink/60">
        {passwordUnreadable ? (
          <p className="font-semibold text-red-700">The saved password can no longer be read (the server key changed). Enter it again.</p>
        ) : passwordSaved ? (
          <p>A password is saved and encrypted. Leave the field blank to keep it; it is never shown again.</p>
        ) : (
          <p>The password is encrypted before it is stored and is never shown again.</p>
        )}
        {passwordSaved && (
          <label className="flex cursor-pointer items-center gap-2.5 font-medium text-ink/75">
            <input
              type="checkbox"
              name="clear_password"
              checked={clearPassword}
              onChange={(event) => setClearPassword(event.target.checked)}
              className="h-4 w-4 accent-castle-600"
            />
            Remove the saved password (for servers without sign-in)
          </label>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="mail_from_address"
          type="email"
          label="Send from address"
          optional
          placeholder="Defaults to the username"
          autoComplete="off"
          value={values.mail_from_address}
          onChange={set("mail_from_address")}
          error={e.mail_from_address}
        />
        <TextField name="mail_from_name" label="Sender name" value={values.mail_from_name} onChange={set("mail_from_name")} error={e.mail_from_name} />
      </div>
      <p className="-mt-2 text-[13px] leading-relaxed text-ink/60">
        Most providers only deliver mail sent from an address the account owns. Leave the host empty to fall back to the server&apos;s{" "}
        <code>SMTP_*</code> environment variables.
      </p>

      <div className="flex flex-col gap-3 border-t border-castle-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" name="intent" value="save" size="lg" disabled={pending} withArrow={!pending}>
          {pending && last === "save" ? (
            <>
              <Spinner className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save email settings"
          )}
        </Button>
        <Button type="submit" name="intent" value="test" size="lg" variant="outline" disabled={pending}>
          {pending && last === "test" ? (
            <>
              <Spinner className="h-4 w-4 animate-spin" /> Testing…
            </>
          ) : (
            "Test connection"
          )}
        </Button>
      </div>
    </form>
  );
}

export function TestEmailForm({ defaultTo, disabled = false }: { defaultTo: string; disabled?: boolean }) {
  const [state, formAction] = useActionState(sendTestEmail, initialActionState);
  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />
      <TextField name="to" type="email" label="Send a test to" defaultValue={defaultTo} disabled={disabled} />
      <SubmitButton variant="accent" pendingLabel="Sending…" className="w-full sm:w-auto">
        Send test email
      </SubmitButton>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction] = useActionState(updateProfile, initialActionState);
  const [emailValue, setEmailValue] = useState(state.values?.email ?? email);
  const e = state.fieldErrors ?? {};
  const emailChanged = emailValue.trim().toLowerCase() !== email;

  return (
    <form action={formAction} className="space-y-5">
      <Feedback state={state} />
      <TextField name="name" label="Name" autoComplete="name" defaultValue={state.values?.name ?? name} error={e.name} />
      <TextField
        name="email"
        type="email"
        label="Email address"
        hint="You sign in with this address, and reset links are sent to it."
        autoComplete="email"
        value={emailValue}
        onChange={(event) => setEmailValue(event.target.value)}
        error={e.email}
      />
      {(emailChanged || e.currentPassword) && (
        <TextField
          name="currentPassword"
          type="password"
          label="Current password"
          hint="Needed to change your email address."
          autoComplete="current-password"
          error={e.currentPassword}
        />
      )}
      <SubmitButton pendingLabel="Saving…">Save details</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialActionState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-5">
      <Feedback state={state} />
      <TextField name="currentPassword" type="password" label="Current password" autoComplete="current-password" error={e.currentPassword} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="newPassword" type="password" label="New password" hint="10–72 characters." autoComplete="new-password" error={e.newPassword} />
        <TextField name="confirmPassword" type="password" label="Confirm new password" autoComplete="new-password" error={e.confirmPassword} />
      </div>
      <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function AddUserForm() {
  const [attempt, setAttempt] = useState(0);
  return <AddUserFormInner key={attempt} onDone={() => setAttempt((n) => n + 1)} />;
}

function AddUserFormInner({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createUser, initialActionState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <Success state={state} />
        <button type="button" onClick={onDone} className="text-sm font-semibold text-castle-600 hover:underline">
          Add another person
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && <FormAlert message={state.message} />}
      <TextField name="name" label="Name" defaultValue={v.name} error={e.name} />
      <TextField name="email" type="email" label="Email" autoComplete="off" defaultValue={v.email} error={e.email} />
      <TextField
        name="password"
        type="password"
        label="Temporary password"
        hint="10–72 characters. Share it privately."
        autoComplete="new-password"
        error={e.password}
      />
      <ChoiceCards
        name="role"
        legend="Role"
        required
        columns={2}
        defaultValue={v.role ?? "editor"}
        error={e.role}
        options={[
          { value: "editor", label: "Editor", description: "Submissions and the blog." },
          { value: "admin", label: "Admin", description: "Everything, including users and settings." },
        ]}
      />
      <SubmitButton pendingLabel="Creating…" className="w-full sm:w-auto">
        Create account
      </SubmitButton>
    </form>
  );
}
