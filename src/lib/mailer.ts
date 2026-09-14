import { createHash } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { emailLog } from "@/db/schema";
import { db } from "@/lib/db";
import { openSecret } from "@/lib/secret-box";
import { readSettingsIncludingSecrets } from "@/lib/settings";
import { site } from "@/lib/site";

/*
 * All outgoing email goes through sendMail(). The SMTP server comes from
 * Admin → Settings → Email server; when no host is saved there, the SMTP_*
 * environment variables are used instead. The configuration is read on every
 * send, so a change in the dashboard applies to every server instance at once.
 */

export const SMTP_SECURITY = ["ssl", "starttls", "none"] as const;
export type SmtpSecurity = (typeof SMTP_SECURITY)[number];

export const SMTP_SECURITY_LABELS: Record<SmtpSecurity, string> = {
  ssl: "SSL/TLS",
  starttls: "STARTTLS",
  none: "None (unencrypted)",
};

export type MailConfig = {
  source: "dashboard" | "environment";
  host: string;
  port: number;
  security: SmtpSecurity;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
};

export type MailStatus =
  | { configured: true; config: MailConfig }
  | { configured: false; source: "dashboard" | "environment" | "none"; reason: string };

const isEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
const isSecurity = (value: string): value is SmtpSecurity => (SMTP_SECURITY as readonly string[]).includes(value);

function finish(config: MailConfig): MailStatus {
  if (!config.fromAddress || !isEmail(config.fromAddress)) {
    return {
      configured: false,
      source: config.source,
      reason: "No valid sender address. Add a “Send from” address in Admin → Settings → Email server.",
    };
  }
  return { configured: true, config };
}

/** The SMTP configuration every email uses right now, or why email is off. */
export async function resolveMailConfig(): Promise<MailStatus> {
  const s = await readSettingsIncludingSecrets();
  const fromName = s.mail_from_name.trim() || site.name;

  if (s.smtp_host.trim()) {
    const port = Number(s.smtp_port) || 465;
    const user = s.smtp_user.trim();
    let pass = "";
    if (s.smtp_pass) {
      const opened = openSecret(s.smtp_pass);
      if (opened === null) {
        return {
          configured: false,
          source: "dashboard",
          reason: "The saved SMTP password can no longer be read because the server's encryption key changed. Enter it again in Admin → Settings → Email server.",
        };
      }
      pass = opened;
    }
    if (user && !pass) {
      return { configured: false, source: "dashboard", reason: "An SMTP username is saved without a password." };
    }
    return finish({
      source: "dashboard",
      host: s.smtp_host.trim(),
      port,
      security: isSecurity(s.smtp_security) ? s.smtp_security : port === 465 ? "ssl" : "starttls",
      user,
      pass,
      fromAddress: s.mail_from_address.trim() || user,
      fromName,
    });
  }

  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 465) || 465;
    const user = process.env.SMTP_USER?.trim() ?? "";
    const pass = process.env.SMTP_PASS ?? "";
    if (user && !pass) return { configured: false, source: "environment", reason: "SMTP_USER is set but SMTP_PASS is empty." };
    const secure = process.env.SMTP_SECURE;
    return finish({
      source: "environment",
      host,
      port,
      security: secure === "true" ? "ssl" : secure === "false" ? "starttls" : port === 465 ? "ssl" : "starttls",
      user,
      pass,
      fromAddress: s.mail_from_address.trim() || process.env.MAIL_FROM_ADDRESS?.trim() || user,
      fromName,
    });
  }

  return { configured: false, source: "none", reason: "No email server is set up. Add one in Admin → Settings → Email server." };
}

export function createMailTransport(config: MailConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.security === "ssl",
    requireTLS: config.security === "starttls",
    ignoreTLS: config.security === "none",
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

/** Connects and signs in without sending anything. Returns an error message, or null on success. */
export async function verifyMailConfig(config: MailConfig): Promise<string | null> {
  const transport = createMailTransport(config);
  try {
    await transport.verify();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  } finally {
    transport.close();
  }
}

/* One transporter per server instance, rebuilt whenever the configuration changes. */
const globalForMail = globalThis as unknown as { __gapcastleMailer?: { fingerprint: string; transport: Transporter } };

function transportFor(config: MailConfig) {
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([config.host, config.port, config.security, config.user, config.pass]))
    .digest("hex");
  const cached = globalForMail.__gapcastleMailer;
  if (cached?.fingerprint === fingerprint) return cached.transport;
  cached?.transport.close();
  const transport = createMailTransport(config);
  globalForMail.__gapcastleMailer = { fingerprint, transport };
  return transport;
}

export type OutgoingMail = {
  /** Machine-readable label for the email log, e.g. "loan.team". */
  event: string;
  reference?: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  fromName?: string;
};

export type DeliveryStatus = "sent" | "failed" | "skipped";

/**
 * Sends one email and records the attempt in email_log. Never throws:
 * a mail outage must not undo a submission that is already saved.
 */
export async function sendMail(mail: OutgoingMail): Promise<{ status: DeliveryStatus; error?: string }> {
  const to = (Array.isArray(mail.to) ? mail.to : [mail.to]).map((s) => s.trim()).filter(Boolean);
  const subject = mail.subject.replace(/[\r\n]+/g, " ").slice(0, 250);

  let status: DeliveryStatus;
  let error: string | undefined;

  const resolved = to.length ? await resolveMailConfig() : null;

  if (!resolved) {
    status = "skipped";
    error = "No recipient address";
  } else if (!resolved.configured) {
    status = "skipped";
    error = resolved.reason;
  } else {
    const { config } = resolved;
    try {
      await transportFor(config).sendMail({
        from: { name: mail.fromName || config.fromName, address: config.fromAddress },
        to,
        subject,
        html: mail.html,
        text: mail.text,
        replyTo: mail.replyTo,
      });
      status = "sent";
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : String(err);
      console.error(`[mail] ${mail.event} to ${to.join(", ")} failed:`, error);
    }
  }

  try {
    await db.insert(emailLog).values({
      event: mail.event.slice(0, 60),
      reference: mail.reference ?? null,
      recipient: to.join(", ").slice(0, 500) || "(none)",
      subject,
      status,
      error: error?.slice(0, 1000) ?? null,
    });
  } catch (logError) {
    console.error("[mail] could not write email_log:", logError instanceof Error ? logError.message : logError);
  }

  return { status, error };
}
