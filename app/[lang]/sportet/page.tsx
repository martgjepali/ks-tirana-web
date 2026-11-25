import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getDisciplines } from "@/lib/data/sports";
import { getClubStats, getHeroPhoto } from "@/lib/data/site";
import { currentSeason, genderOf, groupOf, SPORT_GROUPS } from "@/lib/sport-groups";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { SportsBrowser } from "@/components/SportsBrowser";
import { MediaImage } from "@/components/MediaImage";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/sportet">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.sports.hero.title} · KS Tirana`, description: dict.sports.hero.subtitle };
}

/** "DISIPLINAT" — client proposal, slide 06/07. */
export default async function SportsPage({ params, searchParams }: PageProps<"/[lang]/sportet">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const requested = (await searchParams).sport;
  const initialGroup = SPORT_GROUPS.some((g) => g.key === requested) ? (requested as string) : null;

  const [dict, disciplines, hero, academyPhoto, stats] = await Promise.all([
    getDictionary(lang),
    getDisciplines(lang),
    getHeroPhoto(lang, "atletike", 1),
    getHeroPhoto(lang, "basketboll-meshkuj", 0),
    getClubStats(),
  ]);
  const t = dict.sports;
  const dash = (n: number) => (n > 0 ? String(n) : "—");
  const statItems: { icon: IconName; value: string; label: string }[] = [
    { icon: "users", value: dash(stats.disciplines), label: t.stats.sports },
    { icon: "users", value: dash(stats.athletes), label: t.stats.athletes },
    { icon: "trophy", value: dash(stats.events), label: t.stats.events },
    { icon: "chart", value: "—", label: t.stats.medals },
  ];

  return (
    <>
      <PhotoPageHero photo={hero} eyebrow={t.hero.eyebrow.join(" • ")} title={[t.hero.title]} body={t.hero.subtitle} size="sm" />

      <section className="bg-paper py-8 lg:py-10">
        <div className="wrap">
          <SportsBrowser
            lang={lang}
            season={currentSeason()}
            initialGroup={initialGroup}
            items={disciplines.map((d) => {
              const group = groupOf(d.slug);
              return {
                slug: d.slug,
                name: d.name,
                cover: d.cover,
                kind: group.kind,
                gender: genderOf(d.slug),
                group: { key: group.key, name: group.name[lang] },
              };
            })}
            labels={{ ...t.filters, cardTeam: t.card.team, cardCalendar: t.card.calendar }}
          />
        </div>
      </section>

      {/* Academy band */}
      <section className="grid grid-cols-1 bg-blue-600 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <Reveal className="flex flex-col justify-center px-6 py-12 lg:py-14 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-12">
          <p className="eyebrow text-white/85">{t.academy.eyebrow}</p>
          <h2 className="display mt-3 text-4xl lg:text-5xl">
            {t.academy.title.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-md text-white/90">{t.academy.body}</p>
          <Link href={`/${lang}/akademia`} className="btn btn-white mt-7 w-fit">
            {t.academy.cta}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </Reveal>
        {academyPhoto && (
          <MediaImage photo={academyPhoto} alt="" sizes="(min-width: 1024px) 56vw, 100vw" className="min-h-[260px] lg:min-h-[340px]" position="center 30%" />
        )}
      </section>

      {/* Stats strip */}
      <section className="bg-navy-900 text-white">
        <dl className="wrap grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
          {statItems.map((s) => (
            <div key={s.label} className="flex items-center gap-4 lg:justify-center lg:px-6">
              <Icon name={s.icon} className="h-8 w-8 shrink-0 text-white/85" />
              <div>
                <dd className="font-display text-2xl font-extrabold leading-none">{s.value}</dd>
                <dt className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70">{s.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
