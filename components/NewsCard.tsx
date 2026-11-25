import Link from "next/link";
import type { NewsItem } from "@/lib/data/site";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

/**
 * News card in the client's two styles:
 *   "row"   — photo left, text right (home "LAJMET E FUNDIT")
 *   "stack" — photo on top, "KATEGORIA | DATA" and title below (Media "Të fundit")
 * `label` is the discipline name or the news category.
 */
export function NewsCard({
  item,
  href,
  label,
  variant = "stack",
}: {
  item: NewsItem;
  href: string;
  label: string;
  variant?: "stack" | "row";
}) {
  const cover = (className: string, sizes: string) =>
    item.cover ? (
      <MediaImage photo={item.cover} alt="" sizes={sizes} className={className} />
    ) : (
      <div className={`flex items-center justify-center bg-navy-900 ${className}`}>
        <Icon name="shield" className="h-10 w-10 text-white/15" />
      </div>
    );

  if (variant === "row") {
    return (
      <Link href={href} className="group grid grid-cols-[minmax(0,9fr)_minmax(0,13fr)] gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500">
        {cover("aspect-square sm:aspect-[1/0.95]", "(min-width: 1024px) 12vw, 40vw")}
        <div className="min-w-0 py-1">
          <p className="flex flex-wrap items-center gap-x-3 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span className="text-blue-500">{label}</span>
            <time dateTime={item.publishedAt} className="font-medium normal-case tracking-normal text-ink/50">
              {item.shortDate}
            </time>
          </p>
          <h3 className="font-display mt-2 text-lg font-bold leading-snug text-strong group-hover:text-blue-500">{item.title}</h3>
          {item.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">{item.excerpt}</p>}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500">
      {cover("aspect-[16/10]", "(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw")}
      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[0.6875rem] font-bold uppercase tracking-wider">
        <span className="text-blue-500">{label}</span>
        <span className="text-ink/30">|</span>
        <time dateTime={item.publishedAt} className="text-ink/50">
          {item.date}
        </time>
      </p>
      <h3 className="mt-1.5 text-[1.0625rem] font-semibold leading-snug text-strong group-hover:text-blue-500">{item.title}</h3>
    </Link>
  );
}
