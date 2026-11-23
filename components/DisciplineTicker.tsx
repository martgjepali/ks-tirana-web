import Link from "next/link";
import { Icon } from "./Icons";
import { sportIcon } from "@/lib/sport-icons";

/**
 * Endless strip of every discipline under the home hero. The list is rendered
 * twice and the track slides by half its width, so the loop is seamless.
 * Pauses on hover/focus; with reduced motion it is a static, scrollable row.
 */
export function DisciplineTicker({ lang, items }: { lang: string; items: { slug: string; name: string }[] }) {
  if (items.length === 0) return null;
  const row = (copy: number) =>
    items.map((d) => (
      <li key={`${copy}-${d.slug}`} className="flex shrink-0 items-center">
        <Link
          href={`/${lang}/sportet/${d.slug}`}
          tabIndex={copy === 0 ? undefined : -1}
          className="font-display flex items-center gap-2.5 px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:text-white"
        >
          <Icon name={sportIcon(d.slug)} className="h-4 w-4 text-sky-300" />
          {d.name}
        </Link>
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden />
      </li>
    ));

  return (
    <div className="marquee relative overflow-x-auto bg-blue-600 py-3.5 [scrollbar-width:none] motion-safe:overflow-hidden">
      <ul className="marquee-track flex w-max">
        {row(0)}
        <li aria-hidden className="contents">
          <ul className="flex">{row(1)}</ul>
        </li>
      </ul>
    </div>
  );
}
