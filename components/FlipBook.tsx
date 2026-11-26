"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

export type MagazinePage =
  | { kind: "image"; src: string; alt: string }
  | { kind: "photo"; photo: PhotoRef; caption: string }
  | { kind: "back"; title: string };

type Labels = { read: string; close: string; prev: string; next: string; page: string };

const TURN_MS = 650;

/**
 * Magazine reader with turning pages ("REVISTA ME FLIPPING PAGES" in the client's
 * design). Two-page spreads on wide screens, one page on phones; arrows, keys and
 * swipes turn the page. With reduced motion pages change without the 3D turn.
 */
export function FlipBook({ pages, labels, trigger }: { pages: MagazinePage[]; labels: Labels; trigger: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(true);
  // Spread index: 0 = cover alone on the right; spread s shows pages 2s-1 and 2s.
  const [spread, setSpread] = useState(0);
  const [turning, setTurning] = useState<null | "next" | "prev">(null);
  const [flipped, setFlipped] = useState(false);
  const touchX = useRef<number | null>(null);

  const perView = wide ? 2 : 1;
  const lastSpread = wide ? Math.ceil((pages.length - 1) / 2) : pages.length - 1;

  useEffect(() => {
    const mq = matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const go = useCallback(
    (dir: "next" | "prev") => {
      if (turning) return;
      if (dir === "next" && spread >= lastSpread) return;
      if (dir === "prev" && spread <= 0) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setSpread((s) => s + (dir === "next" ? 1 : -1));
        return;
      }
      setTurning(dir);
      setFlipped(false);
      // Start the 3D turn on the next frame so the transition runs.
      requestAnimationFrame(() => requestAnimationFrame(() => setFlipped(true)));
      window.setTimeout(() => {
        setSpread((s) => s + (dir === "next" ? 1 : -1));
        setTurning(null);
        setFlipped(false);
      }, TURN_MS);
    },
    [turning, spread, lastSpread],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  // Which page sits where for a given spread.
  const at = (s: number, side: "left" | "right"): number | null => {
    if (!wide) return side === "right" ? s : null;
    const i = side === "left" ? 2 * s - 1 : 2 * s;
    return i >= 0 && i < pages.length ? i : null;
  };
  const leftNow = at(spread, "left");
  const rightNow = at(spread, "right");
  // During a turn the pages underneath already show the destination spread's outer pages.
  const target = turning === "next" ? spread + 1 : turning === "prev" ? spread - 1 : spread;
  const underLeft = turning === "next" ? leftNow : at(target, "left");
  const underRight = turning === "prev" ? rightNow : at(target, "right");

  const page = (i: number | null) => {
    if (i === null) return <div className="h-full w-full" />;
    const p = pages[i];
    if (p.kind === "image") return <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />;
    if (p.kind === "photo")
      return (
        <div className="relative h-full w-full bg-white">
          <MediaImage photo={p.photo} alt="" sizes="(min-width: 768px) 40vw, 90vw" fill />
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent px-5 pb-4 pt-10 text-sm font-bold uppercase tracking-wider text-white">
            {p.caption}
          </p>
          <span className="absolute right-3 top-3 rounded-sm bg-white/90 px-2 py-0.5 text-xs font-bold text-navy-900">{i + 1}</span>
        </div>
      );
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-navy-900 text-white">
        <Image src="/images/ks-tirana-crest.png" alt="" width={110} height={135} className="h-28 w-auto" />
        <p className="text-xl font-extrabold">{p.title}</p>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">www.kstirana.al</p>
      </div>
    );
  };

  const shown = wide ? [leftNow, rightNow].filter((i) => i !== null).map((i) => i! + 1) : [spread + 1];
  const counter = labels.page.replace("{n}", shown.join("–")).replace("{total}", String(pages.length));

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-navy-950/95 p-0 text-white backdrop:bg-black/80"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? "next" : "prev");
          touchX.current = null;
        }}
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 text-sm text-white/75">
              <span aria-live="polite">{counter}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6">
              <div
                className="relative grid aspect-[3/4] h-full max-h-[80vh] max-w-full md:aspect-[3/2]"
                style={{ perspective: "2400px", gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
              >
                {wide && <div className="relative overflow-hidden bg-white/5 shadow-2xl">{page(underLeft)}</div>}
                <div className="relative overflow-hidden bg-white/5 shadow-2xl">{page(underRight)}</div>

                {/* The turning leaf: front = page being lifted, back = page landing on the other side. */}
                {turning && (
                  <div
                    className="absolute inset-y-0 [transform-style:preserve-3d]"
                    style={{
                      left: wide ? (turning === "next" ? "50%" : "0") : "0",
                      width: wide ? "50%" : "100%",
                      transformOrigin: wide ? (turning === "next" ? "left center" : "right center") : "left center",
                      transition: `transform ${TURN_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1)`,
                      transform: flipped ? `rotateY(${turning === "next" ? -180 : 180}deg)` : "rotateY(0deg)",
                      opacity: wide ? 1 : flipped ? 0 : 1,
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden shadow-2xl [backface-visibility:hidden]">
                      {page(turning === "next" ? rightNow : wide ? leftNow : rightNow)}
                    </div>
                    <div className="absolute inset-0 overflow-hidden shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {page(turning === "next" ? at(spread + 1, "left") : at(spread - 1, "right"))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => go("prev")}
                disabled={spread === 0}
                aria-label={labels.prev}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                <Icon name="chevronRight" className="h-5 w-5 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go("next")}
                disabled={spread >= lastSpread}
                aria-label={labels.next}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                <Icon name="chevronRight" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
