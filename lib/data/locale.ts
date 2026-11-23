export type Locale = "sq" | "en";

/** Picks the English column when present, falling back to Albanian. */
export function pick<T extends Record<string, unknown>>(row: T, field: string, lang: Locale): string | null {
  const sq = row[`${field}_sq`] as string | null | undefined;
  const en = row[`${field}_en`] as string | null | undefined;
  return (lang === "en" ? en || sq : sq || en) ?? null;
}
