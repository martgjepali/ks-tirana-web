import sharp from "sharp";
import exifReader from "exif-reader";

/**
 * One pipeline for every photo, used by the archive import and (later) by
 * admin uploads: auto-rotate, strip metadata, three WebP sizes by long edge,
 * plus a tiny blurred placeholder.
 *
 * Stored at <storageKey>/{sm,md,lg}.webp — no variants table needed.
 */
export const PHOTO_SIZES = {
  sm: 480, // cards, grids on phones
  md: 1200, // gallery, profile
  lg: 2000, // hero, lightbox
} as const;

export type PhotoSize = keyof typeof PHOTO_SIZES;

const QUALITY: Record<PhotoSize, number> = { sm: 72, md: 78, lg: 80 };

export type ProcessedPhoto = {
  variants: Record<PhotoSize, { data: Buffer; width: number; height: number }>;
  /** Dimensions of the "lg" file — what the database stores. */
  width: number;
  height: number;
  blurDataUrl: string;
  /** Camera wall-clock time "YYYY-MM-DDTHH:MM:SS" (no zone), if the file has EXIF. */
  takenAtLocal: string | null;
};

export async function processPhoto(input: Buffer): Promise<ProcessedPhoto> {
  // Throws on files that are not real images: this doubles as upload validation.
  const meta = await sharp(input, { failOn: "error" }).metadata();
  if (!meta.width || !meta.height) throw new Error("Not a readable image");

  const oriented = sharp(input, { failOn: "error" }).rotate();

  const entries = await Promise.all(
    (Object.keys(PHOTO_SIZES) as PhotoSize[]).map(async (size) => {
      const edge = PHOTO_SIZES[size];
      const { data, info } = await oriented
        .clone()
        .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITY[size], effort: 4 })
        .toBuffer({ resolveWithObject: true });
      return [size, { data, width: info.width, height: info.height }] as const;
    }),
  );
  const variants = Object.fromEntries(entries) as ProcessedPhoto["variants"];

  const blur = await oriented
    .clone()
    .resize({ width: 16, height: 16, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    variants,
    width: variants.lg.width,
    height: variants.lg.height,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
    takenAtLocal: readTakenAt(meta.exif),
  };
}

function readTakenAt(exif: Buffer | undefined): string | null {
  if (!exif) return null;
  try {
    const tags = exifReader(exif);
    const value = tags.Photo?.DateTimeOriginal ?? tags.Image?.DateTime;
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    // exif-reader reads the camera's wall-clock time as if it were UTC.
    const iso = value.toISOString().slice(0, 19);
    const year = Number(iso.slice(0, 4));
    return year >= 1990 && year <= 2100 ? iso : null;
  } catch {
    return null;
  }
}
