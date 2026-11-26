import "server-only";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import type { PoolClient } from "pg";
import { transaction } from "@/lib/db/pool";
import { getStorage } from "@/lib/storage";
import { processPhoto, PHOTO_SIZES, type PhotoSize } from "@/lib/images/process";

/*
 * Files uploaded in /admin. Every image is decoded with sharp (rejecting
 * anything that is not a real image) and re-encoded, which also strips metadata.
 *   - club photos → the normal photo pipeline (3 WebP sizes, photos table)
 *   - logos, covers, magazine pages, tickets → one WebP at uploads/<uuid>.webp
 *   - PDFs (media kit, org chart) → uploads/<uuid>.pdf after a header check
 */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

async function bytes(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Skedari është më i madh se 4 MB.");
  return Buffer.from(await file.arrayBuffer());
}

export class UploadError extends Error {}

/** A logo/cover/page image: resized to `maxEdge`, WebP (keeps transparency). Returns its public URL, or null if no file. */
export async function saveImage(value: FormDataEntryValue | null, maxEdge = 1600): Promise<string | null> {
  const file = asFile(value);
  if (!file) return null;
  let out: Buffer;
  try {
    out = await sharp(await bytes(file), { failOn: "error" })
      .rotate()
      .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100 })
      .toBuffer();
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError("Skedari nuk është një imazh i vlefshëm.");
  }
  const key = `uploads/${randomUUID()}.webp`;
  await getStorage().put(key, out, "image/webp");
  return getStorage().url(key);
}

/** A PDF document. Returns its public URL, or null if no file. */
export async function savePdf(value: FormDataEntryValue | null): Promise<string | null> {
  const file = asFile(value);
  if (!file) return null;
  const data = await bytes(file);
  if (data.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("Skedari nuk është PDF.");
  const key = `uploads/${randomUUID()}.pdf`;
  await getStorage().put(key, data, "application/pdf");
  return getStorage().url(key);
}

/** Deletes a file uploaded through admin (ignores built-in /images/... files). */
export async function removeUpload(url: string | null | undefined) {
  const base = (process.env.MEDIA_BASE_URL ?? "/media").replace(/\/+$/, "");
  if (!url || !url.startsWith(`${base}/`)) return;
  const key = url.slice(base.length + 1);
  if (/^uploads\/[0-9a-f-]{36}\.(webp|pdf)$/.test(key)) await removeStored(key);
}

export async function removeStored(key: string) {
  try {
    await getStorage().remove(key);
  } catch (error) {
    console.error("Admin storage cleanup failed:", key, error);
  }
}

/** Registers files created by a write so a failed database transaction can clean them up. */
export async function withUploads<T>(work: (client: PoolClient, undo: (cleanup: () => Promise<void>) => void) => Promise<T>) {
  const cleanup: (() => Promise<void>)[] = [];
  try {
    return await transaction((client) => work(client, (callback) => cleanup.push(callback)));
  } catch (error) {
    await Promise.allSettled(cleanup.map((callback) => callback()));
    throw error;
  }
}

/**
 * A club photo through the normal pipeline. Returns the photo id (an existing
 * one if the exact same file was uploaded before), or null if no file.
 */
export async function savePhoto(
  value: FormDataEntryValue | null,
  opts: { disciplineId?: number | null; userId?: string; personIds?: number[] } = {},
  scope?: { client: PoolClient; undo: (cleanup: () => Promise<void>) => void },
): Promise<string | null> {
  const file = asFile(value);
  if (!file) return null;
  if (!scope) return withUploads((client, undo) => savePhoto(file, opts, { client, undo }));
  const { client, undo } = scope;
  const data = await bytes(file);
  const sha256 = createHash("sha256").update(data).digest("hex");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [sha256]);
  const { rows: [existing] } = await client.query<{ id: string }>("SELECT id FROM photos WHERE sha256 = $1 FOR KEY SHARE", [sha256]);
  let id = existing?.id;

  if (!id) {
    let processed;
    try {
      processed = await processPhoto(data);
    } catch {
      throw new UploadError("Skedari nuk është një imazh i vlefshëm.");
    }
    id = randomUUID();
    const storageKey = `photos/${id}`;
    const storage = getStorage();
    undo(() => removeStored(`${storageKey}/`));
    const writes = await Promise.allSettled(
      (Object.keys(PHOTO_SIZES) as PhotoSize[]).map((size) =>
        storage.put(`${storageKey}/${size}.webp`, processed.variants[size].data, "image/webp"),
      ),
    );
    const failed = writes.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
    await client.query(
      `INSERT INTO photos (id, discipline_id, sha256, storage_key, width, height, blur_data_url, taken_at, is_published, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamp AT TIME ZONE 'Europe/Tirane', true, $9)`,
      [id, opts.disciplineId ?? null, sha256, storageKey, processed.width, processed.height, processed.blurDataUrl, processed.takenAtLocal, opts.userId ?? null],
    );
  }
  if (opts.personIds?.length) await client.query(
    "INSERT INTO photo_people (photo_id, person_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING",
    [id, opts.personIds],
  );
  return id;
}

export { asFile };
