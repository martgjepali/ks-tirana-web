"use client";

import { useMemo, useState } from "react";
import { Icon } from "./Icons";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function CalendarBoard({ dict }: { dict: Dictionary }) {
  const c = dict.calendar;
  const sports = useMemo(
    () => Array.from(new Set(c.fixtures.map((f) => f.sport))),
    [c.fixtures]
  );
  const [sport, setSport] = useState<string>(c.all);

  const fixtures = c.fixtures.filter(
    (f) => sport === c.all || f.sport === sport
  );
  const results = c.results.filter(
    (r) => sport === c.all || r.sport === sport
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[c.all, ...sports].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSport(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              sport === s
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-line text-ink/70 hover:border-navy-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {c.upcoming}
          </h3>
          <div className="mt-4 space-y-3">
            {fixtures.map((f) => (
              <div
                key={f.home + f.away + f.date}
                className="card-hover rounded-xl border border-line bg-white p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  {f.sport}
                </p>
                <p className="font-display mt-2 text-base font-semibold text-ink">
                  {f.home} — {f.away}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink/55">
                  <span className="flex items-center gap-1.5">
                    <Icon name="calendar" className="h-4 w-4" />
                    {f.date} · {f.venue}
                  </span>
                  <button
                    type="button"
                    className="link-underline text-xs font-semibold text-navy-900"
                  >
                    {c.addToCalendar}
                  </button>
                </div>
              </div>
            ))}
            {fixtures.length === 0 && (
              <p className="text-sm text-ink/50">—</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {c.resultsTitle}
          </h3>
          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <div
                key={r.home + r.away + r.date}
                className="card-hover rounded-xl border border-line bg-white p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  {r.sport}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-display text-base font-semibold text-ink">
                    {r.home} <span className="text-blue-500">{r.score}</span>{" "}
                    {r.away}
                  </p>
                </div>
                <p className="mt-3 text-sm text-ink/55">{r.date}</p>
              </div>
            ))}
            {results.length === 0 && <p className="text-sm text-ink/50">—</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
