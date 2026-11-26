import "server-only";
import { query } from "@/lib/db/pool";
import { getStorage } from "@/lib/storage";

/** Lists used by admin forms. Admin sees everything, published or not. */

export async function disciplineOptions() {
  const rows = await query<{ id: number; name_sq: string }>("SELECT id, name_sq FROM disciplines ORDER BY sort_order, name_sq");
  return rows.map((r) => ({ value: r.id, label: r.name_sq }));
}

export const thumbOf = (storageKey: string, size: "sm" | "md" = "sm") => getStorage().url(`${storageKey}/${size}.webp`);

/** Current photo for a picker: id + thumbnail, or null. */
export async function photoThumb(id: string | null | undefined) {
  if (!id) return null;
  const [row] = await query<{ storage_key: string }>("SELECT storage_key FROM photos WHERE id = $1", [id]);
  return row ? { id, thumb: thumbOf(row.storage_key) } : null;
}

export const NEWS_CATEGORIES = [
  { value: "lajm", label: "Lajm (sportet)" },
  { value: "akademia", label: "Akademia" },
  { value: "intervista", label: "Intervistë" },
  { value: "klubi", label: "Klubi" },
  { value: "komuniteti", label: "Komuniteti" },
];

export const PRODUCT_CATEGORIES = [
  { value: "fanella", label: "Fanella" },
  { value: "stervitje", label: "Stërvitje" },
  { value: "aksesore", label: "Aksesorë" },
];

export const ROLES = [
  { value: "athlete", label: "Sportist/e" },
  { value: "head_coach", label: "Trajner" },
  { value: "assistant_coach", label: "Zëvendëstrajner / staf" },
];

export const FIXTURE_STATUSES = [
  { value: "scheduled", label: "E planifikuar" },
  { value: "live", label: "Live" },
  { value: "finished", label: "E përfunduar" },
  { value: "postponed", label: "E shtyrë" },
  { value: "cancelled", label: "E anuluar" },
];
