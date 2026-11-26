import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { query } from "@/lib/db/pool";

/*
 * Page texts. The JSON files hold the defaults; texts edited in /admin → Tekstet
 * (table site_texts, keyed by dotted path like "home.hero.subtitle") override them.
 */

const dictionaries = {
  sq: () => import("./dictionaries/sq.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export const locales: Locale[] = ["sq", "en"];
export const defaultLocale: Locale = "sq";

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;

/** The built-in texts, without admin edits (used by the admin text editor). */
export const getDefaultDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDefaultDictionary>>;

/** Sets `value` at a dotted path ("a.b.0.c") if that path exists and holds a string. */
function applyOverride(target: unknown, path: string, value: string) {
  const parts = path.split(".");
  let node = target as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    const next = node?.[part];
    if (!next || typeof next !== "object") return;
    node = next as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (typeof node?.[last] === "string") node[last] = value;
}

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const dict = structuredClone(await dictionaries[locale]());
  await connection();
  try {
    const rows = await query<{ key: string; value: string }>("SELECT key, value FROM site_texts WHERE locale = $1", [locale]);
    for (const r of rows) applyOverride(dict, r.key, r.value);
  } catch {
    // Database unreachable: the built-in texts still render.
  }
  return dict;
});
