"use server";

import { requireStaff } from "@/lib/admin/session";
import { AdminError, bool, isPhotoId, messageFor, opt, recordId, run } from "@/lib/admin/form";
import { removeStored, savePhoto } from "@/lib/admin/uploads";
import { query, transaction } from "@/lib/db/pool";

const photoList = "/admin/fotot";

export async function uploadPhoto(disciplineId: number | null, form: FormData) {
  const user = await requireStaff();
  try {
    const id = await savePhoto(form.get("file"), { disciplineId, userId: user.id });
    if (!id) throw new AdminError("Zgjidhni një foto.");
    return {};
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function editPhoto(id: string, form: FormData) {
  await requireStaff();
  if (!isPhotoId(id)) throw new AdminError("Fotoja nuk është e vlefshme.");
  await run(`${photoList}/${id}`, async () => {
    const rawDiscipline = opt(form, "discipline_id");
    const discipline = rawDiscipline ? recordId(rawDiscipline) : null;
    if (rawDiscipline && discipline === null) throw new AdminError("Zgjidhni një disiplinë të vlefshme.");
    const tags = Array.from(new Set(form.getAll("person_id").map((value) => recordId(String(value)))));
    if (tags.includes(null)) throw new AdminError("Kontrolloni personat e etiketuar.");
    await transaction(async (client) => {
      const { rowCount } = await client.query(
        `UPDATE photos SET alt_sq = $2, alt_en = $3, discipline_id = $4, is_featured = $5, is_published = $6 WHERE id = $1`,
        [id, opt(form, "alt_sq"), opt(form, "alt_en"), discipline, bool(form, "is_featured"), bool(form, "is_published")],
      );
      if (!rowCount) throw new AdminError("Fotoja nuk ekziston më.");
      await client.query("DELETE FROM photo_people WHERE photo_id = $1 AND person_id <> ALL($2::int[])", [id, tags]);
      await client.query("INSERT INTO photo_people (photo_id, person_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING", [id, tags]);
    });
  });
}

export async function deletePhoto(id: string) {
  await requireStaff();
  if (!isPhotoId(id)) throw new AdminError("Fotoja nuk është e vlefshme.");
  await run(`${photoList}/${id}`, async () => {
    const [photo] = await query<{ storage_key: string }>("DELETE FROM photos WHERE id = $1 RETURNING storage_key", [id]);
    if (!photo) throw new AdminError("Fotoja nuk ekziston më.");
    await removeStored(`${photo.storage_key}/`);
  }, () => photoList, "Fotoja u fshi.");
}
