import type { PhotoRef } from "@/lib/data/photos";

/**
 * Renders a photo from storage with an exact srcset of our three stored sizes
 * (480/1200/2000 px). A plain <img> is used on purpose: the files are already
 * optimised at import, so no runtime image service is needed on any host.
 * The blurred placeholder shows until the image loads; width/height prevent
 * layout shift.
 */
export function MediaImage({
  photo,
  sizes,
  alt,
  className = "",
  fill = false,
  priority = false,
  position = "center",
}: {
  photo: PhotoRef;
  /** e.g. "(min-width: 1024px) 33vw, 100vw" — tells the browser which size to fetch. */
  sizes: string;
  /** Overrides the stored alt text; pass "" for decorative images. */
  alt?: string;
  className?: string;
  /** Fill the nearest positioned ancestor instead of sizing via className (aspect ratio). */
  fill?: boolean;
  priority?: boolean;
  /** object-position, e.g. "center 25%" to keep faces in frame. */
  position?: string;
}) {
  const wrapper = fill ? "absolute inset-0" : "relative";
  return (
    <div
      className={`photo-zoom ${wrapper} isolate overflow-hidden bg-navy-900 ${className}`}
      style={
        photo.blurDataUrl
          ? { backgroundImage: `url(${photo.blurDataUrl})`, backgroundSize: "cover", backgroundPosition: position }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- files are pre-optimised; see comment above */}
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={alt ?? photo.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="photo-fill absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}
