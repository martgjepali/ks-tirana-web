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
  /** Which driver is active ("local" or "blob"), for health checks. */
  readonly kind: "local" | "blob";
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
    kind: "local",
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
 * Vercel Blob driver (private store). Authenticates with BLOB_READ_WRITE_TOKEN when
 * given, otherwise with the deployment's Vercel OIDC identity + BLOB_STORE_ID
 * (what "Connect Project" sets up). Files are served through the /media route, which sets long cache headers so the CDN
 * keeps them. Keys keep the same layout as on disk: photos/<id>/<size>.webp.
 */
export function createBlobStorage(token: string | undefined, baseUrl: string): Storage {
  const base = baseUrl.replace(/\/+$/, "");
  // Loaded lazily so local development never needs the Blob SDK at runtime.
  const sdk = () => import("@vercel/blob");

  return {
    kind: "blob",
    async put(key, data, contentType) {
      assertKey(key);
      const { put } = await sdk();
      await put(key, data, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType, token });
    },
    async get(key) {
      assertKey(key);
      const { get } = await sdk();
      const result = await get(key, { access: "private", token });
      if (!result || !("stream" in result) || !result.stream) return null;
      return Buffer.from(await new Response(result.stream).arrayBuffer());
    },
    async exists(key) {
      assertKey(key);
      const { head } = await sdk();
      try {
        await head(key, { token });
        return true;
      } catch {
        return false;
      }
    },
    async remove(keyOrPrefix) {
      assertKey(keyOrPrefix);
      const { del, list } = await sdk();
      if (!keyOrPrefix.endsWith("/")) return void (await del(keyOrPrefix, { token }));
      let cursor: string | undefined;
      do {
        const page = await list({ prefix: keyOrPrefix, cursor, token });
        if (page.blobs.length) await del(page.blobs.map((b) => b.url), { token });
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    },
    url(key) {
      assertKey(key);
      return `${base}/${key}`;
    },
  };
}

let instance: Storage | undefined;

/**
 * The configured storage. STORAGE_DRIVER picks it explicitly ("local" | "blob");
 * by default a connected Vercel Blob store (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN)
 * is used on Vercel, and the local STORAGE_DIR everywhere else. Public URLs always start
 * with MEDIA_BASE_URL (default /media).
 */
export function getStorage(): Storage {
  if (instance) return instance;
  const base = process.env.MEDIA_BASE_URL ?? "/media";
  const token = process.env.BLOB_READ_WRITE_TOKEN || undefined;
  const hasBlob = Boolean(token || process.env.BLOB_STORE_ID);
  const driver = process.env.STORAGE_DRIVER ?? (hasBlob && process.env.VERCEL ? "blob" : "local");
  instance =
    driver === "blob"
      ? createBlobStorage(token, base)
      : createLocalStorage(process.env.STORAGE_DIR ?? "./storage", base);
  return instance;
}
