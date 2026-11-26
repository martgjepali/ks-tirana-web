import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getLatestPhotos, getNews, type NewsFilter, type NewsItem } from "@/lib/data/site";
import { getSiteSettings } from "@/lib/data/club";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";
import { MediaImage } from "@/components/MediaImage";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/lajme">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.news.title} · KS Tirana`, description: dict.news.subtitle };
}

const FILTERS: NewsFilter[] = ["sports", "academy", "interviews"];

/** "LAJME & MEDIA" — client proposal, slide 20. */
export default async function NewsPage({ params, searchParams }: PageProps<"/[lang]/lajme">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const requested = (await searchParams).filtri;
  const filter = FILTERS.find((f) => f === requested);
  const [dict, news, photos, settings] = await Promise.all([
    getDictionary(lang), getNews(lang, 48, { filter }), getLatestPhotos(lang, 5), getSiteSettings(),
  ]);
  const n = dict.news;
  const label = (item: NewsItem) => item.discipline ?? n.categories[item.category];
  const [lead, ...rest] = news;
  const side = rest.slice(0, 2);
  const latest = rest.slice(2);
  const filterLabels: Record<NewsFilter, string> = { sports: n.filters.sports, academy: n.filters.academy, interviews: n.filters.interviews };

  const overlay = (item: NewsItem, big: boolean) => (
    <Link
      href={`/${lang}/lajme/${item.slug}`}
      className={`group relative block overflow-hidden rounded-sm bg-navy-900 text-white ${big ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/8]"}`}
    >
      {item.cover && (
        <MediaImage photo={item.cover} alt="" sizes={big ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 35vw, 100vw"} fill />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 lg:p-6">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-white/90">
            {label(item)} <span className="mx-1.5 text-white/50">|</span> {item.date}
          </p>
          <h2 className={`mt-2 font-bold leading-tight ${big ? "text-2xl lg:text-[2.1rem]" : "text-lg lg:text-xl"}`}>{item.title}</h2>
        </div>
        <Icon name="arrowRight" className="h-6 w-6 shrink-0 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );

  return (
    <>
      <section className="bg-paper pt-10 lg:pt-12">
        <div className="wrap flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h1 className="display text-6xl text-strong lg:text-[5.5rem]">{n.title}</h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">{n.subtitle}</p>
          </Reveal>
          <nav className="flex flex-wrap gap-2 lg:pb-3" aria-label={n.title}>
            <Link href={`/${lang}/lajme`} className="chip" aria-current={filter ? undefined : "true"}>
              {n.filters.all}
            </Link>
            {FILTERS.map((f) => (
              <Link key={f} href={`/${lang}/lajme?filtri=${f}`} className="chip" aria-current={filter === f ? "true" : undefined}>
                {filterLabels[f]}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Lead story + two more */}
      <section className="bg-paper py-6 lg:py-8">
        <div className="wrap">
          {lead ? (
            <div className={`grid grid-cols-1 gap-4 ${side.length > 0 ? "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : ""}`}>
              {overlay(lead, true)}
              {side.length > 0 && <div className="grid grid-cols-1 gap-4">{side.map((item) => <div key={item.slug}>{overlay(item, false)}</div>)}</div>}
            </div>
          ) : (
            <EmptyState icon="mail" text={n.empty} />
          )}
        </div>
      </section>

      {/* Latest photos + media centre */}
      <section className="bg-[#eef6fd] py-6 [:root[data-theme=dark]_&]:bg-surface">
        <div className="wrap grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,18rem)]">
          <div>
            <h2 className="display text-3xl text-blue-500">{n.photos.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{n.photos.body}</p>
          </div>
          <PhotoGallery photos={photos} labels={dict.sports.lightbox} gridClassName="grid-cols-3 gap-3 sm:grid-cols-5" />
          <div className="flex h-full flex-col justify-center gap-3 rounded-sm bg-navy-800 p-5 text-white">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40">
                <Icon name="camera" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-lg font-bold">{n.mediaCenter.title}</p>
                <p className="text-xs leading-snug text-white/80">{n.mediaCenter.body}</p>
              </div>
            </div>
            <Link href={`/${lang}/kontakt?subjekti=media`} className="btn btn-primary !py-2.5">
              {n.mediaCenter.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            {settings.mediaKitUrl && (
              <a href={settings.mediaKitUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:underline" target="_blank" rel="noreferrer">
                <Icon name="download" className="h-4 w-4" />
                {n.mediaCenter.download}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Latest */}
      {latest.length > 0 && (
        <section className="bg-paper py-10 lg:py-12">
          <div className="wrap">
            <div className="flex items-center justify-between gap-4">
              <h2 className="display text-2xl normal-case text-strong">{n.latest}</h2>
              {filter && (
                <Link href={`/${lang}/lajme`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
                  {n.all}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              )}
            </div>
            <StaggerGroup className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {latest.map((item) => (
                <StaggerItem key={item.slug}>
                  <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} label={label(item)} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </>
  );
}
