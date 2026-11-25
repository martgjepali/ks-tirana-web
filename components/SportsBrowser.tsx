"use client";

import Link from "next/link";
import { useState } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import type { Gender, SportKind } from "@/lib/sport-groups";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

export type SportItem = {
  slug: string;
  name: string;
  cover: PhotoRef | null;
  kind: SportKind;
  gender: Gender;
  group: { key: string; name: string };
};

type Labels = {
  all: string;
  team: string;
  individual: string;
  gender: string;
  genderAll: string;
  men: string;
  women: string;
  season: string;
  empty: string;
  cardTeam: string;
  cardCalendar: string;
};

/** Disciplines grid with the client's filters: type tabs, gender and season. */
export function SportsBrowser({
  lang,
  items,
  labels,
  season,
  initialGroup,
}: {
  lang: string;
  items: SportItem[];
  labels: Labels;
  season: string;
  initialGroup: string | null;
}) {
  const [kind, setKind] = useState<"all" | SportKind>("all");
  const [gender, setGender] = useState<"all" | "men" | "women">("all");
  const [group, setGroup] = useState<string | null>(initialGroup);

  const shown = items.filter(
    (s) =>
      (kind === "all" || s.kind === kind) &&
      (gender === "all" || s.gender === gender || s.gender === "mixed") &&
      (group === null || s.group.key === group),
  );
  const groupName = items.find((s) => s.group.key === group)?.group.name;
  const tabs = [
    ["all", labels.all],
    ["team", labels.team],
    ["individual", labels.individual],
  ] as const;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="group">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`min-w-[9.5rem] rounded-sm border px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
                kind === value ? "border-blue-500 bg-blue-500 text-white" : "border-line bg-card text-strong hover:border-blue-500"
              }`}
            >
              {label}
            </button>
          ))}
          {group && groupName && (
            <button
              type="button"
              onClick={() => setGroup(null)}
              className="flex items-center gap-2 rounded-sm bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wider text-strong hover:bg-surface-2"
            >
              {groupName}
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="hidden h-px flex-1 bg-line lg:block" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-3">
            <span className="font-semibold text-strong">{labels.gender}</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as typeof gender)}
              className="field !w-40 !py-2.5"
            >
              <option value="all">{labels.genderAll}</option>
              <option value="men">{labels.men}</option>
              <option value="women">{labels.women}</option>
            </select>
          </label>
          <label className="flex items-center gap-3">
            <span className="font-semibold text-strong">{labels.season}</span>
            <select className="field !w-40 !py-2.5" defaultValue={season}>
              <option value={season}>{season}</option>
            </select>
          </label>
        </div>
      </div>

      {shown.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((s) => (
            <li key={s.slug} className="group relative aspect-square overflow-hidden rounded-sm bg-navy-900 text-white">
              {s.cover && <MediaImage photo={s.cover} alt="" sizes="(min-width: 1024px) 16vw, (min-width: 640px) 32vw, 48vw" fill position="center 30%" />}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/25 to-transparent" />
              {/* Whole card opens the discipline; the small links sit above it. */}
              <Link href={`/${lang}/sportet/${s.slug}`} className="absolute inset-0 z-10" aria-label={s.name} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 p-4">
                <div className="min-w-0">
                  <h2 className="display condensed text-2xl leading-none lg:text-[1.7rem]">{s.name}</h2>
                  <p className="pointer-events-auto mt-2 flex gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/85">
                    <Link href={`/${lang}/sportet/${s.slug}`} className="hover:text-white">
                      {labels.cardTeam}
                    </Link>
                    ·
                    <Link href={`/${lang}/kalendari?sport=${s.group.key}`} className="hover:text-white">
                      {labels.cardCalendar}
                    </Link>
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/90 transition group-hover:bg-blue-500 group-hover:border-blue-500">
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-ink/60">{labels.empty}</p>
      )}
    </>
  );
}
