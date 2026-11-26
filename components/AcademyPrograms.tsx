"use client";

import Link from "next/link";
import { useState } from "react";
import type { PhotoRef } from "@/lib/data/photos";
import { MediaImage } from "./MediaImage";

/**
 * "ZBULO PASIONIN TËND" (client's final design, page 24): age-group chips and the
 * programme tiles; a tile opens the registration form with programme and age group chosen.
 */
export function AcademyPrograms({
  lang,
  title,
  subtitle,
  agesLabel,
  ageGroups,
  programs,
}: {
  lang: string;
  title: string;
  subtitle: string;
  agesLabel: string;
  ageGroups: string[];
  programs: { slug: string; name: string; photo: PhotoRef | null }[];
}) {
  const [age, setAge] = useState(0);
  const ageParam = ["6-8", "9-12", "13-15", "16-18"][age];

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="display text-4xl text-[#3d5a80] lg:text-[2.6rem] [:root[data-theme=dark]_&]:text-sky-300">{title}</h2>
          <p className="mt-1 text-ink/70">{subtitle}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-strong">{agesLabel}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={agesLabel}>
            {ageGroups.map((g, i) => (
              <button
                key={g}
                type="button"
                aria-pressed={age === i}
                onClick={() => setAge(i)}
                className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
                  age === i ? "border-blue-500 bg-blue-500 text-white" : "border-line bg-card text-strong hover:border-blue-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {programs.map((p) => (
          <li key={p.slug}>
            <Link href={`/${lang}/akademia/apliko?programi=${p.slug}&mosha=${ageParam}`} className="group block overflow-hidden bg-navy-900">
              {p.photo ? (
                <MediaImage photo={p.photo} alt="" sizes="(min-width: 1024px) 23vw, 48vw" className="aspect-[16/7] [&_img]:duration-500 group-hover:[&_img]:scale-110" position="center 30%" />
              ) : (
                <div className="aspect-[16/7] bg-navy-800" />
              )}
              <p className="flex items-center justify-between gap-2 px-4 py-2.5 text-[1.05rem] font-bold text-white transition-colors group-hover:bg-blue-500">
                {p.name}
                <span aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
