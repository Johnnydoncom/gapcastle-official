import { and, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import {
  contactMessages,
  emailLog,
  funFoodDonations,
  funFoodRegistrations,
  loanApplications,
  newsletterSubscribers,
  posts,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";
import { LOAN_TYPES, type LoanType } from "@/lib/validation";

export const APPLICATION_STATUSES = ["new", "reviewing", "approved", "declined", "disbursed"] as const;
export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;
export const REGISTRATION_STATUSES = ["registered", "confirmed", "attended", "cancelled"] as const;
export const DONATION_STATUSES = ["pledged", "received", "acknowledged"] as const;

export const PER_PAGE = 20;

const includes = <T extends readonly string[]>(list: T, value: string | undefined): value is T[number] =>
  value !== undefined && (list as readonly string[]).includes(value);

const pageClamp = (page: number) => (Number.isInteger(page) && page > 0 ? page : 1);

/* ------------------------------------------------------------------ */

export async function dashboardSummary() {
  const [byType, byStatus, [newMessages], [registrations], [donations], recent, postCounts, [subscribers]] = await Promise.all([
    db
      .select({
        loan_type: loanApplications.loan_type,
        n: count(),
        total: sql<string>`COALESCE(SUM(${loanApplications.loan_amount}), 0)`,
      })
      .from(loanApplications)
      .groupBy(loanApplications.loan_type),
    db.select({ status: loanApplications.status, n: count() }).from(loanApplications).groupBy(loanApplications.status),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ n: count() }).from(funFoodRegistrations),
    db
      .select({ n: count(), total: sql<string>`COALESCE(SUM(${funFoodDonations.amount}), 0)` })
      .from(funFoodDonations),
    db.select().from(loanApplications).orderBy(desc(loanApplications.created_at)).limit(6),
    db.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status),
    db.select({ n: count() }).from(newsletterSubscribers),
  ]);

  return {
    byType,
    byStatus,
    newMessages: newMessages?.n ?? 0,
    registrations: registrations?.n ?? 0,
    donations: { count: donations?.n ?? 0, total: Number(donations?.total ?? 0) },
    recent,
    posts: {
      published: postCounts.find((r) => r.status === "published")?.n ?? 0,
      draft: postCounts.find((r) => r.status === "draft")?.n ?? 0,
    },
    subscribers: subscribers?.n ?? 0,
  };
}

export async function listApplications(filters: { type?: string; status?: string; q?: string; page?: number }) {
  const conditions: SQL[] = [];
  if (includes(LOAN_TYPES, filters.type)) conditions.push(eq(loanApplications.loan_type, filters.type as LoanType));
  if (includes(APPLICATION_STATUSES, filters.status)) conditions.push(eq(loanApplications.status, filters.status));
  if (filters.q) {
    const pattern = `%${filters.q.slice(0, 80)}%`;
    const match = or(
      like(loanApplications.reference, pattern),
      like(loanApplications.email, pattern),
      like(loanApplications.phone, pattern),
      like(sql`CONCAT(${loanApplications.first_name}, ' ', ${loanApplications.surname})`, pattern),
    );
    if (match) conditions.push(match);
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(loanApplications)
      .where(where)
      .orderBy(desc(loanApplications.created_at))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(loanApplications).where(where),
  ]);

  return { rows, total: total?.n ?? 0, page };
}

export async function getApplication(id: number) {
  const [row] = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).limit(1);
  return row ?? null;
}

export async function listMessages(filters: { status?: string; page?: number }) {
  const where = includes(MESSAGE_STATUSES, filters.status) ? eq(contactMessages.status, filters.status) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(contactMessages)
      .where(where)
      .orderBy(desc(contactMessages.created_at))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(contactMessages).where(where),
  ]);

  return { rows, total: total?.n ?? 0, page };
}

export async function listRegistrations(filters: { status?: string; q?: string; page?: number }) {
  const conditions: SQL[] = [];
  if (includes(REGISTRATION_STATUSES, filters.status)) conditions.push(eq(funFoodRegistrations.status, filters.status));
  if (filters.q) {
    const pattern = `%${filters.q.slice(0, 80)}%`;
    const match = or(
      like(funFoodRegistrations.reference, pattern),
      like(funFoodRegistrations.phone, pattern),
      like(funFoodRegistrations.email, pattern),
      like(sql`CONCAT(${funFoodRegistrations.first_name}, ' ', ${funFoodRegistrations.surname})`, pattern),
    );
    if (match) conditions.push(match);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(funFoodRegistrations)
      .where(where)
      .orderBy(desc(funFoodRegistrations.created_at))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(funFoodRegistrations).where(where),
  ]);
  return { rows, total: total?.n ?? 0, page };
}

export async function listDonations(filters: { status?: string; page?: number }) {
  const where = includes(DONATION_STATUSES, filters.status) ? eq(funFoodDonations.status, filters.status) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total], [cash]] = await Promise.all([
    db
      .select()
      .from(funFoodDonations)
      .where(where)
      .orderBy(desc(funFoodDonations.created_at))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(funFoodDonations).where(where),
    db.select({ total: sql<string>`COALESCE(SUM(${funFoodDonations.amount}), 0)` }).from(funFoodDonations).where(where),
  ]);
  return { rows, total: total?.n ?? 0, page, cashTotal: Number(cash?.total ?? 0) };
}

export async function listSubscribers(filters: { q?: string; page?: number }) {
  const where = filters.q ? like(newsletterSubscribers.email, `%${filters.q.slice(0, 80)}%`) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total], bySource] = await Promise.all([
    db
      .select()
      .from(newsletterSubscribers)
      .where(where)
      .orderBy(desc(newsletterSubscribers.created_at))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(newsletterSubscribers).where(where),
    db
      .select({ source: newsletterSubscribers.source, n: count() })
      .from(newsletterSubscribers)
      .groupBy(newsletterSubscribers.source),
  ]);
  return { rows, total: total?.n ?? 0, page, bySource };
}

export const EMAIL_STATUSES = ["sent", "failed", "skipped"] as const;

export async function listEmailLog(filters: { status?: string; page?: number }) {
  const where = includes(EMAIL_STATUSES, filters.status) ? eq(emailLog.status, filters.status) : undefined;
  const page = pageClamp(filters.page ?? 1);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(emailLog)
      .where(where)
      .orderBy(desc(emailLog.created_at), desc(emailLog.id))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(emailLog).where(where),
  ]);
  return { rows, total: total?.n ?? 0, page };
}

export async function listUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      last_login_at: users.last_login_at,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(users.created_at, users.id);
}

/** Small numbers shown beside sidebar links. Never throws. */
export async function navCounts() {
  try {
    const [[applications], [messages], [registrations]] = await Promise.all([
      db.select({ n: count() }).from(loanApplications).where(eq(loanApplications.status, "new")),
      db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
      db.select({ n: count() }).from(funFoodRegistrations).where(eq(funFoodRegistrations.status, "registered")),
    ]);
    return { applications: applications?.n ?? 0, messages: messages?.n ?? 0, registrations: registrations?.n ?? 0 };
  } catch {
    return { applications: 0, messages: 0, registrations: 0 };
  }
}
