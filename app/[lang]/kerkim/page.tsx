import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { search } from "@/lib/data/site";
import { MediaImage } from "@/components/MediaImage";
import { NewsCard } from "@/components/NewsCard";
import { Icon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/kerkim">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.search.title} · KS Tirana`, robots: { index: false } };
}

/** "Kërkimi: gjetje e shpejtë e sportistëve, ekipeve dhe lajmeve" — client proposal, slide 11. */
export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/kerkim">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const raw = (await searchParams).q;
  const q = (typeof raw === "string" ? raw : "").trim().slice(0, 80);
  const dict = await getDictionary(lang);
  const s = dict.search;
  const results = q.length >= 2 ? await search(lang, q) : null;
  const total = results ? results.people.length + results.disciplines.length + results.news.length : 0;

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="wrap py-12 lg:py-16">
          <h1 className="display text-5xl lg:text-7xl">{s.title}</h1>
          <p className="mt-3 text-white/80">{s.subtitle}</p>
          <form action={`/${lang}/kerkim`} role="search" className="mt-8 flex max-w-2xl gap-2">
            <label className="relative flex-1">
              <span className="sr-only">{s.title}</span>
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={s.placeholder}
                autoFocus={!q}
                className="field !py-3.5 !pl-12 !text-base"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              {s.submit}
            </button>
          </form>
        </div>
      </section>

      <section className="min-h-[40vh] bg-paper py-10 lg:py-12">
        <div className="wrap space-y-12">
          {q.length > 0 && q.length < 2 && <p className="text-ink/60">{s.hint}</p>}
          {results && total === 0 && <p className="text-ink/60">{s.none.replace("{q}", q)}</p>}

          {results && results.disciplines.length > 0 && (
            <div>
              <h2 className="section-label">{s.teams}</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {results.disciplines.map((d) => (
                  <li key={d.href}>
                    <Link href={d.href} className="group relative block aspect-square overflow-hidden rounded-sm bg-navy-900 text-white">
                      {d.cover && <MediaImage photo={d.cover} alt="" sizes="(min-width: 1024px) 16vw, 45vw" fill />}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
                      <span className="display condensed absolute inset-x-0 bottom-0 p-3 text-xl">{d.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results && results.people.length > 0 && (
            <div>
              <h2 className="section-label">{s.athletes}</h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {results.people.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className="group flex items-center gap-3 rounded-sm border border-line bg-card p-3 hover:border-blue-500">
                      {p.portrait ? (
                        <MediaImage photo={p.portrait} alt="" sizes="56px" className="h-14 w-14 shrink-0 rounded-full" position="center 20%" />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface">
                          <Icon name="users" className="h-6 w-6 text-navy-700/30" />
                        </span>
                      )}
                      <span>
                        <span className="block font-bold text-strong group-hover:text-blue-500">{p.name}</span>
                        <span className="text-sm text-ink/60">{p.discipline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results && results.news.length > 0 && (
            <div>
              <h2 className="section-label">{s.news}</h2>
              <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {results.news.map((item) => (
                  <li key={item.slug}>
                    <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} label={item.discipline ?? dict.news.categories[item.category]} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
