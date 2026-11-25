import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getFixturesForMonth, getHeroPhoto, TZ } from "@/lib/data/site";
import { SPORT_GROUPS } from "@/lib/sport-groups";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { FixtureRow } from "@/components/FixtureRow";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/kalendari">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.calendar.hero.title.join(" ")} · KS Tirana`, description: dict.calendar.hero.subtitle };
}

/** Chips shown directly; the rest sit under "Sportet e tjera". */
const MAIN = ["volejboll", "basketboll", "atletike", "not", "luftarake"];
/** "Më shumë nga KS Tirana" cards: sport and the dictionary card title at the same index. */
const MORE = ["luftarake", "basketboll", "volejboll", "not"];

type Month = { y: number; m: number };
const key = ({ y, m }: Month) => `${y}-${String(m).padStart(2, "0")}`;
const shift = ({ y, m }: Month, by: number): Month => {
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
};

function thisMonth(): Month {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).format(new Date()).split("-");
  return { y: Number(y), m: Number(m) };
}

/** "KALENDARI & REZULTATET" — client proposal, slide 11/19. */
export default async function CalendarPage({ params, searchParams }: PageProps<"/[lang]/kalendari">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const group = SPORT_GROUPS.find((g) => g.key === sp.sport) ?? null;
  const match = typeof sp.muaji === "string" ? /^(\d{4})-(\d{2})$/.exec(sp.muaji) : null;
  const month: Month =
    match && Number(match[2]) >= 1 && Number(match[2]) <= 12 ? { y: Number(match[1]), m: Number(match[2]) } : thisMonth();

  const [dict, fixtures, hero, ...moreSets] = await Promise.all([
    getDictionary(lang),
    getFixturesForMonth(lang, month.y, month.m, group?.slugs ?? null),
    getHeroPhoto(lang, "volejboll-meshkuj", 1),
    ...MORE.map((g) =>
      getHeroPhoto(lang, SPORT_GROUPS.find((s) => s.key === g)!.slugs, 1),
    ),
  ]);
  const c = dict.calendar;
  const fixtureLabels = {
    addToCalendar: c.addToCalendar,
    competition: c.competition,
    won: c.won,
    lost: c.lost,
    draw: c.draw,
    status: c.status,
  };

  const href = (next: { sport?: string | null; month?: Month }) => {
    const q = new URLSearchParams();
    const s = next.sport === undefined ? group?.key : next.sport;
    if (s) q.set("sport", s);
    q.set("muaji", key(next.month ?? month));
    return `/${lang}/kalendari?${q}#kalendari`;
  };
  const monthName = (mm: Month) => {
    const s = new Intl.DateTimeFormat(lang === "sq" ? "sq-AL" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(mm.y, mm.m - 1, 1)),
    );
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Mini calendar: Monday-first weeks, match days highlighted.
  const firstWeekday = (new Date(Date.UTC(month.y, month.m - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
  const matchDays = new Set(fixtures.map((f) => f.dayOfMonth));
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const nearby = Array.from({ length: 13 }, (_, i) => shift(month, i - 6));
  const others = SPORT_GROUPS.filter((g) => !MAIN.includes(g.key));
  const otherActive = group && !MAIN.includes(group.key);

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={c.hero.eyebrow.join(" • ")}
        title={c.hero.title}
        body={c.hero.subtitle}
        script={c.hero.script}
        size="md"
      />

      <section id="kalendari" className="scroll-mt-28 bg-paper py-8 lg:py-10">
        <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            {/* Filters */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <nav className="flex flex-wrap gap-2 xl:flex-nowrap" aria-label={c.filterSport}>
                <Link href={href({ sport: null })} className="chip" aria-current={group === null ? "true" : undefined}>
                  {c.all}
                </Link>
                {MAIN.map((k) => {
                  const g = SPORT_GROUPS.find((s) => s.key === k)!;
                  return (
                    <Link key={k} href={href({ sport: k })} className="chip" aria-current={group?.key === k ? "true" : undefined}>
                      {g.name[lang]}
                    </Link>
                  );
                })}
                <details className="group relative">
                  <summary className="chip cursor-pointer list-none [&::-webkit-details-marker]:hidden" aria-current={otherActive ? "true" : undefined}>
                    {otherActive ? group!.name[lang] : c.others}
                    <Icon name="chevronDown" className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <ul className="absolute left-0 top-full z-20 mt-1 min-w-48 rounded-sm border border-line bg-card py-1 shadow-[var(--shadow-card)]">
                    {others.map((g) => (
                      <li key={g.key}>
                        <Link href={href({ sport: g.key })} className="block px-4 py-2 text-sm font-medium text-strong hover:bg-surface hover:text-blue-500">
                          {g.name[lang]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </nav>

              <div className="flex shrink-0 items-center self-start rounded-sm border border-line xl:self-auto">
                <Link href={href({ month: shift(month, -1) })} aria-label={c.prevMonth} className="flex h-10 w-10 items-center justify-center border-r border-line text-ink/60 hover:text-blue-500">
                  <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
                </Link>
                <details className="group relative">
                  <summary className="flex h-10 w-36 cursor-pointer list-none items-center justify-between px-4 text-sm font-bold text-strong [&::-webkit-details-marker]:hidden">
                    {monthName(month)}
                    <Icon name="chevronDown" className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <ul className="absolute right-0 top-full z-20 mt-1 max-h-72 w-44 overflow-y-auto rounded-sm border border-line bg-card py-1 shadow-[var(--shadow-card)]">
                    {nearby.map((mm) => (
                      <li key={key(mm)}>
                        <Link
                          href={href({ month: mm })}
                          aria-current={key(mm) === key(month) ? "true" : undefined}
                          className="block px-4 py-2 text-sm font-medium text-strong hover:bg-surface aria-[current=true]:text-blue-500"
                        >
                          {monthName(mm)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>

            {/* Fixture list */}
            {fixtures.length > 0 ? (
              <ul className="mt-5 border-t border-line">
                {fixtures.map((f) => (
                  <FixtureRow key={f.id} f={f} labels={fixtureLabels} />
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-md border border-dashed border-line bg-surface px-6 py-14 text-center text-ink/60">{c.empty}</p>
            )}
          </div>

          {/* Mini calendar */}
          <aside className="h-fit rounded-md border border-line bg-card p-5 shadow-[0_1px_0_rgba(2,31,72,0.04)]">
            <div className="flex items-center justify-between">
              <h2 className="display text-xl text-strong">{c.sidebar}</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-strong">
                <Link href={href({ month: shift(month, -1) })} aria-label={c.prevMonth} className="p-1 text-ink/50 hover:text-blue-500">
                  <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
                </Link>
                <span className="w-24 text-center text-xs sm:text-sm">{monthName(month)}</span>
                <Link href={href({ month: shift(month, 1) })} aria-label={c.nextMonth} className="p-1 text-ink/50 hover:text-blue-500">
                  <Icon name="chevronRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-sm">
              {c.weekdays.map((w, i) => (
                <span key={i} className="bg-surface py-2 text-xs font-bold text-ink/60">
                  {w}
                </span>
              ))}
              {cells.map((d, i) => (
                <span key={i} className="flex h-10 items-center justify-center">
                  {d !== null && (
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        matchDays.has(d) ? "bg-blue-500 font-bold text-white" : "text-ink/75"
                      }`}
                    >
                      {d}
                    </span>
                  )}
                </span>
              ))}
            </div>
            <a
              href={`/api/fixtures/ics${group ? `?sport=${group.key}` : ""}`}
              className="mt-4 flex items-center justify-between gap-3 rounded-sm bg-blue-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <Icon name="calendar" className="h-5 w-5 shrink-0" />
              <span className="flex-1">{c.addAll}</span>
              <Icon name="chevronRight" className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </section>

      {/* More from KS Tirana */}
      <section className="bg-paper pb-12 lg:pb-14">
        <div className="wrap">
          <div className="flex items-center justify-between gap-4">
            <h2 className="display text-xl text-strong">{c.more.title}</h2>
            <Link href={`/${lang}/sportet`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
              {c.more.all}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
          <Reveal className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MORE.map((k, i) => {
              const g = SPORT_GROUPS.find((s) => s.key === k)!;
              const photo = moreSets[i];
              return (
                <Link
                  key={k}
                  href={href({ sport: k, month: thisMonth() })}
                  className="group relative block aspect-[16/7] overflow-hidden rounded-md bg-navy-900 text-white"
                >
                  {photo && <MediaImage photo={photo} alt="" sizes="(min-width: 1024px) 24vw, 50vw" fill />}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                    <div>
                      <p className="eyebrow text-[0.625rem] text-white/85">{g.name[lang]}</p>
                      <p className="mt-1 text-lg font-bold">{c.more.cards[i]}</p>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 transition group-hover:bg-blue-500">
                      <Icon name="chevronRight" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>
    </>
  );
}
