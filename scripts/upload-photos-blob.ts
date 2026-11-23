/**
 * Copies the processed photos (storage/photos/<id>/{sm,md,lg}.webp) to a
 * Vercel Blob store, keeping the same paths, so the deployed site can show them.
 *
 *   BLOB_READ_WRITE_TOKEN=... npm run blob:upload
 *
 * Safe to re-run: files already in the store are skipped. Originals never leave the PC.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

try {
  process.loadEnvFile();
} catch {}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN (Vercel → Storage → your Blob store → .env.local).");
  const root = path.resolve(process.env.STORAGE_DIR ?? "./storage");

  const local: string[] = [];
  for (const id of await readdir(path.join(root, "photos"))) {
    for (const file of await readdir(path.join(root, "photos", id))) {
      if (file.endsWith(".webp")) local.push(`photos/${id}/${file}`);
    }
  }

  const existing = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "photos/", cursor, limit: 1000, token });
    page.blobs.forEach((b) => existing.add(b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const todo = local.filter((key) => !existing.has(key));
  console.log(`${local.length} files locally, ${existing.size} already uploaded, ${todo.length} to upload.`);

  let done = 0;
  let failed = 0;
  let sampleUrl = "";
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let key = queue.shift(); key; key = queue.shift()) {
        try {
          const blob = await put(key, await readFile(path.join(root, key)), {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: "image/webp",
            cacheControlMaxAge: 31536000, // files never change: each photo has its own id
            token,
          });
          sampleUrl ||= blob.url;
        } catch (error) {
          failed++;
          console.error(`\n${key}: ${error instanceof Error ? error.message : error}`);
        }
        if (++done % 50 === 0 || done === todo.length) process.stdout.write(`\r  ${done}/${todo.length}`);
      }
    }),
  );
  console.log(`\nUploaded ${done - failed}, failed ${failed}.`);
  if (sampleUrl) console.log(`Example URL: ${sampleUrl}`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
