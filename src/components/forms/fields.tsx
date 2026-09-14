"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check, Spinner } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Shared shell: label, optional tag, hint, error                     */
/* ------------------------------------------------------------------ */

type ShellProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (a11y: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
};

function FieldShell({ name, label, hint, error, optional, className, children }: ShellProps) {
  const id = `f-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[14.5px] font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-medium text-ink/60">Optional</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[13px] leading-snug text-ink/60">
          {hint}
        </p>
      )}
      <div className="mt-2">
        {children({
          id,
          ...(error ? { "aria-invalid": true as const } : {}),
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
        })}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-xl border bg-white px-4 text-[15px] text-ink placeholder:text-ink/35 " +
  "transition-[border-color,box-shadow] duration-200 outline-none " +
  "focus:border-castle-500 focus:ring-4 focus:ring-castle-600/12 " +
  "disabled:cursor-not-allowed disabled:bg-castle-50";

const controlState = (error?: string) =>
  error ? "border-red-400 focus:border-red-500 focus:ring-red-500/12" : "border-castle-200 hover:border-castle-300";

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

type BaseField = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

export function TextField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  prefix,
  ...input
}: BaseField & { prefix?: string } & Omit<ComponentProps<"input">, "name" | "id" | "prefix">) {
  return (
    <FieldShell {...{ name, label, hint, error, optional, className }}>
      {(a11y) =>
        prefix ? (
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center font-semibold text-ink/60">
              {prefix}
            </span>
            <input
              name={name}
              required={!optional}
              {...a11y}
              {...input}
              className={cn(control, controlState(error), "h-12 pl-10")}
            />
          </div>
        ) : (
          <input
            name={name}
            required={!optional}
            {...a11y}
            {...input}
            className={cn(control, controlState(error), "h-12")}
          />
        )
      }
    </FieldShell>
  );
}

export function TextareaField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  ...textarea
}: BaseField & Omit<ComponentProps<"textarea">, "name" | "id">) {
  return (
    <FieldShell {...{ name, label, hint, error, optional, className }}>
      {(a11y) => (
        <textarea
          name={name}
          required={!optional}
          rows={4}
          {...a11y}
          {...textarea}
          className={cn(control, controlState(error), "min-h-28 resize-y py-3 leading-relaxed")}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  optional,
  className,
  options,
  placeholder = "Select…",
  ...select
}: BaseField & {
  options: readonly { value: string; label: string }[];
  placeholder?: string;
} & Omit<ComponentProps<"select">, "name" | "id">) {
  return (
    <FieldShell {...{ name, label, hint, error, optional, className }}>
      {(a11y) => (
        <div className="relative">
          <select
            name={name}
            required={!optional}
            {...a11y}
            {...select}
            className={cn(control, controlState(error), "h-12 cursor-pointer appearance-none pr-10")}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-ink/60"
          >
            <path d="m6 9.5 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}

/** Large tappable radio cards — used where the choice changes the rest of the form. */
export function ChoiceCards({
  name,
  legend,
  options,
  value,
  defaultValue,
  onChange,
  error,
  columns = 2,
  required = false,
  className,
}: {
  name: string;
  legend: string;
  options: readonly { value: string; label: string; description?: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  columns?: 2 | 3 | 4;
  required?: boolean;
  className?: string;
}) {
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const latest = useRef(value);
  const controlled = value !== undefined;

  useEffect(() => {
    latest.current = value;
  }, [value]);

  // A form reset — including React's automatic reset after a form action — puts radios back to
  // their initial state. Restore the controlled choice once the reset has run.
  useEffect(() => {
    const form = fieldset.current?.form;
    if (!controlled || !form) return;
    const restore = () =>
      setTimeout(() => {
        fieldset.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
          input.checked = input.value === latest.current;
        });
      });
    form.addEventListener("reset", restore);
    return () => form.removeEventListener("reset", restore);
  }, [controlled]);

  return (
    <fieldset ref={fieldset} className={className} aria-describedby={error ? `f-${name}-error` : undefined}>
      <legend className="text-[14.5px] font-semibold text-ink">{legend}</legend>
      <div
        className={cn(
          "mt-2 grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "group relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-all duration-200",
              "has-[:checked]:border-castle-600 has-[:checked]:bg-castle-50 has-[:checked]:shadow-[0_0_0_3px_rgb(36_46_155_/_0.12)]",
              "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-azure-500/40",
              error ? "border-red-400" : "border-castle-200 hover:border-castle-400",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              required={required}
              className="peer sr-only"
              {...(value !== undefined
                ? { checked: value === o.value, onChange: () => onChange?.(o.value) }
                : { defaultChecked: defaultValue === o.value, onChange: () => onChange?.(o.value) })}
            />
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-castle-300 transition-colors peer-checked:border-castle-600 peer-checked:bg-castle-600">
              <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 group-has-[:checked]:opacity-100" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-ink">{o.label}</span>
              {o.description && (
                <span className="mt-0.5 block text-[13px] leading-snug text-ink/60">{o.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`f-${name}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CheckboxField({
  name,
  children,
  error,
  defaultChecked,
  required = true,
}: {
  name: string;
  children: ReactNode;
  error?: string;
  defaultChecked?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-ink/70">
        <input
          type="checkbox"
          name={name}
          required={required}
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `f-${name}-error` : undefined}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md border-castle-300 accent-castle-600"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`f-${name}-error`} role="alert" className="mt-1.5 ml-8 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen field humans never see; bots fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14.5px] text-red-800"
    >
      <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
        !
      </span>
      <p>{message}</p>
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Sending…",
  className,
  variant = "primary",
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "accent";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant={variant} disabled={pending} className={className} withArrow={!pending}>
      {pending ? (
        <>
          <Spinner className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function SuccessPanel({
  title,
  message,
  reference,
  children,
}: {
  title: string;
  message?: string;
  reference?: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className="rounded-[28px] border border-castle-100 bg-white p-8 text-center shadow-lift lg:p-12">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-azure-500">
        <Check className="h-8 w-8 text-castle-900" />
      </span>
      <h2 className="mt-6 font-display text-3xl font-semibold">{title}</h2>
      {message && <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/65">{message}</p>}
      {reference && (
        <div className="mx-auto mt-7 inline-flex flex-col items-center rounded-2xl border border-dashed border-castle-300 bg-castle-50 px-8 py-4">
          <span className="text-[11px] font-bold tracking-[0.2em] text-castle-600 uppercase">Your reference</span>
          <span className="mt-1 font-mono text-xl font-semibold tracking-wider text-ink">{reference}</span>
        </div>
      )}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
