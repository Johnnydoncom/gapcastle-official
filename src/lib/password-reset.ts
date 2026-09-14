import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, ne } from "drizzle-orm";
import { passwordResetTokens, users } from "@/db/schema";
import { db, parseUtcDateTime, utcDateTime } from "@/lib/db";
import { renderEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { hashPassword } from "@/lib/password";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";

/*
 * Password reset: a random 256-bit token is emailed as a link; only its SHA-256
 * is stored, so a leaked database cannot be used to reset anyone's password.
 * Links expire after an hour and work once.
 */

export const RESET_TOKEN_MINUTES = 60;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Links always point at APP_URL — never at the request's Host header, which an
 * attacker can set to their own domain to capture the token.
 */
export function publicAppUrl() {
  return (process.env.APP_URL || site.url).replace(/\/$/, "");
}

/** Emails a reset link when the address belongs to an active account. Silent otherwise. */
export async function requestPasswordReset(email: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.email, email.trim().toLowerCase()), eq(users.is_active, 1)))
    .limit(1);
  if (!user) return;

  const token = randomBytes(32).toString("base64url");
  // one live link per person: requesting again replaces the previous one
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.user_id, user.id));
  await db.insert(passwordResetTokens).values({
    user_id: user.id,
    token_hash: hashToken(token),
    expires_at: utcDateTime(new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000)),
  });

  const link = `${publicAppUrl()}/admin/reset-password?token=${token}`;
  const { mail_from_name } = await getSettings();
  const content = renderEmail({
    preheader: "Reset your Gap Castle admin password.",
    eyebrow: "Password reset",
    heading: `Reset your password, ${user.name.split(/\s+/)[0]}.`,
    intro: `Someone asked to reset the password for the Gap Castle admin account ${user.email}. The link works once and expires in ${RESET_TOKEN_MINUTES} minutes.`,
    cta: { label: "Choose a new password", href: link },
    note: "If you did not ask for this, ignore this email — your password stays the same.",
  });

  await sendMail({
    event: "auth.password_reset",
    to: user.email,
    subject: "Reset your Gap Castle admin password",
    fromName: mail_from_name || site.name,
    ...content,
  });
}

/** The account a reset token belongs to, when the token is unused and unexpired. */
export async function findResetToken(token: string) {
  if (!/^[\w-]{40,64}$/.test(token)) return null;

  const [row] = await db
    .select({
      id: passwordResetTokens.id,
      user_id: passwordResetTokens.user_id,
      expires_at: passwordResetTokens.expires_at,
      email: users.email,
      name: users.name,
    })
    .from(passwordResetTokens)
    .innerJoin(users, eq(passwordResetTokens.user_id, users.id))
    .where(
      and(eq(passwordResetTokens.token_hash, hashToken(token)), isNull(passwordResetTokens.used_at), eq(users.is_active, 1)),
    )
    .limit(1);

  if (!row || parseUtcDateTime(row.expires_at) <= Date.now()) return null;
  return row;
}

/** Sets the new password and burns the token. Returns the user id, or null if the token is no longer valid. */
export async function completePasswordReset(token: string, newPassword: string): Promise<number | null> {
  const found = await findResetToken(token);
  if (!found) return null;

  const password = await hashPassword(newPassword);
  const now = utcDateTime();

  return db.transaction(async (tx) => {
    // Claim the token first; a second request racing this one updates nothing and stops.
    const [claim] = await tx
      .update(passwordResetTokens)
      .set({ used_at: now })
      .where(and(eq(passwordResetTokens.id, found.id), isNull(passwordResetTokens.used_at)));
    if (claim.affectedRows !== 1) return null;

    await tx.update(users).set({ password, password_changed_at: now }).where(eq(users.id, found.user_id));
    await tx
      .delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.user_id, found.user_id), ne(passwordResetTokens.id, found.id)));
    return found.user_id;
  });
}
