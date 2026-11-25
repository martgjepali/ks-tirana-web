import type { Fixture } from "@/lib/data/site";
import { sportIcon } from "@/lib/sport-icons";
import { Icon } from "./Icons";

export type FixtureLabels = {
  addToCalendar: string;
  competition: string;
  won: string;
  lost: string;
  draw: string;
  status: { live: string; postponed: string; cancelled: string };
};

/**
 * One line of the Calendar list (client mockup): date and weekday, time, sport,
 * "KS Tirana  –  –  Opponent" (score once played), venue and "Shto në kalendar".
 */
export function FixtureRow({ f, labels }: { f: Fixture; labels: FixtureLabels }) {
  const played = f.status === "finished" && f.scoreHome !== null;
  const special = f.status === "live" || f.status === "postponed" || f.status === "cancelled";
  return (
    <li className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b border-line py-4 md:grid-cols-[8.75rem_2.75rem_minmax(0,9.5rem)_minmax(0,1fr)_minmax(0,8rem)_8.25rem]">
      <div>
        <time dateTime={f.startsAt} className="block whitespace-nowrap text-sm font-extrabold uppercase text-strong">
          {f.day}
        </time>
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink/50">{f.weekday}</span>
      </div>
      <span className="text-sm font-medium text-ink/70 md:text-center">{f.time}</span>

      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <Icon name={sportIcon(f.discipline.slug)} className="h-7 w-7 shrink-0 text-strong" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-strong">{f.discipline.name}</p>
          <p className="truncate text-xs text-ink/55">{f.competition ?? labels.competition}</p>
        </div>
      </div>

      <div className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-sm font-bold leading-tight text-strong md:col-span-1">
        <span className="text-right">{f.home}</span>
        <span className="flex items-center gap-3 tabular-nums">
          {played ? (
            <>
              <span className="rounded-sm bg-surface px-2 py-0.5">{f.scoreHome}</span>
              <span className="rounded-sm bg-surface px-2 py-0.5">{f.scoreAway}</span>
            </>
          ) : (
            <>
              <span className="text-ink/40">-</span>
              <span className="text-ink/40">-</span>
            </>
          )}
        </span>
        <span>{f.away}</span>
      </div>

      <p className="col-span-2 flex items-start gap-2 text-xs text-ink/60 md:col-span-1">
        <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" />
        <span className="line-clamp-2">{f.venue ?? "—"}</span>
      </p>

      <div className="col-span-2 md:col-span-1 md:text-right">
        {special ? (
          <span
            className={`inline-block rounded-sm px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${
              f.status === "live" ? "bg-red-600 text-white" : "bg-surface-2 text-ink/70"
            }`}
          >
            {labels.status[f.status as "live" | "postponed" | "cancelled"]}
          </span>
        ) : played ? (
          <span
            className={`inline-block rounded-sm px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${
              f.won === true ? "bg-blue-500 text-white" : f.won === false ? "bg-surface-2 text-ink/70" : "bg-gold-400 text-navy-950"
            }`}
          >
            {f.won === true ? labels.won : f.won === false ? labels.lost : labels.draw}
          </span>
        ) : (
          <a
            href={`/api/fixtures/${f.id}/ics`}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 underline underline-offset-2 hover:text-blue-600"
          >
            <Icon name="calendar" className="h-4 w-4" />
            {labels.addToCalendar}
          </a>
        )}
      </div>
    </li>
  );
}
