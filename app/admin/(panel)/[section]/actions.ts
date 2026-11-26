"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/session";
import { AdminError, bool, int, isPhotoId, localDateTime, opt, recordId, required, run, slugify, str, webUrl } from "@/lib/admin/form";
import { getSection, type FieldSpec } from "@/lib/admin/sections";
import { asFile, removeUpload, saveImage, savePhoto, withUploads } from "@/lib/admin/uploads";

function identify(sectionKey: string, routeId: string) {
  const section = getSection(sectionKey);
  const id = recordId(routeId);
  if (!section || (!id && (routeId !== "i-ri" || section.inbox))) throw new AdminError("Ky element nuk ekziston.");
  return { section, id };
}

function fieldValue(form: FormData, field: FieldSpec, options: { value: string | number }[] = []) {
  const { key, label, kind } = field;
  if (field.required) required(form, field.pair ? `${key}_sq` : key, label);
  switch (kind) {
    case "check": return bool(form, key);
    case "number": {
      const value = int(form, key);
      if (value !== null && (value < (field.min ?? -2147483648) || value > (field.max ?? 2147483647))) {
        throw new AdminError(`Kontrolloni vlerën e fushës "${label}".`);
      }
      return value ?? field.initial ?? null;
    }
    case "datetime": return localDateTime(form, key);
    case "select": {
      const value = opt(form, key);
      if (value === null) return null;
      if (!options.some((o) => String(o.value) === value)) throw new AdminError(`Zgjidhni një vlerë të vlefshme për "${label}".`);
      return value;
    }
    case "sizes": return str(form, key).split(",").map((v) => v.trim()).filter(Boolean);
    case "url": return webUrl(opt(form, key), label);
    default: return opt(form, key);
  }
}

export async function saveEntry(sectionKey: string, routeId: string, form: FormData) {
  const user = await requireStaff();
  const { section, id } = identify(sectionKey, routeId);
  const base = `/admin/${sectionKey}`;
  await run(`${base}/${routeId}`, async () => {
    const replaced: string[] = [];
    const saved = await withUploads(async (client, undo) => {
      const previous = id ? (await client.query(`SELECT * FROM ${section.table} WHERE id = $1 FOR UPDATE`, [id])).rows[0] : undefined;
      if (id && !previous) throw new AdminError("Ky element nuk ekziston më.");
      const values = new Map<string, unknown>();
      const timestamps = new Set<string>();
      const disciplineValue = opt(form, "discipline_id");
      const discipline = disciplineValue ? recordId(disciplineValue) : null;

      for (const field of section.fields) {
        const { key, kind } = field;
        if (kind === "photo" || kind === "portrait" || kind === "image") continue;
        if (field.pair) {
          values.set(`${key}_sq`, field.required ? required(form, `${key}_sq`, field.label) : opt(form, `${key}_sq`));
          values.set(`${key}_en`, opt(form, `${key}_en`));
          continue;
        }
        if (kind === "slug") {
          const slug = slugify(str(form, key) || str(form, section.name));
          if (!slug) throw new AdminError("Shkruani një adresë me shkronja ose numra.");
          values.set(key, slug);
          continue;
        }
        if (field.options === "disciplines" || field.options === "coaches") {
          const isDiscipline = field.options === "disciplines";
          const selected = opt(form, key);
          const selectedId = selected ? recordId(selected) : null;
          if ((field.required || selected) && selectedId === null) throw new AdminError(`Zgjidhni një vlerë për "${field.label}".`);
          if (!isDiscipline && selectedId && (selectedId !== previous?.coach_person_id || discipline !== previous?.discipline_id)) {
            const { rowCount } = await client.query("SELECT 1 FROM people WHERE id = $1 AND discipline_id = $2 AND role <> 'athlete' FOR SHARE", [selectedId, discipline]);
            if (!rowCount) throw new AdminError("Zgjidhni një trajner nga disiplina e programit.");
          }
          values.set(key, selectedId);
          continue;
        }
        values.set(key, fieldValue(form, field, field.options));
        if (kind === "datetime") timestamps.add(key);
      }

      if (sectionKey === "lajme") {
        values.set("body_sq", values.get("body_sq") ?? "");
        if (!id) values.set("author_id", user.id);
      }
      if (sectionKey === "ndeshjet") {
        const hasFor = values.get("score_for") !== null;
        const hasAgainst = values.get("score_against") !== null;
        if (hasFor !== hasAgainst || (values.get("status") === "finished" && !hasFor)) {
          throw new AdminError("Plotësoni të dyja pikët për një rezultat. Rezultati është i detyrueshëm për ndeshjet e përfunduara.");
        }
      }
      if (sectionKey === "personat" && values.get("is_published") && !values.get("consent_confirmed")) {
        throw new AdminError("Konfirmoni pëlqimin përpara publikimit.");
      }
      if (section.inbox) values.set("handled_by", user.id);

      for (const field of section.fields) {
        const { key, kind } = field;
        if (kind === "photo") {
          const upload = field.upload ? await savePhoto(form.get(`${key}_file`), { disciplineId: discipline, userId: user.id }, { client, undo }) : null;
          const chosen = upload ?? opt(form, key);
          if (chosen && !isPhotoId(chosen)) throw new AdminError("Fotoja nuk është e vlefshme.");
          if (field.scoped && chosen && chosen !== previous?.[key]) {
            const { rowCount } = await client.query("SELECT 1 FROM photos WHERE id = $1 AND discipline_id = $2 FOR SHARE", [chosen, id]);
            if (!rowCount) throw new AdminError("Zgjidhni një foto nga kjo disiplinë.");
          }
          values.set(key, chosen);
        } else if (kind === "image") {
          const upload = await saveImage(form.get(key));
          if (upload) {
            undo(() => removeUpload(upload));
            if (previous?.[key]) replaced.push(previous[key]);
          }
          const image = upload ?? previous?.[key];
          if (field.required && !image) throw new AdminError(`Ngarkoni një imazh për "${field.label}".`);
          values.set(key, image);
        } else if (kind === "portrait" && bool(form, "remove_portrait") && !asFile(form.get(key))) {
          values.set(key, null);
        }
      }

      const keys = Array.from(values.keys());
      const args = Array.from(values.values());
      const params = keys.map((key, i) => timestamps.has(key) ? `$${i + 1}::timestamp AT TIME ZONE 'Europe/Tirane'` : `$${i + 1}`);
      const sql = id
        ? `UPDATE ${section.table} SET ${keys.map((key, i) => `${key} = ${params[i]}`).join(", ")} WHERE id = $${args.push(id)} RETURNING id`
        : `INSERT INTO ${section.table} (${keys.join(", ")}) VALUES (${params.join(", ")}) RETURNING id`;
      const { rows: [row] } = await client.query<{ id: number }>(sql, args);
      if (sectionKey === "personat") {
        const portrait = await savePhoto(form.get("portrait_photo_id"), { disciplineId: discipline, userId: user.id, personIds: [row.id] }, { client, undo });
        if (portrait) await client.query("UPDATE people SET portrait_photo_id = $1 WHERE id = $2", [portrait, row.id]);
      }
      return row.id;
    });
    await Promise.all(replaced.map(removeUpload));
    if (section.inbox) revalidatePath("/admin", "layout");
    return saved;
  }, (saved) => `${base}/${saved}`);
}

export async function deleteEntry(sectionKey: string, routeId: string) {
  await requireStaff();
  const { section, id } = identify(sectionKey, routeId);
  if (!id) throw new AdminError("Ky element nuk ekziston.");
  const base = `/admin/${sectionKey}`;
  await run(`${base}/${routeId}`, async () => {
    const oldFiles = await withUploads(async (client) => {
      const { rows: [row] } = await client.query(`SELECT * FROM ${section.table} WHERE id = $1 FOR UPDATE`, [id]);
      if (!row) throw new AdminError("Ky element nuk ekziston më.");
      const files: string[] = section.fields.filter((f) => f.kind === "image").map((f) => row[f.key]);
      if (sectionKey === "revista") {
        const { rows } = await client.query<{ image_url: string }>("SELECT image_url FROM magazine_pages WHERE issue_id = $1", [id]);
        files.push(...rows.map((p) => p.image_url));
      }
      await client.query(`DELETE FROM ${section.table} WHERE id = $1`, [id]);
      return files;
    });
    await Promise.all(oldFiles.map(removeUpload));
    if (section.inbox) revalidatePath("/admin", "layout");
  }, () => base, "U fshi.");
}
