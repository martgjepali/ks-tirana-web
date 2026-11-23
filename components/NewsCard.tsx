import Link from "next/link";
import type { NewsItem } from "@/lib/data/site";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

export function NewsCard({ item, href, readMore }: { item: NewsItem; href: string; readMore?: string }) {
  return (
    <Link
      href={href}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      {item.cover ? (
        <MediaImage photo={item.cover} alt="" sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw" className="aspect-[16/10]" />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#152c62,#0a1730_60%)]">
          <Icon name="shield" className="h-12 w-12 text-white/15" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          {item.discipline ? `${item.discipline} · ` : ""}
          <time dateTime={item.publishedAt}>{item.date}</time>
        </p>
        <h3 className="font-display mt-2 text-lg font-semibold leading-snug text-ink group-hover:text-blue-600">
          {item.title}
        </h3>
        {item.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">{item.excerpt}</p>}
        {readMore && <span className="link-underline mt-auto w-fit pt-4 text-sm font-semibold text-navy-900">{readMore}</span>}
      </div>
    </Link>
  );
}
