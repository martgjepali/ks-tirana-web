/** Stored photo sizes by long edge: <storageKey>/{sm,md,lg}.webp. */
export const PHOTO_SIZES = {
  sm: 480, // cards, grids on phones
  md: 1200, // gallery, profile
  lg: 2000, // hero, lightbox
} as const;

export type PhotoSize = keyof typeof PHOTO_SIZES;
