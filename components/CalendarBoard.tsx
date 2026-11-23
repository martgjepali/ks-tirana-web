"use client";

import { useMemo, useState } from "react";
import type { Fixture } from "@/lib/data/site";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Icon } from "./Icons";

export function CalendarBoard({
  dict,
  upcoming,
  results,
}: {
  dict: Dictionary;
  upcoming: Fixture[];
  results: Fixture[];
}) {
  const c = dict.calendar;
  const sports = useMemo(() => {
    const seen = new Map<string, string>();
    for (const f of [...upcoming, ...results]) seen.set(f.discipline.slug, f.discipline.name);
    return [...seen];
  }, [upcoming, results]);
  const [sport, setSport] = useState<string | null>(null);
  const match = (f: Fixture) => sport === null || f.discipline.slug === sport;

  return (
    <div>
      {sports.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={c.filterSport}>
          {[[null, c.all] as const, ...sports].map(([slug, name]) => (
            <button
              key={slug ?? "all"}
              type="button"
              onClick={() => setSport(slug)}
              aria-pressed={sport === slug}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                sport === slug ? "border-blue-500 bg-blue-500 text-white" : "border-line text-ink/70 hover:border-navy-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{c.upcoming}</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.filter(match).map((f) => (
              <li key={f.id} className="reveal rounded-xl border border-line bg-card p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500">
                  {f.discipline.name}
                  {f.competition && <span className="text-ink/40">· {f.competition}</span>}
                  {f.status !== "scheduled" && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[0.625rem] ${f.status === "live" ? "bg-red-600 text-white" : "bg-surface-2 text-ink/70"}`}
                    >
                      {c.status[f.status as "live" | "postponed"]}
                    </span>
                  )}
                </p>
                <p className="font-display mt-2 text-base font-semibold text-ink">
                  {f.home} — {f.away}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink/60">
                  <span className="flex items-center gap-1.5">
                    <Icon name="calendar" className="h-4 w-4" />
                    <time dateTime={f.startsAt}>{f.date}</time>
                    {f.venue && <> · {f.venue}</>}
                  </span>
                  <a href={`/api/fixtures/${f.id}/ics`} className="link-underline text-xs font-semibold text-strong">
                    {c.addToCalendar}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          {upcoming.filter(match).length === 0 && <p className="mt-4 text-sm text-ink/50">{c.emptyUpcoming}</p>}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{c.resultsTitle}</h2>
          <ul className="mt-4 space-y-3">
            {results.filter(match).map((f) => (
              <li key={f.id} className="reveal rounded-xl border border-line bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">{f.discipline.name}</p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase ${
                      f.won === true ? "bg-blue-500 text-white" : f.won === false ? "bg-surface-2 text-ink/60" : "bg-gold-400 text-navy-950"
                    }`}
                  >
                    {f.won === true ? c.won : f.won === false ? c.lost : c.draw}
                  </span>
                </div>
                <p className="font-display mt-2 text-base font-semibold text-ink">
                  {f.home} <span className="text-blue-500">{f.score}</span> {f.away}
                </p>
                <p className="mt-3 text-sm text-ink/60">
                  <time dateTime={f.startsAt}>{f.date}</time>
                  {f.competition && <> · {f.competition}</>}
                </p>
              </li>
            ))}
          </ul>
          {results.filter(match).length === 0 && <p className="mt-4 text-sm text-ink/50">{c.emptyResults}</p>}
        </div>
      </div>
    </div>
  );
}
