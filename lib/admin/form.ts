import "server-only";
import { redirect } from "next/navigation";
import { UploadError } from "./uploads";

/*
 * Small helpers for admin Server Actions: read typed values from FormData and
 * send the user back with a message (?ok=… or ?gabim=…) that the page shows.
 */

export const str = (f: FormData, key: string) => String(f.get(key) ?? "").trim();
/** Trimmed text, or null when empty. */
export const opt = (f: FormData, key: string) => str(f, key) || null;
export const bool = (f: FormData, key: string) => f.get(key) === "on" || f.get(key) === "true";
export function int(f: FormData, key: string): number | null {
  const v = str(f, key);
  if (v === "") return null;
  const n = Number(v);
  if (!/^-?\d+$/.test(v) || !Number.isSafeInteger(n)) throw new AdminError(`"${key}" duhet të jetë numër i plotë.`);
  return n;
}
export function required(f: FormData, key: string, label: string) {
  const v = str(f, key);
  if (!v) throw new AdminError(`Fusha "${label}" është e detyrueshme.`);
  return v;
}

/** "basketboll femra" / "Çiklizëm" → "basketboll-femra" / "ciklizem". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-$/, "");
}

export class AdminError extends Error {}

export function webUrl(value: string | null, label: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    // Fall through to the same message for invalid or unsupported URLs.
  }
  throw new AdminError(`"${label}" duhet të jetë një adresë http:// ose https://.`);
}

export function recordId(value: string) {
  return /^[1-9]\d{0,9}$/.test(value) && Number(value) <= 2147483647 ? Number(value) : null;
}

export const isPhotoId = (value: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);

/** Turns known errors (validation, uploads, database rules) into a readable message. */
export function messageFor(error: unknown): string {
  if (error instanceof AdminError || error instanceof UploadError) return error.message;
  const e = error as { code?: string; constraint?: string; detail?: string };
  if (e?.code === "23505") return "Kjo vlerë ekziston tashmë (p.sh. adresa/slug ose numri është i zënë).";
  if (e?.constraint === "people_publish_requires_consent") return "Një person mund të publikohet vetëm pasi të jetë konfirmuar pëlqimi.";
  if (e?.code === "23503") return "Ky element përdoret diku tjetër dhe nuk mund të fshihet.";
  if (e?.constraint === "academy_programs_age_range") return "Mosha minimale duhet të jetë e barabartë me ose më e vogël se mosha maksimale.";
  if (e?.code === "22008" || e?.code === "22007") return "Data ose ora nuk është e saktë.";
  if (e?.code === "23514") return "Një nga vlerat nuk është e lejuar (kontrolloni numrat dhe datat).";
  console.error(error);
  return "Ndodhi një gabim. Provoni përsëri.";
}

/**
 * Runs a save and redirects back with ?ok= or ?gabim=. `next(result)` returns the
 * page to go to on success (e.g. the new item's edit page).
 */
export async function run<T>(back: string, work: () => Promise<T>, next: (result: T) => string = () => back, ok = "U ruajt."): Promise<never> {
  let target: string;
  try {
    const result = await work();
    target = withParam(next(result), "ok", ok);
  } catch (error) {
    target = withParam(back, "gabim", messageFor(error));
  }
  redirect(target);
}

function withParam(url: string, key: string, value: string) {
  const [path, hash] = url.split("#");
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${encodeURIComponent(value)}${hash ? `#${hash}` : ""}`;
}

/** datetime-local value ("2026-11-30T18:00") read as Tirana time; SQL: $n::timestamp AT TIME ZONE 'Europe/Tirane'. */
export function localDateTime(f: FormData, key: string): string | null {
  const v = str(f, key);
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) throw new AdminError("Data ose ora nuk është e saktë.");
  return v;
}
