import "server-only";
import { PHOTO_SIZES, type PhotoSize } from "@/lib/images/sizes";
import { getStorage } from "@/lib/storage";
import type { Locale } from "./locale";

/** A photo as the UI needs it: URLs for each stored size plus layout info. */
export type PhotoRef = {
  id: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
  src: string; // md
  srcSet: string;
  large: string; // lg, for the lightbox
};

export type PhotoRow = {
  id: string;
  storage_key: string;
  width: number;
  height: number;
  blur_data_url: string | null;
  alt_sq: string | null;
  alt_en: string | null;
};

/** Columns to select (prefix with a table alias) to build a PhotoRef. */
export const PHOTO_COLUMNS = (a: string) =>
  `${a}.id, ${a}.storage_key, ${a}.width, ${a}.height, ${a}.blur_data_url, ${a}.alt_sq, ${a}.alt_en`;

export function toPhotoRef(row: PhotoRow, lang: Locale): PhotoRef {
  const storage = getStorage();
  const longEdge = Math.max(row.width, row.height);
  // Width of each stored size: long edge capped at the size, never upscaled.
  const widthOf = (size: PhotoSize) =>
    Math.round((row.width * Math.min(PHOTO_SIZES[size], longEdge)) / longEdge);
  const url = (size: PhotoSize) => storage.url(`${row.storage_key}/${size}.webp`);
  const sizes = (Object.keys(PHOTO_SIZES) as PhotoSize[]).filter(
    // Skip sizes identical to a smaller one (small originals).
    (size, i, all) => i === 0 || widthOf(size) > widthOf(all[i - 1]),
  );
  return {
    id: row.id,
    alt: (lang === "en" ? row.alt_en : row.alt_sq) ?? row.alt_sq ?? "",
    width: row.width,
    height: row.height,
    blurDataUrl: row.blur_data_url,
    src: url("md"),
    srcSet: sizes.map((size) => `${url(size)} ${widthOf(size)}w`).join(", "),
    large: url("lg"),
  };
}
