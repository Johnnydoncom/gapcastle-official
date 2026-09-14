import bcrypt from "bcryptjs";

/*
 * Passwords are hashed with bcrypt (cost 12). bcrypt only reads the first 72
 * bytes of a password, so longer ones are rejected at validation rather than
 * silently truncated.
 */

const COST = 12;

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_BYTES = 72;

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Returns an error message, or null when the password is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) return "Use 72 characters or fewer.";
  return null;
}

/** A valid cost-12 hash to compare against when an account does not exist, so response time does not reveal it. */
export const DUMMY_HASH = "$2b$12$lnRn4glWDoRjlAbWqisIMO/hiWRXTrwqUG4zjqriYS6gKorfi.Ga6";
