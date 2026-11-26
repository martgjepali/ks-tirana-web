"use server";

import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { thumbOf } from "@/lib/admin/lookups";
import type { LibraryPhoto } from "@/components/admin/client";

/** Photo library for the picker: 30 per page, newest first, searchable by discipline or tagged person. */
export async function loadLibrary(disciplineId: number | null, search: string, page: number): Promise<LibraryPhoto[]> {
  await requireStaff();
  const needle = `%${typeof search === "string" ? search.trim().slice(0, 120).toLowerCase() : ""}%`;
  const offset = Number.isInteger(page) && page >= 0 ? Math.min(page, 10000) * 30 : 0;
  const rows = await query<{ id: string; storage_key: string; label: string | null }>(
    `SELECT ph.id, ph.storage_key,
       concat_ws(' · ', d.name_sq, (SELECT string_agg(pe.full_name, ', ') FROM photo_people x JOIN people pe ON pe.id = x.person_id WHERE x.photo_id = ph.id)) AS label
     FROM photos ph LEFT JOIN disciplines d ON d.id = ph.discipline_id
     WHERE ($3::int IS NULL OR ph.discipline_id = $3)
       AND ($1 = '%%' OR lower(coalesce(d.name_sq, '')) LIKE $1
        OR EXISTS (SELECT 1 FROM photo_people x JOIN people pe ON pe.id = x.person_id WHERE x.photo_id = ph.id AND lower(pe.full_name) LIKE $1))
     ORDER BY ph.created_at DESC, ph.id
     LIMIT 30 OFFSET $2`,
    [needle, offset, disciplineId],
  );
  return rows.map((r) => ({ id: r.id, thumb: thumbOf(r.storage_key), label: r.label ?? "" }));
}
