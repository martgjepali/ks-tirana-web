"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

export type HeroSlide = {
  photo: PhotoRef | null;
  eyebrow: string;
  title: string[];
  /** Brand slides use the huge title ("NE JEMI TIRANA"); news slides a smaller one. */
  big: boolean;
  body: string | null;
  cta: { href: string; label: string };
};

/**
 * Home hero from the client's design: full-width photo, text on the left and
 * "01 02 03" slide numbers bottom-right. Cross-fades every 7 s; pauses on
 * hover or focus and never moves on its own with reduced motion.
 */
export function HeroSlider({ slides, slideLabel }: { slides: HeroSlide[]; slideLabel: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      className="relative overflow-hidden bg-navy-950 text-white"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative grid min-h-[420px] lg:min-h-[440px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className="hero-slide relative col-start-1 row-start-1 flex"
            data-active={i === index}
            aria-hidden={i !== index}
            aria-roledescription="slide"
          >
            {s.photo && (
              <MediaImage photo={s.photo} alt="" sizes="100vw" fill priority={i === 0} position="center 30%" className="hero-media" />
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(95deg, rgba(1,26,62,0.95) 16%, rgba(1,26,62,0.7) 38%, rgba(1,26,62,0.12) 68%, transparent), linear-gradient(0deg, rgba(1,26,62,0.55), transparent 40%)",
              }}
            />
            <div className="wrap relative flex flex-col justify-center py-12">
              <p className="eyebrow w-fit border-b-2 border-white pb-1 text-white">{s.eyebrow}</p>
              <h1
                className={`display mt-6 max-w-3xl ${
                  s.big ? "text-[3.5rem] leading-[0.9] sm:text-[4.5rem] lg:text-[5.75rem]" : "text-4xl sm:text-5xl lg:text-[3.5rem]"
                }`}
              >
                {s.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              {s.body && <p className="mt-6 max-w-sm text-lg leading-snug text-white/90 lg:text-xl">{s.body}</p>}
              <Link href={s.cta.href} tabIndex={i === index ? undefined : -1} className="btn btn-primary mt-8 w-fit">
                {s.cta.label}
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="wrap pointer-events-none absolute inset-x-0 bottom-6 flex justify-end">
          <div className="pointer-events-auto flex gap-5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={slideLabel.replace("{n}", String(i + 1))}
                aria-current={i === index}
                className={`border-b-2 pb-1 text-sm font-semibold tabular-nums transition ${
                  i === index ? "border-white text-white" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
