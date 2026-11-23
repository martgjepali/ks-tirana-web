import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where photo files live. Code only ever talks to this interface, so moving
 * from the local disk (dev, VPS) to an S3-compatible bucket later means adding
 * a driver, not changing callers.
 *
 * Keys are forward-slash relative paths, e.g. "photos/<uuid>/md.webp".
 */
export interface Storage {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  exists(key: string): Promise<boolean>;
  /** Removes one file or everything under a "folder/" prefix. */
  remove(keyOrPrefix: string): Promise<void>;
  /** Public URL for a key (served by /media locally, by Caddy/nginx on a VPS). */
  url(key: string): string;
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*(\/[a-z0-9][a-z0-9._-]*)*\/?$/i;

function assertKey(key: string) {
  if (!KEY_PATTERN.test(key) || key.split("/").some((part) => part === "..")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}

export function createLocalStorage(rootDir: string, baseUrl: string): Storage {
  const root = path.resolve(rootDir);
  const base = baseUrl.replace(/\/+$/, "");

  function resolve(key: string) {
    assertKey(key);
    const full = path.resolve(root, key);
    if (full !== root && !full.startsWith(root + path.sep)) {
      throw new Error(`Storage key escapes the storage folder: ${key}`);
    }
    return full;
  }

  return {
    async put(key, data) {
      const full = resolve(key);
      await mkdir(path.dirname(full), { recursive: true });
      // Write to a temp file first so a crash never leaves a half-written image.
      const temp = `${full}.${process.pid}.tmp`;
      await writeFile(temp, data);
      await rm(full, { force: true });
      await rename(temp, full);
    },
    async get(key) {
      try {
        return await readFile(resolve(key));
      } catch {
        return null;
      }
    },
    async exists(key) {
      try {
        return (await stat(resolve(key))).isFile();
      } catch {
        return false;
      }
    },
    async remove(keyOrPrefix) {
      await rm(resolve(keyOrPrefix), { recursive: true, force: true });
    },
    url(key) {
      assertKey(key);
      return `${base}/${key}`;
    },
  };
}

/**
 * Public URL prefix of a Vercel Blob store, derived from its token
 * ("vercel_blob_rw_<storeId>_<secret>" → https://<storeId>.public.blob.vercel-storage.com),
 * so a Vercel deployment needs no extra setting once the store is connected.
 */
function blobBaseUrl(): string | undefined {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId ? `https://${storeId}.public.blob.vercel-storage.com` : undefined;
}

let instance: Storage | undefined;

/**
 * The configured storage. Files are read/written on STORAGE_DIR; public URLs use
 * MEDIA_BASE_URL, else a connected Vercel Blob store, else the local /media route.
 */
export function getStorage(): Storage {
  instance ??= createLocalStorage(
    process.env.STORAGE_DIR ?? "./storage",
    process.env.MEDIA_BASE_URL ?? blobBaseUrl() ?? "/media",
  );
  return instance;
}
