# Gap Castle — Website

The redesigned **gapcastle.com**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4,
with MySQL/MariaDB managed through **Drizzle ORM**. Built to deploy on **Vercel**.

- **Marketing site** — Home, About, Services, Loan Products (+ a page per product), Bill
  Payments, Mobile Apps, Fun Food Factory, Blog, Contact, Privacy Policy.
- **Working forms** — school fee, travel, personal and business loan applications, contact
  enquiries, Fun Food Factory registrations, donation pledges and update sign-ups. Every
  submission is saved to the database **and** emailed to the team, with a confirmation email
  to the visitor.
- **Blog** — published at `/blog`, written in the admin with a rich text editor that takes
  image uploads (toolbar, paste or drag-and-drop), with categories and a media library.
- **Staff admin** at `/admin` — a multi-page dashboard with a sidebar on desktop and a
  slide-out menu on phones: submissions, blog, users, settings and the email log. Staff can
  reset a forgotten password by email.

See **[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)** for the visual system and photography brief.

---

## Local setup

Requirements: Node.js **20.9+** and a MySQL 8 or MariaDB 10.4+ database.

```bash
npm install
cp .env.example .env.local     # fill in the database, SESSION_SECRET, SMTP and APP_URL values
npm run db:setup               # apply migrations, then seed admin, settings, categories and starter posts
npm run dev                    # http://localhost:3000
```

Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. If `ADMIN_PASSWORD` was
empty when you seeded, a password is generated and printed once in the terminal.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` | Create a migration from changes in `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations in `drizzle/` |
| `npm run db:seed` | Default admin, settings, blog categories and starter posts (never overwrites) |
| `npm run db:setup` | `db:migrate` then `db:seed` |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run user:password -- <email> ["password"]` | Set a staff password from the terminal (generates one if omitted) |

### Changing the database

1. Edit `src/db/schema.ts`.
2. `npm run db:generate` — review the new SQL file in `drizzle/`.
3. `npm run db:migrate` — applies it (tracked in the `__drizzle_migrations` table).
4. Commit the schema change **and** the generated migration together.

`drizzle/0000_utf8mb4-database.sql` switches the database to utf8mb4 before any table is
created — shared hosts often default to latin1, which cannot store characters such as ₦.

### Tables

| Table | Holds |
| --- | --- |
| `users` | Staff accounts — `password` is a bcrypt hash; `role` is `admin` or `editor` |
| `password_reset_tokens` | SHA-256 of each emailed reset token, its expiry and when it was used |
| `posts` | Blog posts — HTML `content`, linked to `categories`, `users` (author) and `media` (cover) |
| `categories` | Blog categories (name, slug, description) |
| `media` | Uploaded images, stored as blobs and served from `/media/:id` |
| `loan_applications`, `contact_messages`, `fun_food_registrations`, `fun_food_donations`, `newsletter_subscribers` | Website form submissions |
| `settings`, `email_log`, `rate_limits` | Configuration, every email attempt, and shared rate-limit counters |

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Database connection |
| `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED` | Optional TLS to the database |
| `DB_POOL_SIZE` | Connections per server instance (default 10 locally, 3 on Vercel) |
| `SESSION_SECRET` | 32+ characters; signs the staff session cookie |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Default admin created by `db:seed` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM_ADDRESS` | Optional fallback email server — used only while no SMTP host is saved in **Admin → Settings → Email server** |
| `SETTINGS_ENCRYPTION_KEY` | Optional, 32+ characters. Encrypts the SMTP password saved in the dashboard (defaults to `SESSION_SECRET`) |
| `APP_URL` | Public site URL used in email links and password reset links (`http://localhost:3000` locally) |
| `FEEDBACK_WIDGET_ENABLED` | Optional. The ReviseFlow feedback widget loads on the live production deployment only; set `true` to load it elsewhere (for example locally) |

## Email notifications

| Form | Team is emailed | Visitor receives |
| --- | --- | --- |
| Loan application | Full application + link to admin | Reference and next steps |
| Contact | Enquiry, reply-to set to the visitor | Acknowledgement |
| Fun Food Factory registration | Registration details | Invitation-only terms (if they gave an email) |
| Donation pledge | Pledge details | Transfer details for cash gifts |
| Update sign-up | New subscriber | Subscription confirmation |

- **Email server** — admins set the SMTP host, port, encryption (SSL/TLS, STARTTLS or none),
  username, password, sender address and sender name in **Admin → Settings → Email server**,
  with **Test connection** (connects and signs in without sending) and **Send test email**.
  These settings are used by every email the site sends: form notifications, confirmations,
  password reset links and tests. They are read on each send, so a change applies to every
  server instance immediately. While no host is saved there, the `SMTP_*` environment
  variables are used instead.
- The SMTP password is encrypted with AES-256-GCM before it is stored (key from
  `SETTINGS_ENCRYPTION_KEY`, or `SESSION_SECRET`), is never sent back to the browser, and is
  kept when the field is left blank. If the key changes, the dashboard asks for the password
  again.
- Recipients and whether confirmations are sent are set in **Admin → Settings → Notifications**.
- Emails are sent after the response via Next.js `after()`, so a slow mail server never slows
  or fails a submission. Every attempt — sent, failed or skipped — is recorded in `email_log`
  and shown in **Admin → Email log**. Settings has a **Send test** button.

## Staff accounts and passwords

- Passwords are hashed with **bcrypt** (cost 12) and must be 10–72 characters.
- **Forgot password** — the link on the sign-in page emails a single-use reset link that
  expires after 60 minutes. The response is the same whether or not the address has an
  account, requests are rate limited, and only a SHA-256 of the token is stored. Links are
  built from `APP_URL`, never from the request's Host header.
- Resetting or changing a password signs the account out on every other device.
- Admins can add users, change roles, deactivate accounts and send someone a reset link from
  **Admin → Users**. Nobody can demote or deactivate their own account.
- Reset emails need SMTP. Without it, set a password from the terminal:
  `npm run user:password -- someone@gapcastle.com`.

## Blog

- Posts are written in a **rich text editor** (TipTap): headings, bold, italic, underline,
  strikethrough, links, lists, quotes, dividers, undo/redo and images. Images can be uploaded
  from the toolbar, pasted or dropped into the text, and each can be given a description for
  screen readers.
- Saved HTML is run through an allow-list sanitiser on save **and** on render: no scripts,
  styles, event handlers or unsafe URLs, and images may only come from `/media/`, `/images/`
  or `https://`.
- Uploads (JPEG, PNG or WebP, up to 3 MB, checked by their bytes) are stored in the `media`
  table and served from `/media/:id`, so they survive redeploys on a serverless host. The
  **Media library** page lists them and refuses to delete an image a post still uses.
- **Categories** are managed in the admin; a category with posts cannot be deleted.
- Article pages are cached and refreshed every five minutes, and immediately when a post is
  saved or deleted.

---

## Deploying to Vercel

1. **Environment variables** — add every variable above to the Vercel project (Production and
   Preview). Set `APP_URL` to the production domain.
2. **Database access** — Vercel functions connect from changing IP addresses. The database
   host must allow remote connections from any address (in cPanel/StackCP "Remote MySQL",
   allow `%`), or use Vercel's static IPs and allow-list those.
3. **Function region** — run functions next to the database. The current database is hosted in
   the UK (`mysql.gb.stackcp.com`), so set the region to **London (`lhr1`)** under Project →
   Settings → Functions. Every page that reads the database makes several round trips, so a
   distant region adds noticeable delay.
4. **Migrations** — run `npm run db:migrate` from your machine or CI against the production
   database *before* deploying a change that needs it. Migrations do not run during the build.
5. **Deploy** — push to the connected Git repository, or run `vercel --prod`.

Already handled in code:

- The connection pool is small per instance and registered with `attachDatabasePool` from
  `@vercel/functions`, so idle connections close cleanly between invocations.
- Rate limits for forms, sign-in and password resets are stored in the database
  (`rate_limits`), so they hold across instances.
- Nothing is written to the filesystem at runtime.

---

## Project structure

```
drizzle/                     Generated SQL migrations + snapshots (commit these)
drizzle.config.ts            drizzle-kit configuration
scripts/seed.ts              Default admin, settings, categories and starter posts
scripts/reset-password.ts    Set a staff password from the terminal
docs/DESIGN-SYSTEM.md        Design system & art direction
public/images/               Photography (+ credits.json for attribution)
src/db/
  schema.ts                  All tables
  seed/                      Seed data (settings, categories, starter posts)
src/app/
  (site)/                    Public website — shares header and footer
    blog/  blog/[slug]/      Blog index and articles
  (admin)/admin/             Staff admin (noindex)
    login/ forgot-password/ reset-password/
    (protected)/             Sidebar layout and every signed-in page:
      applications/ messages/ fun-food/ fun-food/donations/ subscribers/
      blog/ blog/new/ blog/[id]/ blog/categories/ media/
      users/ settings/ email-log/ account/
    actions.ts               Sign-in, password reset, submissions, settings, users
    blog-actions.ts          Posts, categories and media uploads
  media/[id]/route.ts        Serves uploaded images
  actions.ts                 Public form server actions (save + email)
src/components/admin/        Sidebar, rich text editor, media dialog, forms, UI kit
src/lib/
  db.ts                      Drizzle client and pool
  auth.ts  password.ts  password-reset.ts  admin-guard.ts   Sessions, bcrypt, reset tokens
  blog.ts  html.ts  media.ts Blog queries, HTML sanitising, image storage
  notify.ts  mailer.ts  email-templates.ts   Email notifications
  settings.ts  rate-limit.ts  admin-data.ts  validation.ts  site.ts  fun-food.ts
```

Business content lives in `src/lib/site.ts` and `src/lib/fun-food.ts`.

## Legacy URLs

`/application-for-school-loan`, `/application-for-travel-loan`, `/gap-castles-fun-food-factory`
and `/contact-us` permanently redirect to their new pages (see `next.config.ts`).

---

## Before launch

- **Email server** — set it up in Admin → Settings → Email server. Until then, submissions are
  saved but no email is sent, and password reset links cannot be delivered.
- **App store links** — the App Store / Google Play buttons currently open `pay.gapcastle.com`.
- **Mobile app feature copy** on `/mobile-apps` should be checked against the live app.
- **Privacy policy** — have it reviewed by counsel.
- **Starter blog posts** — review, edit or delete them in Admin → Posts.
- **Photography** — replace the Wikimedia Commons imagery with a commissioned shoot.
#   g a p c a s t l e - o f f i c i a l  
 