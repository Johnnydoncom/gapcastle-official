// Sets a new password for a staff account from the command line — for when
// nobody can sign in and email is not configured.
//   npm run user:password -- someone@gapcastle.com            (generates a password)
//   npm run user:password -- someone@gapcastle.com "new pass"  (uses the one given)
// Every existing session for the account is signed out.
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../src/db/schema";
import { passwordResetTokens, users } from "../src/db/schema";
import { hashPassword, passwordProblem } from "../src/lib/password";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  if (!emailArg) {
    console.error('Usage: npm run user:password -- <email> ["new password"]');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const password = passwordArg ?? randomBytes(12).toString("base64url");
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "gapcastle_web",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    connectionLimit: 1,
    connectTimeout: 20_000,
    dateStrings: true,
    charset: "utf8mb4",
  });
  const db = drizzle({ client: pool, schema, mode: "default" });

  try {
    const [user] = await db.select({ id: users.id, name: users.name, is_active: users.is_active }).from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new Error(`No account uses ${email}.`);

    await db
      .update(users)
      .set({
        password: await hashPassword(password),
        // UTC, matching how the app compares it against session start times
        password_changed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where(eq(users.id, user.id));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.user_id, user.id));

    console.log(`✓ Password updated for ${user.name} <${email}>`);
    if (!passwordArg) console.log(`   generated password (shown once): ${password}`);
    if (!user.is_active) console.log("   note: this account is deactivated — reactivate it from Admin → Users to sign in.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`✗ ${error?.message ?? error}`);
  process.exit(1);
});
