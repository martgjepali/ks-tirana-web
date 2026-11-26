import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getFixturesForMonth, getHeroPhoto, TZ } from "@/lib/data/site";
import { SPORT_GROUPS } from "@/lib/sport-groups";
import { TICKETS, whatsappLink } from "@/lib/club";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/kalendari">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.calendar.hero.title[0]} · KS Tirana`, description: dict.calendar.hero.subtitle };
}

/** Chips shown directly (as in the design); the rest sit under "Disiplina të tjera". */
const MAIN = ["basketboll", "volejboll", "atletike", "not"];

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

/** "KALENDARI" — client's final design, page 26. */
export default async function CalendarPage({ params, searchParams }: PageProps<"/[lang]/kalendari">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const group = SPORT_GROUPS.find((g) => g.key === sp.sport) ?? null;
  const match = typeof sp.muaji === "string" ? /^(\d{4})-(\d{2})$/.exec(sp.muaji) : null;
  const month: Month =
    match && Number(match[2]) >= 1 && Number(match[2]) <= 12 ? { y: Number(match[1]), m: Number(match[2]) } : thisMonth();

  const [dict, fixtures, photoA, photoB] = await Promise.all([
    getDictionary(lang),
    getFixturesForMonth(lang, month.y, month.m, group?.slugs ?? null),
    getHeroPhoto(lang, "basketboll-meshkuj", 2),
    getHeroPhoto(lang, "volejboll-femra", 3),
  ]);
  const c = dict.calendar;

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

  // Month grid: Monday-first weeks, match days highlighted.
  const firstWeekday = (new Date(Date.UTC(month.y, month.m - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
  const matchDays = new Set(fixtures.map((f) => f.dayOfMonth));
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const others = SPORT_GROUPS.filter((g) => !MAIN.includes(g.key));
  const otherActive = group && !MAIN.includes(group.key);

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal className="px-6 flex items-center py-12 lg:py-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+3rem))]">
            <h1 className="display text-6xl lg:text-[5.25rem]">{c.hero.title[0]}</h1>
          </Reveal>
          <div className="grid grid-cols-2">
            {[photoA, photoB].map((p, i) =>
              p ? (
                <MediaImage key={i} photo={p} alt="" sizes="(min-width: 1024px) 25vw, 50vw" priority className="min-h-[200px] lg:min-h-[290px]" position="center 30%" />
              ) : (
                <div key={i} className="bg-navy-800" />
              ),
            )}
          </div>
        </div>
      </section>

      <section id="kalendari" className="scroll-mt-28 bg-paper py-6 lg:py-8">
        <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="min-w-0">
            <nav className="flex flex-wrap gap-2" aria-label={c.filterSport}>
              {[{ key: null as string | null, label: c.all }, ...MAIN.map((k) => ({ key: k, label: SPORT_GROUPS.find((s) => s.key === k)!.name[lang] }))].map(
                (chip) => (
                  <Link
                    key={chip.key ?? "all"}
                    href={href({ sport: chip.key })}
                    aria-current={(group?.key ?? null) === chip.key ? "true" : undefined}
                    className="min-w-20 bg-[#eef3fa] px-4 py-2.5 text-[1.05rem] font-bold text-strong transition hover:bg-blue-500/15 aria-[current=true]:bg-blue-500 aria-[current=true]:text-white [:root[data-theme=dark]_&]:bg-surface"
                  >
                    {chip.label}
                  </Link>
                ),
              )}
              <details className="group relative">
                <summary
                  aria-current={otherActive ? "true" : undefined}
                  className="flex cursor-pointer list-none items-center gap-1.5 bg-[#eef3fa] px-4 py-2.5 text-[1.05rem] font-bold text-strong aria-[current=true]:bg-blue-500 aria-[current=true]:text-white [&::-webkit-details-marker]:hidden [:root[data-theme=dark]_&]:bg-surface"
                >
                  {otherActive ? group!.name[lang] : c.others}
                  <Icon name="chevronDown" className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <ul className="absolute left-0 top-full z-20 mt-1 min-w-52 border border-line bg-card py-1 shadow-[var(--shadow-card)]">
                  {others.map((g) => (
                    <li key={g.key}>
                      <Link href={href({ sport: g.key })} className="block px-4 py-2 font-semibold text-strong hover:bg-surface hover:text-blue-500">
                        {g.name[lang]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </nav>

            <h2 className="mt-6 text-3xl font-extrabold text-strong">{c.upcoming}</h2>
            {fixtures.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {fixtures.map((f) => {
                  const teams = `${f.home} ${c.vs} ${f.away}`;
                  return (
                    <li
                      key={f.id}
                      className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-6 gap-y-1.5 bg-[#eef3fa] px-4 py-3 md:grid-cols-[6.5rem_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] [:root[data-theme=dark]_&]:bg-surface"
                    >
                      <time dateTime={f.startsAt} className="text-lg font-bold text-blue-500">
                        {f.dayMonth}
                      </time>
                      <span className="text-lg font-bold text-strong">{f.discipline.name}</span>
                      <span className="col-span-2 text-ink/70 md:col-span-1">
                        {f.status === "finished" && f.score ? (
                          <>
                            {f.home} <strong className="text-strong">{f.score}</strong> {f.away}
                          </>
                        ) : (
                          <span>
                            {teams} · {f.time}
                          </span>
                        )}
                      </span>
                      {f.venue && (
                        <span className="col-span-2 flex items-center gap-2 text-ink/70 md:col-span-1">
                          <Icon name="pin" className="h-5 w-5 shrink-0 text-red-600" />
                          {f.venue}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 bg-[#eef3fa] px-6 py-12 text-center text-ink/60 [:root[data-theme=dark]_&]:bg-surface">{c.empty}</p>
            )}
          </div>

          <aside className="space-y-5">
            {/* Month calendar */}
            <div className="bg-[#eef3fa] p-6 [:root[data-theme=dark]_&]:bg-surface">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-strong">{monthName(month)}</h2>
                <div className="flex gap-3 text-blue-500">
                  <Link href={href({ month: shift(month, -1) })} aria-label={c.prevMonth} className="p-1 hover:text-blue-600">
                    <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
                  </Link>
                  <Link href={href({ month: shift(month, 1) })} aria-label={c.nextMonth} className="p-1 hover:text-blue-600">
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
                {c.weekdays.map((w, i) => (
                  <span key={i} className="py-1 text-sm font-bold text-ink/60">
                    {w}
                  </span>
                ))}
                {cells.map((d, i) => (
                  <span key={i} className="flex h-9 items-center justify-center">
                    {d !== null && (
                      <span className={`flex h-8 w-8 items-center justify-center font-bold ${matchDays.has(d) ? "bg-blue-500 text-white" : "text-strong"}`}>
                        {d}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="flex items-center gap-3">
              {TICKETS.images.map((src, i) => (
                <a key={i} href={whatsappLink(c.tickets.message)} target="_blank" rel="noreferrer" className="w-[30%] shrink-0 transition hover:-translate-y-1">
                  <Image src={src} alt={c.tickets.alt} width={326} height={435} className="h-auto w-full" />
                </a>
              ))}
              <a
                href={whatsappLink(c.tickets.message)}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex aspect-square w-[34%] flex-col items-center justify-center rounded-full bg-[#c9d3e0] text-center text-sm font-extrabold uppercase leading-tight text-strong transition hover:bg-blue-500 hover:text-white"
              >
                <Icon name="whatsapp" className="mb-1 h-5 w-5" />
                {c.tickets.reserve.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
