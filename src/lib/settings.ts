import defaults from "@/db/seed/settings.json";
import { siteSettings } from "@/db/schema";
import { db } from "@/lib/db";

export type AllSettings = typeof defaults;
export type SettingKey = keyof AllSettings;

/** Values that must never reach a page or the browser. getSettings() leaves them out. */
type SecretKey = "smtp_pass";
export type Settings = Omit<AllSettings, SecretKey>;

export const SETTING_DEFAULTS: AllSettings = defaults;

/**
 * Every stored setting — including encrypted secrets — merged over the seeded
 * defaults; defaults alone if the database is unreachable. Server-side use only.
 */
export async function readSettingsIncludingSecrets(): Promise<AllSettings> {
  const merged: AllSettings = { ...SETTING_DEFAULTS };
  try {
    const rows = await db.select().from(siteSettings);
    for (const row of rows) {
      if (row.setting_key in merged && row.setting_value !== null) {
        merged[row.setting_key as SettingKey] = row.setting_value;
      }
    }
  } catch (error) {
    console.error("[settings] using defaults:", error instanceof Error ? error.message : error);
  }
  return merged;
}

/** Stored settings without secrets. Never throws. */
export async function getSettings(): Promise<Settings> {
  const all: Partial<AllSettings> = await readSettingsIncludingSecrets();
  delete all.smtp_pass;
  return all as Settings;
}

export async function saveSettings(values: Partial<AllSettings>) {
  for (const [key, value] of Object.entries(values)) {
    if (!(key in SETTING_DEFAULTS) || value === undefined) continue;
    await db
      .insert(siteSettings)
      .values({ setting_key: key, setting_value: value })
      .onDuplicateKeyUpdate({ set: { setting_value: value } });
  }
}

export function parseEmailList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)),
    ),
  ];
}
