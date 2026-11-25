import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getDiscipline, getPhotos } from "@/lib/data/sports";
import { getDisciplineFixtures, getNews } from "@/lib/data/site";
import { groupOf } from "@/lib/sport-groups";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PersonCard } from "@/components/PersonCard";
import { FixtureRow } from "@/components/FixtureRow";
import { NewsCard } from "@/components/NewsCard";
import { Icon } from "@/components/Icons";

const PAGE = 24;

export async function generateMetadata({ params }: PageProps<"/[lang]/sportet/[discipline]">): Promise<Metadata> {
  const { lang, discipline: slug } = await params;
  if (!hasLocale(lang)) return {};
  const discipline = await getDiscipline(slug, lang);
  if (!discipline) return {};
  return {
    title: `${discipline.name} · KS Tirana`,
    description: discipline.description?.slice(0, 160) ?? undefined,
    openGraph: discipline.cover ? { images: [{ url: discipline.cover.large }] } : undefined,
  };
}

/**
 * One discipline. The proposal (slide 06, "DISIPLINAT") lists: teams and
 * categories, athletes and staff, fixtures and results, news and gallery,
 * history and trophies — in that order here.
 */
export default async function DisciplinePage({ params, searchParams }: PageProps<"/[lang]/sportet/[discipline]">) {
  const { lang, discipline: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, discipline] = await Promise.all([getDictionary(lang), getDiscipline(slug, lang)]);
  if (!discipline) notFound();
  const t = dict.sports;
  const d = t.detail;

  const requested = Number((await searchParams).foto);
  const shown = Math.min(
    discipline.photoCount,
    Number.isInteger(requested) && requested > PAGE ? Math.min(requested, 1000) : PAGE,
  );
  const [photos, fixtures, news] = await Promise.all([
    getPhotos({ disciplineId: discipline.id }, lang, shown),
    getDisciplineFixtures(lang, discipline.id),
    getNews(lang, 3, { disciplineId: discipline.id }),
  ]);
  const base = `/${lang}/sportet/${discipline.slug}`;
  const facts = [
    { label: d.ageGroups, value: discipline.ageGroups, icon: "users" as const },
    { label: d.schedule, value: discipline.schedule, icon: "clock" as const },
    { label: d.venue, value: discipline.venue, icon: "pin" as const },
  ].filter((f) => f.value);
  const cardLabels = { headCoach: t.headCoach, assistantCoach: t.assistantCoach, athlete: t.athlete, captain: t.captain };
  const fixtureLabels = {
    addToCalendar: dict.calendar.addToCalendar,
    competition: dict.calendar.competition,
    won: dict.calendar.won,
    lost: dict.calendar.lost,
    draw: dict.calendar.draw,
    status: dict.calendar.status,
  };

  return (
    <>
      <PhotoPageHero
        photo={discipline.cover}
        eyebrow={groupOf(discipline.slug).name[lang]}
        title={[discipline.name]}
        size="md"
      >
        <dl className="flex gap-10 border-t border-white/20 pt-5">
          {discipline.peopleCount > 0 && (
            <div>
              <dd className="font-display text-3xl font-extrabold">{discipline.peopleCount}</dd>
              <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">{t.members}</dt>
            </div>
          )}
          <div>
            <dd className="font-display text-3xl font-extrabold">{discipline.photoCount}</dd>
            <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">{t.photos}</dt>
          </div>
        </dl>
      </PhotoPageHero>

      <div className="wrap pt-6">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.nav.sports, href: `/${lang}/sportet` },
            { label: discipline.name },
          ]}
        />
      </div>

      {/* Teams and categories */}
      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="rule" />
            <h2 className="display mt-4 text-3xl text-strong">{d.about}</h2>
            <p className={`mt-4 max-w-2xl whitespace-pre-line leading-relaxed ${discipline.description ? "text-ink/75" : "text-ink/50"}`}>
              {discipline.description ?? d.noDescription}
            </p>
          </div>
          {facts.length > 0 && (
            <dl className="space-y-4 rounded-md border border-line bg-surface p-6">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <Icon name={f.icon} className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-ink/50">{f.label}</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm text-ink/80">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Athletes and staff */}
      <section className="bg-surface py-12 lg:py-14">
        <div className="wrap space-y-12">
          {discipline.coaches.length > 0 && (
            <div>
              <h2 className="section-label">{d.staff}</h2>
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {discipline.coaches.map((p) => (
                  <li key={p.slug}>
                    <PersonCard person={p} href={`${base}/${p.slug}`} labels={cardLabels} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="section-label">{d.athletes}</h2>
            {discipline.athletes.length > 0 ? (
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {discipline.athletes.map((p) => (
                  <li key={p.slug}>
                    <PersonCard person={p} href={`${base}/${p.slug}`} labels={cardLabels} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink/55">{d.emptyRoster}</p>
            )}
          </div>
        </div>
      </section>

      {/* Fixtures and results */}
      <section className="bg-paper py-12 lg:py-14">
        <div className="wrap">
          <div className="flex items-center justify-between gap-4">
            <h2 className="section-label">{d.fixtures}</h2>
            <Link href={`/${lang}/kalendari?sport=${groupOf(discipline.slug).key}`} className="link-arrow">
              {dict.nav.calendar}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
          {fixtures.length > 0 ? (
            <ul className="mt-3 border-t border-line">
              {fixtures.map((f) => (
                <FixtureRow key={f.id} f={f} labels={fixtureLabels} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink/55">{d.noFixtures}</p>
          )}
        </div>
      </section>

      {/* News */}
      {news.length > 0 && (
        <section className="bg-surface py-12 lg:py-14">
          <div className="wrap">
            <h2 className="section-label">{d.news}</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {news.map((item) => (
                <li key={item.slug}>
                  <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} label={item.discipline ?? dict.news.categories[item.category]} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section id="galeria" className="scroll-mt-28 bg-paper py-12 lg:py-14">
        <div className="wrap">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-label">{d.gallery}</h2>
            {discipline.photoCount > 0 && (
              <p className="text-sm text-ink/55">
                {d.showing.replace("{shown}", String(photos.length)).replace("{total}", String(discipline.photoCount))}
              </p>
            )}
          </div>
          <div className="mt-5">
            {photos.length > 0 ? <PhotoGallery photos={photos} labels={t.lightbox} /> : <p className="text-ink/55">{d.emptyGallery}</p>}
          </div>
          {shown < discipline.photoCount && (
            <div className="mt-8 flex justify-center">
              <Link href={`${base}?foto=${shown + PAGE}#galeria`} scroll={false} className="btn btn-ghost">
                {d.showMore}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* History and trophies */}
      {discipline.achievements && (
        <section className="bg-navy-900 py-12 text-white lg:py-14">
          <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:gap-12">
            <h2 className="display flex items-center gap-3 text-3xl">
              <Icon name="trophy" className="h-8 w-8 text-gold-400" />
              {d.history}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-white/85">{discipline.achievements}</p>
          </div>
        </section>
      )}
    </>
  );
}
