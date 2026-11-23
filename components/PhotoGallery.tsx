"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

/**
 * Photo grid with a keyboard- and swipe-friendly lightbox.
 * Uses the native <dialog> element for focus trapping and Esc-to-close.
 */
export function PhotoGallery({
  photos,
  labels,
}: {
  photos: PhotoRef[];
  labels: { open: string; close: string; previous: string; next: string; counter: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);

  const show = useCallback(
    (i: number) => setIndex(((i % photos.length) + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) el.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft") show(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, show]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id} className="reveal">
            <button
              type="button"
              onClick={() => show(i)}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              aria-label={`${labels.open}: ${photo.alt}`}
            >
              <MediaImage
                photo={photo}
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
                className="aspect-[4/3]"
                position="center 30%"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart.current === null || index === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
          touchStart.current = null;
        }}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-navy-950/95 p-0 text-white backdrop:bg-black/80"
      >
        {current && (
          <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && setIndex(null)}>
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-white/70">
              <span>
                {labels.counter.replace("{n}", String(index! + 1)).replace("{total}", String(photos.length))}
              </span>
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label={labels.close}
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16"
              onClick={(e) => e.target === e.currentTarget && setIndex(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised storage file */}
              <img
                key={current.id}
                src={current.large}
                srcSet={current.srcSet}
                sizes="100vw"
                alt={current.alt}
                width={current.width}
                height={current.height}
                className="max-h-full max-w-full rounded-md object-contain"
                style={current.blurDataUrl ? { backgroundImage: `url(${current.blurDataUrl})`, backgroundSize: "cover" } : undefined}
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => show(index! - 1)}
                    className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
                    aria-label={labels.previous}
                  >
                    <Icon name="chevronRight" className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => show(index! + 1)}
                    className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
                    aria-label={labels.next}
                  >
                    <Icon name="chevronRight" className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {current.alt && <p className="px-4 pb-4 text-center text-sm text-white/60">{current.alt}</p>}
          </div>
        )}
      </dialog>
    </>
  );
}
