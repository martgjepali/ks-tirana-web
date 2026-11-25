import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getClubStats, getHeroPhoto, getShowcasePhotos } from "@/lib/data/site";
import { MediaImage } from "@/components/MediaImage";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export async function generateMetadata({ params }: PageProps<"/[lang]/klubi">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.history} · KS Tirana`, description: dict.history.hero.body };
}

/** Archive-style photos for the three cards (Legjendat, Trofetë, Rekordet). */
const CARD_FROM = ["basketboll-meshkuj", "mundje-e-lire", "atletike"];

/** "HISTORIA BARDHEBLU" — client proposal, slide 09/14. */
export default async function HistoryPage({ params }: PageProps<"/[lang]/klubi">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hero, quotePhoto, stats, ...cardSets] = await Promise.all([
    getDictionary(lang),
    getHeroPhoto(lang, "volejboll-meshkuj"),
    getHeroPhoto(lang, "volejboll-femra", 2),
    getClubStats(),
    ...CARD_FROM.map((d) => getShowcasePhotos(lang, { discipline: d, orientation: "portrait", limit: 1 })),
  ]);
  const h = dict.history;
  const numbers = [
    { value: "1920", label: h.numbers.founded },
    { value: String(stats.disciplines), label: h.numbers.disciplines },
    { value: String(stats.people), label: h.numbers.people },
    { value: String(stats.photos), label: h.numbers.photos },
  ];

  return (
    <>
      {/* Hero with timeline */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {hero && <MediaImage photo={hero} alt="" sizes="100vw" fill priority position="center 30%" className="hero-media archive" />}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(1,26,62,0.97) 25%, rgba(1,26,62,0.7) 55%, rgba(2,46,110,0.5) 100%), linear-gradient(0deg, rgba(1,26,62,0.95), transparent 45%)",
          }}
        />
        <div className="wrap relative pb-10 pt-14 lg:pt-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-white/85">{h.hero.eyebrow}</p>
            <h1 className="display mt-4 text-6xl lg:text-[6rem]">
              <span className="block">{h.hero.title[0]}</span>
              <span className="block text-blue-400">{h.hero.title[1]}</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/90 lg:text-lg">{h.hero.body}</p>
          </Reveal>
          <div className="mt-12">
            <HistoryTimeline items={h.timeline} labels={{ prev: h.prev, next: h.next }} />
          </div>
        </div>
      </section>

      {/* Legends, trophies, records */}
      <section className="grid grid-cols-1 bg-navy-950 md:grid-cols-3 md:divide-x md:divide-white/20">
        {h.cards.map((card, i) => {
          const photo = cardSets[i][0];
          return (
            <div key={card.title} className="relative flex min-h-[260px] overflow-hidden text-white lg:min-h-[300px]">
              {photo && (
                <div className="absolute inset-y-0 right-0 w-3/4">
                  <MediaImage photo={photo} alt="" sizes="(min-width: 768px) 25vw, 75vw" fill position="center 25%" className="archive" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-950/10" />
              <div className="relative flex max-w-[16rem] flex-col justify-center p-8 lg:p-10">
                <span className="rule" />
                <h2 className="display condensed mt-4 text-4xl">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{card.body}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quote */}
      <section className="grid grid-cols-1 bg-surface lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-1 items-center gap-8 px-6 py-14 sm:grid-cols-2 lg:py-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-12">
          <Reveal>
            <p className="eyebrow text-[0.625rem] text-strong">{h.quote.eyebrow}</p>
            <blockquote className="display condensed mt-4 text-4xl text-strong lg:text-5xl">
              “{h.quote.text[0]}
              <br />
              {h.quote.text[1]}”
            </blockquote>
            <span className="rule mt-5 w-14" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-relaxed text-ink/80">{h.quote.body}</p>
          </Reveal>
        </div>
        {quotePhoto && <MediaImage photo={quotePhoto} alt="" sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-[280px]" />}
      </section>

      {/* Mission and values (proposal slide 09, "Trashëgimia sportive") */}
      <section className="bg-paper py-14 lg:py-16">
        <div className="wrap">
          <h2 className="section-label">{h.mission.title}</h2>
          <StaggerGroup className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {h.mission.items.map((m) => (
              <StaggerItem key={m.title}>
                <div className="h-full border-l-4 border-blue-500 bg-surface p-6">
                  <h3 className="font-display text-lg font-extrabold text-strong">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{m.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* KS Tirana in numbers */}
      <section className="bg-navy-900 py-12 text-white lg:py-14">
        <div className="wrap">
          <h2 className="section-label text-white">{h.numbers.title}</h2>
          <dl className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {numbers.map((x) => (
              <div key={x.label}>
                <dd className="font-display text-4xl font-extrabold text-sky-300 lg:text-5xl">
                  <Counter value={x.value} />
                </dd>
                <dt className="mt-2 text-sm text-white/70">{x.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
