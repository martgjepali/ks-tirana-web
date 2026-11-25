/**
 * DEVELOPMENT ONLY: downloads the processed photos from the private Vercel Blob
 * store into STORAGE_DIR (storage/photos/<id>/{sm,md,lg}.webp), so the local
 * site serves them itself through /media. The reverse of `npm run blob:upload`.
 *
 *   npm run photos:pull
 *
 * Needs BLOB_READ_WRITE_TOKEN in .env. The store is only read. Safe to re-run:
 * files already on disk with the right size are skipped.
 */
import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, type ListBlobResultBlob } from "@vercel/blob";

try {
  process.loadEnvFile();
} catch {}

async function sizeOnDisk(file: string) {
  try {
    return (await stat(file)).size;
  } catch {
    return -1;
  }
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN in .env (Vercel → Storage → your Blob store → .env.local tab).");
  const root = path.resolve(process.env.STORAGE_DIR ?? "./storage");

  const remote: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "photos/", cursor, limit: 1000, token });
    remote.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const todo: ListBlobResultBlob[] = [];
  for (const blob of remote) {
    if ((await sizeOnDisk(path.join(root, blob.pathname))) !== blob.size) todo.push(blob);
  }
  const megabytes = (todo.reduce((sum, b) => sum + b.size, 0) / 1024 / 1024).toFixed(0);
  console.log(`${remote.length} files in the store, ${remote.length - todo.length} already here, ${todo.length} to download (${megabytes} MB).`);

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let blob = queue.shift(); blob; blob = queue.shift()) {
        const file = path.join(root, blob.pathname);
        try {
          const result = await get(blob.pathname, { access: "private", token });
          if (!result || result.statusCode !== 200) throw new Error("not found");
          await mkdir(path.dirname(file), { recursive: true });
          // Temp file + rename: an interrupted run never leaves a half-written image.
          const temp = `${file}.${process.pid}.tmp`;
          await writeFile(temp, Buffer.from(await new Response(result.stream).arrayBuffer()));
          await rename(temp, file);
        } catch (error) {
          failed++;
          console.error(`\n${blob.pathname}: ${error instanceof Error ? error.message : error}`);
        }
        if (++done % 50 === 0 || done === todo.length) process.stdout.write(`\r  ${done}/${todo.length}`);
      }
    }),
  );
  console.log(`\nDownloaded ${done - failed}, failed ${failed}. Photos are in ${root}.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
