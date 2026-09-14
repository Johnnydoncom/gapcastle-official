import {
  char,
  customType,
  date,
  datetime,
  decimal,
  index,
  int,
  mediumtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/*
 * Gap Castle database schema (MySQL 8 / MariaDB 10.4+).
 * Change this file, then `npm run db:generate` and `npm run db:migrate`.
 *
 * Property names match column names (snake_case) so rows read the same in SQL
 * and in code. Nullable timestamps use DATETIME: MariaDB can silently give a
 * TIMESTAMP column an automatic default and ON UPDATE clause. DATETIME values
 * the application compares (expiries, password changes) are written in UTC.
 */

const id = () => int("id", { unsigned: true }).autoincrement().primaryKey();
const createdAt = () => timestamp("created_at", { mode: "string" }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow();
const foreignId = (name: string) => int(name, { unsigned: true });

const mediumblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "mediumblob",
});

/* ------------------------------------------------------------------ */
/* Staff & configuration                                               */
/* ------------------------------------------------------------------ */

export const users = mysqlTable(
  "users",
  {
    id: id(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    /** bcrypt hash — never the plain password. */
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "editor"]).notNull().default("editor"),
    is_active: tinyint("is_active").notNull().default(1),
    last_login_at: datetime("last_login_at", { mode: "string" }),
    /** UTC. Sessions issued before this moment are rejected. */
    password_changed_at: datetime("password_changed_at", { mode: "string" }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [uniqueIndex("uq_users_email").on(t.email)],
);

/** Single-use password reset links. Only a SHA-256 of the token is stored. */
export const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    id: id(),
    user_id: foreignId("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token_hash: char("token_hash", { length: 64 }).notNull(),
    /** UTC */
    expires_at: datetime("expires_at", { mode: "string" }).notNull(),
    used_at: datetime("used_at", { mode: "string" }),
    created_at: createdAt(),
  },
  (t) => [uniqueIndex("uq_reset_token_hash").on(t.token_hash), index("idx_reset_user").on(t.user_id)],
);

export const siteSettings = mysqlTable("settings", {
  setting_key: varchar("setting_key", { length: 100 }).primaryKey(),
  setting_value: text("setting_value"),
  updated_at: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Website submissions                                                 */
/* ------------------------------------------------------------------ */

export const loanApplications = mysqlTable(
  "loan_applications",
  {
    id: id(),
    reference: varchar("reference", { length: 20 }).notNull(),
    loan_type: mysqlEnum("loan_type", ["school", "travel", "personal", "business"]).notNull(),
    application_type: mysqlEnum("application_type", ["individual", "corporate"]).notNull().default("individual"),

    surname: varchar("surname", { length: 80 }).notNull(),
    first_name: varchar("first_name", { length: 80 }).notNull(),
    middle_name: varchar("middle_name", { length: 80 }),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    date_of_birth: date("date_of_birth", { mode: "string" }).notNull(),
    home_address: varchar("home_address", { length: 255 }).notNull(),
    office_address: varchar("office_address", { length: 255 }),

    business_name: varchar("business_name", { length: 160 }),
    business_registered: tinyint("business_registered"),
    business_registration_date: date("business_registration_date", { mode: "string" }),

    loan_amount: decimal("loan_amount", { precision: 14, scale: 2 }).notNull(),
    loan_purpose: varchar("loan_purpose", { length: 600 }).notNull(),
    repayment_months: tinyint("repayment_months", { unsigned: true }),

    school_name: varchar("school_name", { length: 160 }),
    number_of_children: tinyint("number_of_children", { unsigned: true }),
    travel_destination: varchar("travel_destination", { length: 120 }),
    travel_date: date("travel_date", { mode: "string" }),
    travel_purpose: mysqlEnum("travel_purpose", ["study", "business", "tourism", "medical", "family", "other"]),
    employer: varchar("employer", { length: 160 }),
    monthly_income: decimal("monthly_income", { precision: 14, scale: 2 }),

    status: mysqlEnum("status", ["new", "reviewing", "approved", "declined", "disbursed"]).notNull().default("new"),
    admin_notes: text("admin_notes"),
    consent: tinyint("consent").notNull().default(0),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 255 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    uniqueIndex("uq_loan_reference").on(t.reference),
    index("idx_loan_type").on(t.loan_type),
    index("idx_loan_status").on(t.status),
    index("idx_loan_created").on(t.created_at),
    index("idx_loan_email").on(t.email),
  ],
);

export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: id(),
    reference: varchar("reference", { length: 20 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    topic: mysqlEnum("topic", [
      "general",
      "school",
      "travel",
      "personal",
      "business",
      "advisory",
      "large_financing",
      "bills",
      "fun_food",
    ])
      .notNull()
      .default("general"),
    subject: varchar("subject", { length: 160 }),
    message: text("message").notNull(),
    preferred_contact: mysqlEnum("preferred_contact", ["phone", "email", "whatsapp"]).notNull().default("phone"),
    status: mysqlEnum("status", ["new", "read", "replied", "archived"]).notNull().default("new"),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 255 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    uniqueIndex("uq_contact_reference").on(t.reference),
    index("idx_contact_status").on(t.status),
    index("idx_contact_created").on(t.created_at),
  ],
);

export const funFoodRegistrations = mysqlTable(
  "fun_food_registrations",
  {
    id: id(),
    reference: varchar("reference", { length: 20 }).notNull(),
    surname: varchar("surname", { length: 80 }).notNull(),
    first_name: varchar("first_name", { length: 80 }).notNull(),
    middle_name: varchar("middle_name", { length: 80 }),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 160 }),
    date_of_birth: date("date_of_birth", { mode: "string" }).notNull(),
    home_address: varchar("home_address", { length: 255 }).notNull(),
    marital_status: mysqlEnum("marital_status", ["single", "married", "divorced", "widow", "widower"]),
    number_of_children: tinyint("number_of_children", { unsigned: true }),
    employment_type: mysqlEnum("employment_type", ["employee", "self_employed", "unemployed", "student"]),
    place_of_work: varchar("place_of_work", { length: 160 }),
    line_of_business: varchar("line_of_business", { length: 160 }),
    work_address: varchar("work_address", { length: 255 }),
    status: mysqlEnum("status", ["registered", "confirmed", "attended", "cancelled"]).notNull().default("registered"),
    ip_address: varchar("ip_address", { length: 45 }),
    created_at: createdAt(),
  },
  (t) => [
    uniqueIndex("uq_ffr_reference").on(t.reference),
    index("idx_ffr_created").on(t.created_at),
    index("idx_ffr_phone").on(t.phone),
  ],
);

export const funFoodDonations = mysqlTable(
  "fun_food_donations",
  {
    id: id(),
    reference: varchar("reference", { length: 20 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    donation_type: mysqlEnum("donation_type", ["cash", "food"]).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }),
    food_items: varchar("food_items", { length: 255 }),
    note: varchar("note", { length: 600 }),
    status: mysqlEnum("status", ["pledged", "received", "acknowledged"]).notNull().default("pledged"),
    ip_address: varchar("ip_address", { length: 45 }),
    created_at: createdAt(),
  },
  (t) => [uniqueIndex("uq_ffd_reference").on(t.reference), index("idx_ffd_created").on(t.created_at)],
);

export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: varchar("email", { length: 160 }).notNull(),
    source: varchar("source", { length: 40 }).notNull().default("website"),
    created_at: createdAt(),
  },
  (t) => [uniqueIndex("uq_newsletter_email").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

/** Uploaded images, stored in the database so they survive redeploys and serverless filesystems. */
export const media = mysqlTable(
  "media",
  {
    id: id(),
    filename: varchar("filename", { length: 200 }).notNull(),
    mime_type: varchar("mime_type", { length: 60 }).notNull(),
    byte_size: int("byte_size", { unsigned: true }).notNull(),
    data: mediumblob("data").notNull(),
    uploaded_by: foreignId("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    created_at: createdAt(),
  },
  (t) => [index("idx_media_created").on(t.created_at)],
);

export const categories = mysqlTable(
  "categories",
  {
    id: id(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: varchar("description", { length: 300 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [uniqueIndex("uq_categories_name").on(t.name), uniqueIndex("uq_categories_slug").on(t.slug)],
);

export const posts = mysqlTable(
  "posts",
  {
    id: id(),
    category_id: foreignId("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    author_id: foreignId("author_id").references(() => users.id, { onDelete: "set null" }),
    cover_image_id: foreignId("cover_image_id").references(() => media.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: varchar("excerpt", { length: 400 }),
    /** Sanitised HTML from the rich text editor. */
    content: mediumtext("content").notNull(),
    cover_alt: varchar("cover_alt", { length: 255 }),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    is_featured: tinyint("is_featured").notNull().default(0),
    seo_title: varchar("seo_title", { length: 200 }),
    seo_description: varchar("seo_description", { length: 320 }),
    published_at: datetime("published_at", { mode: "string" }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    uniqueIndex("uq_posts_slug").on(t.slug),
    index("idx_posts_status_published").on(t.status, t.published_at),
    index("idx_posts_category").on(t.category_id),
    index("idx_posts_author").on(t.author_id),
  ],
);

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

/** Every notification email attempt — sent, failed, or skipped because SMTP is not configured. */
export const emailLog = mysqlTable(
  "email_log",
  {
    id: id(),
    event: varchar("event", { length: 60 }).notNull(),
    reference: varchar("reference", { length: 20 }),
    recipient: varchar("recipient", { length: 500 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    status: mysqlEnum("status", ["sent", "failed", "skipped"]).notNull(),
    error: varchar("error", { length: 1000 }),
    created_at: createdAt(),
  },
  (t) => [index("idx_email_created").on(t.created_at), index("idx_email_status").on(t.status)],
);

/** Fixed-window counters shared by every server instance (in-memory limits do not survive serverless scaling). */
export const rateLimits = mysqlTable("rate_limits", {
  bucket: varchar("bucket", { length: 191 }).primaryKey(),
  hits: int("hits", { unsigned: true }).notNull().default(0),
  window_start: timestamp("window_start", { mode: "string" }).notNull().defaultNow(),
});
