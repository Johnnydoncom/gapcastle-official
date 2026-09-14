"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { contactMessages, funFoodDonations, funFoodRegistrations, loanApplications, users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { clientIp, idFrom, pick, requireAdmin } from "@/lib/admin-guard";
import {
  APPLICATION_STATUSES,
  DONATION_STATUSES,
  MESSAGE_STATUSES,
  REGISTRATION_STATUSES,
} from "@/lib/admin-data";
import { authenticate, createSession, destroySession, sessionConfigured, type AdminUser } from "@/lib/auth";
import { db, dbErrorCode, utcDateTime } from "@/lib/db";
import { renderEmail } from "@/lib/email-templates";
import { SMTP_SECURITY, resolveMailConfig, sendMail, verifyMailConfig, type MailConfig } from "@/lib/mailer";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";
import { RESET_TOKEN_MINUTES, completePasswordReset, requestPasswordReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { openSecret, sealSecret } from "@/lib/secret-box";
import { parseEmailList, readSettingsIncludingSecrets, saveSettings } from "@/lib/settings";
import { fieldErrorsFrom, formDataToRecord } from "@/lib/validation";

const FIX_FIELDS = "Please fix the highlighted fields.";
const FIFTEEN_MINUTES = 15 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Sign in, sign out, password reset                                   */
/* ------------------------------------------------------------------ */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!sessionConfigured()) {
    return { status: "error", message: "Admin sign-in is not configured. Set a SESSION_SECRET of at least 32 characters." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!(await rateLimit(`admin-login:${await clientIp()}`, 5, FIFTEEN_MINUTES))) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again.", values: { email } };
  }

  let user: AdminUser | null;
  try {
    user = await authenticate(email, String(formData.get("password") ?? ""));
  } catch (error) {
    console.error("[admin] sign-in failed:", error);
    return { status: "error", message: "We could not reach the database. Please try again shortly.", values: { email } };
  }

  if (!user) {
    return { status: "error", message: "That email and password combination is not correct.", values: { email } };
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function forgotPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().max(160).safeParse(email).success) {
    return { status: "error", message: FIX_FIELDS, fieldErrors: { email: "Enter a valid email address." }, values: { email } };
  }

  const allowed =
    (await rateLimit(`pw-reset-ip:${await clientIp()}`, 5, FIFTEEN_MINUTES)) &&
    (await rateLimit(`pw-reset-email:${email}`, 3, 60 * 60 * 1000));

  // The lookup and email happen after the response, so timing never reveals whether the account exists.
  if (allowed) {
    after(async () => {
      try {
        await requestPasswordReset(email);
      } catch (error) {
        console.error("[admin] password reset request failed:", error instanceof Error ? error.message : error);
      }
    });
  }

  return {
    status: "success",
    message: `If ${email} belongs to a staff account, a reset link is on its way. It works once and expires in ${RESET_TOKEN_MINUTES} minutes.`,
  };
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!sessionConfigured()) {
    return { status: "error", message: "Admin sign-in is not configured. Set a SESSION_SECRET of at least 32 characters." };
  }
  if (!(await rateLimit(`pw-reset-submit:${await clientIp()}`, 10, FIFTEEN_MINUTES))) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const problem = passwordProblem(password);
  if (problem) return { status: "error", message: FIX_FIELDS, fieldErrors: { password: problem } };
  if (password !== confirm) {
    return { status: "error", message: FIX_FIELDS, fieldErrors: { confirmPassword: "The passwords do not match." } };
  }

  const userId = await completePasswordReset(token, password);
  if (!userId) {
    return { status: "error", message: "This reset link has expired or has already been used. Request a new one." };
  }

  await createSession(userId);
  redirect("/admin?welcome=password-reset");
}

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

export async function updateApplication(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const status = pick(formData.get("status"), APPLICATION_STATUSES);
  if (!id || !status) return;

  const notes = String(formData.get("admin_notes") ?? "").trim().slice(0, 5000);
  await db
    .update(loanApplications)
    .set({ status, admin_notes: notes || null })
    .where(eq(loanApplications.id, id));
  revalidatePath("/admin", "layout");
}

export async function updateMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const status = pick(formData.get("status"), MESSAGE_STATUSES);
  if (!id || !status) return;
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  revalidatePath("/admin", "layout");
}

export async function updateRegistrationStatus(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const status = pick(formData.get("status"), REGISTRATION_STATUSES);
  if (!id || !status) return;
  await db.update(funFoodRegistrations).set({ status }).where(eq(funFoodRegistrations.id, id));
  revalidatePath("/admin", "layout");
}

export async function updateDonationStatus(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const status = pick(formData.get("status"), DONATION_STATUSES);
  if (!id || !status) return;
  await db.update(funFoodDonations).set({ status }).where(eq(funFoodDonations.id, id));
  revalidatePath("/admin", "layout");
}

/* ------------------------------------------------------------------ */
/* Settings & email                                                    */
/* ------------------------------------------------------------------ */

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("admin");
  const values = formDataToRecord(formData);

  const emails = parseEmailList(values.notification_emails ?? "");
  const perPage = Number(values.blog_posts_per_page);

  const fieldErrors: Record<string, string> = {};
  if (!emails.length) fieldErrors.notification_emails = "Add at least one valid email address.";
  if (!Number.isInteger(perPage) || perPage < 3 || perPage > 30) fieldErrors.blog_posts_per_page = "Choose a number from 3 to 30.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: FIX_FIELDS, fieldErrors, values };

  await saveSettings({
    notification_emails: emails.join(", "),
    send_confirmation_emails: values.send_confirmation_emails === "on" ? "1" : "0",
    blog_posts_per_page: String(perPage),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/blog");
  return { status: "success", message: "Settings saved." };
}

export async function sendTestEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin("admin");
  const to = parseEmailList(String(formData.get("to") ?? ""))[0] ?? user.email;

  const mail = await resolveMailConfig();
  if (!mail.configured) return { status: "error", message: mail.reason };
  if (!(await rateLimit(`smtp-send-test:${user.id}`, 5, FIFTEEN_MINUTES))) {
    return { status: "error", message: "Too many test emails. Please wait 15 minutes and try again." };
  }

  const content = renderEmail({
    preheader: "Test email from the Gap Castle website",
    eyebrow: "Test email",
    heading: "Email delivery is working.",
    intro: `${user.name} sent this test from the admin settings. Form notifications, confirmations and password reset links are delivered the same way, through ${mail.config.host}.`,
  });
  const result = await sendMail({ event: "test", to, subject: "Gap Castle website — test email", ...content });

  revalidatePath("/admin/settings", "layout");
  revalidatePath("/admin/email-log");
  return result.status === "sent"
    ? { status: "success", message: `Test email sent to ${to} through ${mail.config.host}.` }
    : { status: "error", message: `Sending failed: ${result.error ?? "unknown error"}` };
}

/* ------------------------------------------------------------------ */
/* Email server (SMTP)                                                 */
/* ------------------------------------------------------------------ */

const HOST_PATTERN = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const isEmail = (value: string) => z.string().email().safeParse(value).success;

const emailServerSchema = z.object({
  smtp_host: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => v === "" || HOST_PATTERN.test(v), { message: "Enter a host name such as smtp.gmail.com." }),
  smtp_port: z.coerce
    .number({ message: "Enter a port number." })
    .int({ message: "Enter a whole number." })
    .min(1, { message: "Use a port from 1 to 65535." })
    .max(65535, { message: "Use a port from 1 to 65535." }),
  smtp_security: z.enum(SMTP_SECURITY, { message: "Choose how the connection is encrypted." }),
  smtp_user: z.string().trim().max(200, { message: "Keep this under 200 characters." }),
  smtp_pass: z.string().max(500, { message: "Keep this under 500 characters." }),
  clear_password: z.string().optional(),
  mail_from_address: z
    .string()
    .trim()
    .toLowerCase()
    .max(160)
    .refine((v) => v === "" || isEmail(v), { message: "Enter a valid email address." }),
  mail_from_name: z
    .string()
    .trim()
    .min(1, { message: "Enter the sender name people will see." })
    .max(80, { message: "Keep this under 80 characters." }),
});

type EmailServerForm =
  | { error: ActionState }
  | { values: Record<string, string>; data: z.infer<typeof emailServerSchema>; config: MailConfig | null };

/** Validates the form and builds the configuration it describes; a blank password means “keep the saved one”. */
async function readEmailServerForm(formData: FormData): Promise<EmailServerForm> {
  const values = formDataToRecord(formData);
  delete values.smtp_pass; // never echo a password back to the browser

  const parsed = emailServerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: { status: "error", message: FIX_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error), values } };
  const d = parsed.data;

  let password = d.smtp_pass;
  if (!password && d.clear_password !== "on") {
    const stored = (await readSettingsIncludingSecrets()).smtp_pass;
    if (stored) {
      const opened = openSecret(stored);
      if (opened === null) {
        return {
          error: {
            status: "error",
            message: FIX_FIELDS,
            fieldErrors: { smtp_pass: "The saved password can no longer be read. Enter it again." },
            values,
          },
        };
      }
      password = opened;
    }
  }

  const fieldErrors: Record<string, string> = {};
  if (d.smtp_host) {
    if (d.smtp_user && !password) fieldErrors.smtp_pass = "Enter the password for this account.";
    if (!d.mail_from_address && !isEmail(d.smtp_user)) {
      fieldErrors.mail_from_address = "Add the address emails are sent from — the username is not an email address.";
    }
  }
  if (Object.keys(fieldErrors).length) return { error: { status: "error", message: FIX_FIELDS, fieldErrors, values } };

  const config: MailConfig | null = d.smtp_host
    ? {
        source: "dashboard",
        host: d.smtp_host,
        port: d.smtp_port,
        security: d.smtp_security,
        user: d.smtp_user,
        pass: password,
        fromAddress: d.mail_from_address || d.smtp_user,
        fromName: d.mail_from_name,
      }
    : null;
  return { values, data: d, config };
}

export async function updateEmailSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("admin");
  const form = await readEmailServerForm(formData);
  if ("error" in form) return form.error;
  const d = form.data;

  let sealedPassword: string | undefined;
  if (d.smtp_pass) {
    try {
      sealedPassword = sealSecret(d.smtp_pass);
    } catch {
      return {
        status: "error",
        message: "Set SESSION_SECRET (32+ characters) on the server before saving an SMTP password.",
        values: form.values,
      };
    }
  }

  await saveSettings({
    smtp_host: d.smtp_host,
    smtp_port: String(d.smtp_port),
    smtp_security: d.smtp_security,
    smtp_user: d.smtp_user,
    mail_from_address: d.mail_from_address,
    mail_from_name: d.mail_from_name,
    ...(sealedPassword ? { smtp_pass: sealedPassword } : d.clear_password === "on" ? { smtp_pass: "" } : {}),
  });

  revalidatePath("/admin", "layout");
  return {
    status: "success",
    message: d.smtp_host
      ? `Email settings saved. Every email the website sends now goes through ${d.smtp_host}:${d.smtp_port}.`
      : "Email settings saved. With no SMTP host, the server's SMTP_* environment variables are used when they are set.",
  };
}

export async function testEmailConnection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin("admin");
  const form = await readEmailServerForm(formData);
  if ("error" in form) return form.error;
  if (!form.config) {
    return { status: "error", message: FIX_FIELDS, fieldErrors: { smtp_host: "Enter the SMTP host to test." }, values: form.values };
  }
  if (!(await rateLimit(`smtp-test:${user.id}`, 10, FIFTEEN_MINUTES))) {
    return { status: "error", message: "Too many connection tests. Please wait 15 minutes and try again.", values: form.values };
  }

  const { host, port, user: account } = form.config;
  const problem = await verifyMailConfig(form.config);
  return problem
    ? { status: "error", message: `Could not connect to ${host}:${port} — ${problem}`, values: form.values }
    : {
        status: "success",
        message: `Connected to ${host}:${port}${account ? ` and signed in as ${account}` : ""}. Save to start using these settings.`,
      };
}

/* ------------------------------------------------------------------ */
/* Your account                                                        */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  name: z.string().trim().min(2, { message: "Enter your name." }).max(120),
  email: z.string().trim().toLowerCase().max(160).email({ message: "Enter a valid email address." }),
  currentPassword: z.string().optional(),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const values = formDataToRecord(formData);
  delete values.currentPassword;

  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: FIX_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error), values };
  const d = parsed.data;

  // Changing the sign-in address is sensitive, so it needs the current password.
  if (d.email !== user.email) {
    if (!(await rateLimit(`admin-password:${user.id}`, 5, FIFTEEN_MINUTES))) {
      return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again.", values };
    }
    const [row] = await db.select({ password: users.password }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !(await verifyPassword(d.currentPassword ?? "", row.password))) {
      return {
        status: "error",
        message: FIX_FIELDS,
        fieldErrors: { currentPassword: "Enter your current password to change your email address." },
        values,
      };
    }
  }

  try {
    await db.update(users).set({ name: d.name, email: d.email }).where(eq(users.id, user.id));
  } catch (error) {
    if (dbErrorCode(error) === "ER_DUP_ENTRY") {
      return { status: "error", message: FIX_FIELDS, fieldErrors: { email: "Another account already uses this email." }, values };
    }
    throw error;
  }

  revalidatePath("/admin", "layout");
  return { status: "success", message: "Your details have been updated." };
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  if (!(await rateLimit(`admin-password:${user.id}`, 5, FIFTEEN_MINUTES))) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const problem = passwordProblem(next);
  if (problem) return { status: "error", message: FIX_FIELDS, fieldErrors: { newPassword: problem } };
  if (next !== confirm) return { status: "error", message: FIX_FIELDS, fieldErrors: { confirmPassword: "The new passwords do not match." } };

  const [row] = await db.select({ password: users.password }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row || !(await verifyPassword(current, row.password))) {
    return { status: "error", message: FIX_FIELDS, fieldErrors: { currentPassword: "That is not your current password." } };
  }

  await db
    .update(users)
    .set({ password: await hashPassword(next), password_changed_at: utcDateTime() })
    .where(eq(users.id, user.id));

  // Every other session is now signed out; keep this one.
  await createSession(user.id);
  return { status: "success", message: "Your password has been updated. Other devices have been signed out." };
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

const newUserSchema = z.object({
  name: z.string().trim().min(2, { message: "Enter a name." }).max(120),
  email: z.string().trim().toLowerCase().max(160).email({ message: "Enter a valid email address." }),
  role: z.enum(["admin", "editor"], { message: "Choose a role." }),
  password: z.string().superRefine((value, ctx) => {
    const problem = passwordProblem(value);
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  }),
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("admin");
  const values = formDataToRecord(formData);
  delete values.password; // never echo a password back to the browser

  const parsed = newUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: FIX_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error), values };
  const d = parsed.data;

  try {
    await db.insert(users).values({ name: d.name, email: d.email, password: await hashPassword(d.password), role: d.role });
  } catch (error) {
    if (dbErrorCode(error) === "ER_DUP_ENTRY") {
      return { status: "error", message: FIX_FIELDS, fieldErrors: { email: "An account with this email already exists." }, values };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return { status: "success", message: `${d.name} can now sign in with ${d.email}.` };
}

/** Role and active state for someone else's account. Nobody can demote or lock out themselves. */
export async function updateUserAccess(formData: FormData) {
  const admin = await requireAdmin("admin");
  const id = idFrom(formData);
  if (!id || id === admin.id) return;

  const role = pick(formData.get("role"), ["admin", "editor"] as const);
  const active = formData.get("active");
  await db
    .update(users)
    .set({
      ...(role ? { role } : {}),
      ...(active === "1" || active === "0" ? { is_active: Number(active) } : {}),
    })
    .where(and(eq(users.id, id), ne(users.id, admin.id)));
  revalidatePath("/admin/users");
}

export async function sendUserResetLink(formData: FormData) {
  await requireAdmin("admin");
  const id = idFrom(formData);
  if (!id) return;

  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1);
  if (user) {
    after(async () => {
      try {
        await requestPasswordReset(user.email);
      } catch (error) {
        console.error("[admin] reset link failed:", error instanceof Error ? error.message : error);
      }
    });
  }
  redirect(`/admin/users?reset=${id}`);
}
