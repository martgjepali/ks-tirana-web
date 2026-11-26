import { getStorage } from "@/lib/storage";

/**
 * Serves processed photos from the configured storage: STORAGE_DIR locally, the
 * private Vercel Blob store on Vercel. On a VPS, Caddy can serve /media straight
 * from disk instead.
 *
 * Files never change once written (each photo has its own random id), so they
 * are cached by browsers for a year.
 */
const TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  pdf: "application/pdf", // media kit, org chart (uploaded in admin)
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");
  const type = TYPES[key.split(".").pop()?.toLowerCase() ?? ""];
  if (!type) return new Response("Not found", { status: 404 });

  let data: Buffer | null;
  try {
    data = await getStorage().get(key);
  } catch {
    data = null; // invalid key
  }
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(data.length),
      // Browsers and the CDN (s-maxage) keep each file for a year.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
