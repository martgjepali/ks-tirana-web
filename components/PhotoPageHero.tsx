import type { ReactNode } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import { Reveal } from "./motion/Reveal";
import { MediaImage } from "./MediaImage";

/**
 * Page hero from the client's design: a full-width club photo darkened from
 * the left, a letter-spaced eyebrow, a big uppercase title (one line can be
 * blue, as in "HISTORIA / BARDHEBLU"), a short text, actions and an optional
 * handwritten accent on the right ("Sot më mirë se dje").
 */
export function PhotoPageHero({
  photo,
  eyebrow,
  title,
  accentLine,
  body,
  children,
  script,
  side,
  size = "md",
  archive = false,
  position = "center 35%",
}: {
  photo: PhotoRef | null;
  eyebrow?: string;
  title: string[];
  /** Index of the title line shown in blue. */
  accentLine?: number;
  body?: string;
  children?: ReactNode;
  script?: string[];
  /** Small stacked words at the bottom right ("SPORT / KOMUNITET / KRENARI / TIRANË"). */
  side?: string[];
  size?: "sm" | "md" | "lg";
  /** Black-and-white archive look (History). */
  archive?: boolean;
  position?: string;
}) {
  // Heights follow the mockups, where the content below starts within the first screen.
  const height = { sm: "py-10 lg:py-12", md: "py-12 min-h-[340px] lg:min-h-[360px]", lg: "py-12 min-h-[400px] lg:min-h-[430px]" }[size];
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      {photo && (
        <MediaImage
          photo={photo}
          alt=""
          sizes="100vw"
          fill
          priority
          position={position}
          className={`hero-media ${archive ? "archive" : ""}`}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: archive
            ? "linear-gradient(90deg, rgba(1,26,62,0.97) 22%, rgba(1,26,62,0.72) 50%, rgba(2,46,110,0.45) 100%)"
            : "linear-gradient(95deg, rgba(1,26,62,0.94) 18%, rgba(1,26,62,0.7) 42%, rgba(1,26,62,0.15) 72%, rgba(1,26,62,0.05) 100%)",
        }}
      />
      <div className={`wrap relative flex flex-col justify-center ${height}`}>
        <Reveal>
          {eyebrow && <p className="eyebrow text-white/85">{eyebrow}</p>}
          <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-[4.75rem]">
            {title.map((line, i) => (
              <span key={i} className={`block ${i === accentLine ? "text-blue-400" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          {body && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 lg:text-lg">{body}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </Reveal>
        {script && (
          <p
            aria-hidden
            className="script absolute right-6 top-1/2 hidden -translate-y-1/2 -rotate-[8deg] text-right text-5xl text-white md:block lg:right-10 lg:text-6xl"
          >
            {script.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="ml-auto mt-1 block h-[3px] w-36 rounded-full bg-blue-400" />
          </p>
        )}
        {side && (
          <ul aria-hidden className="absolute bottom-10 right-6 hidden space-y-1 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-white/90 md:block lg:right-10">
            {side.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
