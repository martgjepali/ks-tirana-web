import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/MediaImage";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";
import { SponsorBand } from "@/components/SponsorBand";
import { Jersey } from "@/components/Jersey";
import { CLUB, getHeroPhoto, getNews, getNextAndLast } from "@/lib/data/site";
import { SPORT_GROUPS } from "@/lib/sport-groups";

/*
 * Home page from the client's final design (page 01): navy hero with the crest,
 * the sponsor band (main supporter + sliding logos), latest news with the next
 * match, and the sports tiles; then the academy, shop and history blocks.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, news, { next, last }, heroPhoto, academyPhoto, historyPhoto] = await Promise.all([
    getDictionary(lang),
    getNews(lang, 6),
    getNextAndLast(lang),
    getHeroPhoto(lang, "volejboll-femra", 0),
    getHeroPhoto(lang, "basketboll-meshkuj", 1),
    getHeroPhoto(lang, "volejboll-meshkuj", 2),
  ]);
  const h = dict.home;
  const label = (item: (typeof news)[number]) => item.discipline ?? dict.news.categories[item.category];

  return (
    <>
      {/* HERO */}
      <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="px-6 relative flex items-center gap-8 py-12 lg:mr-0 lg:max-w-none lg:py-14 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]">
          <Reveal className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">{h.hero.eyebrow}</p>
            <h1 className="display mt-2 text-5xl sm:text-6xl lg:text-[4.25rem]">{h.hero.title[0]}</h1>
            <p className="mt-3 text-xl font-bold lg:text-2xl">{h.hero.subtitle}</p>
            <p className="mt-8 max-w-lg text-base text-white/90 lg:text-lg">{h.hero.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${lang}/sportet`} className="btn btn-primary min-w-48 !justify-start !text-base !normal-case !tracking-normal">
                {h.hero.cta}
              </Link>
              <Link href={`/${lang}/kalendari`} className="btn btn-primary min-w-48 !justify-start !text-base !normal-case !tracking-normal">
                {h.hero.ctaCalendar}
              </Link>
            </div>
          </Reveal>
          <Image
            src="/images/ks-tirana-crest.png"
            alt=""
            width={180}
            height={221}
            priority
            className="hidden h-auto w-36 shrink-0 drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] md:block lg:w-44 xl:w-48"
          />
        </div>
        {heroPhoto && (
          <MediaImage photo={heroPhoto} alt="" sizes="(min-width: 1024px) 38vw, 100vw" priority className="min-h-[260px] lg:min-h-[400px]" position="center 30%" />
        )}
      </section>

      {/* SPONSORS */}
      <SponsorBand body={h.sponsors.supporterBody} label={h.sponsors.partners} />

      {/* 01–03 LATEST NEWS + NEXT MATCH */}
      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)] lg:gap-0">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="section-label">{h.news.title}</h2>
              <Link href={`/${lang}/lajme`} className="link-arrow">
                {h.news.all}
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5">
              {news.length > 0 ? (
                <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {news.slice(0, 3).map((item) => (
                    <StaggerItem key={item.slug}>
                      <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} label={label(item)} variant="row" />
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              ) : (
                <EmptyState icon="mail" text={h.news.empty} />
              )}
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="section-label">{h.next.title}</h2>
              <Link href={`/${lang}/kalendari`} className="link-arrow">
                {h.next.calendar}
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>
            <Reveal delay={0.1} className="mt-5">
              <div className="rounded-md bg-navy-900 p-5 text-white">
                {next ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] font-bold uppercase tracking-wider text-white/85">
                      <span>
                        {next.discipline.name}
                        {next.competition && <> • {next.competition}</>}
                      </span>
                      <time dateTime={next.startsAt}>
                        {next.weekday}, {next.day} • {next.time}
                      </time>
                    </div>
                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {[next.home, next.away].map((team, i) => (
                        <div key={i} className={`flex items-center gap-3 ${i === 0 ? "justify-end text-right" : "order-3"}`}>
                          {i === 1 && <Jersey club={team === CLUB} />}
                          <span className="font-display text-sm font-extrabold uppercase leading-tight xl:text-base">{team}</span>
                          {i === 0 && <Jersey club={team === CLUB} />}
                        </div>
                      ))}
                      <span className="order-2 text-lg font-bold text-white/50">{h.next.vs}</span>
                    </div>
                    {next.venue && (
                      <p className="mt-5 flex items-center justify-center gap-2 text-[0.6875rem] font-bold uppercase tracking-wider text-white/85">
                        <Icon name="pin" className="h-4 w-4 shrink-0" />
                        {next.venue}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="py-6 text-center text-sm leading-relaxed text-white/70">{h.next.empty}</p>
                )}
                {last && (
                  <p className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs text-white/70">
                    <span className="font-bold uppercase tracking-wider">{h.next.lastResult}</span>
                    <span>
                      {last.home} <strong className="text-white">{last.score}</strong> {last.away}
                    </span>
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 SPORTS */}
      <section className="bg-paper pb-12">
        <div className="wrap">
          <div className="flex items-center justify-between gap-4">
            <h2 className="section-label">{h.sports.title}</h2>
            <Link href={`/${lang}/sportet`} className="link-arrow">
              {h.sports.all}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <StaggerGroup className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {SPORT_GROUPS.map((g) => (
              <StaggerItem key={g.key}>
                <Link
                  href={g.slugs.length === 1 ? `/${lang}/sportet/${g.slugs[0]}` : `/${lang}/sportet?sport=${g.key}`}
                  className="group relative flex h-full min-h-[88px] flex-col items-center justify-center gap-2 rounded-sm bg-surface px-3 py-4 text-center text-strong transition hover:bg-blue-500 hover:text-white"
                >
                  <Icon name={g.icon} className="h-7 w-7" />
                  <span className="text-sm font-bold">{g.name[lang]}</span>
                  <Icon
                    name="arrowRight"
                    className="absolute bottom-3 right-3 h-4 w-4 opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 05 ACADEMY + 06 SHOP */}
      <section className="grid grid-cols-1 gap-4 bg-paper lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Link href={`/${lang}/akademia`} className="group relative flex min-h-[260px] overflow-hidden bg-navy-900 text-white">
          {academyPhoto && (
            <div className="absolute inset-y-0 left-0 w-full sm:w-1/2">
              <MediaImage photo={academyPhoto} alt="" sizes="(min-width: 1024px) 32vw, 100vw" fill position="center 30%" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-900/40 to-navy-900" />
            </div>
          )}
          <div className="relative ml-auto flex w-full flex-col justify-center bg-navy-900/80 p-8 sm:w-[55%] sm:bg-transparent lg:p-10">
            <p className="eyebrow text-white/80">{h.academy.eyebrow}</p>
            <h2 className="display mt-3 text-3xl lg:text-[2.6rem]">
              {h.academy.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
            <p className="mt-3 text-white/85">{h.academy.body}</p>
            <span className="btn btn-primary mt-6 w-fit">
              {h.academy.cta}
              <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <Link href={`/${lang}/dyqani`} className="group relative flex min-h-[260px] items-center overflow-hidden bg-surface">
          <div className="relative z-10 p-8 lg:p-10">
            <p className="eyebrow text-ink/60">{h.shop.eyebrow}</p>
            <h2 className="display mt-3 text-3xl text-strong lg:text-[2.6rem]">
              {h.shop.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
            <p className="mt-3 text-ink/70">{h.shop.body}</p>
            <span className="btn btn-primary mt-6 w-fit">
              {h.shop.cta}
              <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
          <Image
            src="/images/ks-tirana-crest.png"
            alt=""
            width={180}
            height={221}
            className="pointer-events-none absolute -right-6 top-1/2 h-[85%] w-auto -translate-y-1/2 opacity-20 transition duration-500 group-hover:scale-105 sm:right-6 sm:opacity-100"
          />
        </Link>
      </section>

      {/* 06 HISTORY */}
      <section className="bg-paper py-14 lg:py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow text-blue-500">{h.history.eyebrow}</p>
            <h2 className="display mt-3 text-4xl text-strong lg:text-5xl">“{h.history.title}.”</h2>
            <span className="rule mt-5" />
            <p className="mt-5 max-w-md text-ink/70">{h.history.body}</p>
            <Link href={`/${lang}/klubi`} className="link-arrow mt-6">
              {h.history.cta}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          {historyPhoto && (
            <Reveal y={0}>
              <div className="relative">
                <MediaImage photo={historyPhoto} sizes="(min-width: 1024px) 45vw, 100vw" className="archive aspect-[16/10]" />
                <div className="pointer-events-none absolute inset-0 bg-blue-600/25 mix-blend-multiply" />
              </div>
            </Reveal>
          )}
        </div>
      </section>

    </>
  );
}
