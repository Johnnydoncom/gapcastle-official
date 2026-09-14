import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { users } from "@/db/schema";
import { db, parseUtcDateTime } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";

/*
 * Staff sessions: an httpOnly cookie carrying `<userId>.<issuedAt>.<expiry>`
 * signed with SESSION_SECRET. The user row is re-read on every request, so
 * deactivating an account takes effect immediately, and a password change or
 * reset signs out every session issued before it.
 */

const COOKIE = "gc_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminRole = "admin" | "editor";
export type AdminUser = { id: number; name: string; email: string; role: AdminRole };

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const sessionConfigured = () => secret() !== null;

/** Returns the user for a correct email/password pair, otherwise null. */
export async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      password: users.password,
      is_active: users.is_active,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  // Always run the hash so a missing account takes as long as a wrong password.
  const valid = await verifyPassword(password, user?.password ?? DUMMY_HASH);
  if (!user || !valid || !user.is_active) return null;

  await db.update(users).set({ last_login_at: sql`NOW()` }).where(eq(users.id, user.id));
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function createSession(userId: number) {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  const now = Date.now();
  const payload = `${userId}.${now}.${now + MAX_AGE_SECONDS * 1000}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

async function readSession(): Promise<{ userId: number; issuedAt: number } | null> {
  const key = secret();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!key || !raw) return null;

  const cut = raw.lastIndexOf(".");
  if (cut < 0) return null;
  const payload = raw.slice(0, cut);
  if (!safeEqual(raw.slice(cut + 1), sign(payload, key))) return null;

  const [userId, issuedAt, expires] = payload.split(".").map(Number);
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isFinite(issuedAt) || !(expires > Date.now())) return null;
  return { userId, issuedAt };
}

/** The signed-in, active staff member for this request, or null. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        password_changed_at: users.password_changed_at,
      })
      .from(users)
      .where(and(eq(users.id, session.userId), eq(users.is_active, 1)))
      .limit(1);
    if (!user) return null;

    // Compare whole seconds: DATETIME has no fractional part.
    if (user.password_changed_at && Math.floor(session.issuedAt / 1000) * 1000 < parseUtcDateTime(user.password_changed_at)) {
      return null;
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch (error) {
    console.error("[auth] session lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
});

export async function isAuthenticated() {
  return (await getCurrentAdmin()) !== null;
}
