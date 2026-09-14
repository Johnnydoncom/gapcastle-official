import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/*
 * Encrypts secrets stored in the settings table (the SMTP password) with
 * AES-256-GCM. The key comes from SETTINGS_ENCRYPTION_KEY, or SESSION_SECRET
 * when that is not set, so a copy of the database alone does not reveal them.
 * Changing the key makes saved secrets unreadable; they must be entered again.
 */

const PREFIX = "enc:v1:";

function key(): Buffer | null {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? createHash("sha256").update(`gapcastle-settings:${secret}`).digest() : null;
}

export const encryptionAvailable = () => key() !== null;

export function sealSecret(plain: string): string {
  const k = key();
  if (!k) throw new Error("Set SESSION_SECRET (or SETTINGS_ENCRYPTION_KEY) to at least 32 characters to store secrets.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(":");
}

/** The plain value, or null when it is not a sealed value or cannot be decrypted with the current key. */
export function openSecret(sealed: string): string | null {
  const k = key();
  if (!k || !sealed.startsWith(PREFIX)) return null;
  try {
    const [iv, tag, encrypted] = sealed.slice(PREFIX.length).split(":").map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
