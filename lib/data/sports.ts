import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { query } from "@/lib/db/pool";
import { pick, type Locale } from "./locale";
import { PHOTO_COLUMNS, toPhotoRef, type PhotoRef, type PhotoRow } from "./photos";
import { personVisible, photoVisible } from "./visibility";

/*
 * Public data for the sports section: disciplines → people → photos.
 * Every function waits for a request (`connection()`), so pages render with
 * fresh data and `next build` never needs a database. Caching comes later
 * (docs/PLAN.md, principle 5).
 */

export type Role = "athlete" | "head_coach" | "assistant_coach";

export type DisciplineCard = {
  slug: string;
  name: string;
  peopleCount: number;
  photoCount: number;
  cover: PhotoRef | null;
};

export type PersonCard = {
  slug: string;
  fullName: string;
  role: Role;
  isCaptain: boolean;
  shirtNumber: number | null;
  position: string | null;
  portrait: PhotoRef | null;
};

export type DisciplineDetail = DisciplineCard & {
  id: number;
  description: string | null;
  ageGroups: string | null;
  schedule: string | null;
  venue: string | null;
  achievements: string | null;
  coaches: PersonCard[];
  athletes: PersonCard[];
};

export type PersonDetail = PersonCard & {
  id: number;
  disciplineId: number;
  birthYear: number | null;
  nationality: string | null;
  bio: string | null;
  achievements: string | null;
  discipline: { slug: string; name: string };
  photoCount: number;
};

type PhotoJoinRow = { [K in keyof PhotoRow as `p_${K}`]: PhotoRow[K] | null };

const PHOTO_AS = (a: string) =>
  PHOTO_COLUMNS(a)
    .split(", ")
    .map((col) => `${col} AS p_${col.split(".")[1]}`)
    .join(", ");

function photoFromJoin(row: PhotoJoinRow, lang: Locale): PhotoRef | null {
  if (!row.p_id) return null;
  return toPhotoRef(
    {
      id: row.p_id,
      storage_key: row.p_storage_key!,
      width: row.p_width!,
      height: row.p_height!,
      blur_data_url: row.p_blur_data_url,
      alt_sq: row.p_alt_sq,
      alt_en: row.p_alt_en,
    },
    lang,
  );
}

/** The chosen cover if visible, otherwise the best visible photo of the discipline. */
const COVER_JOIN = `
  LEFT JOIN LATERAL (
    SELECT * FROM photos cp
    WHERE cp.discipline_id = d.id AND ${photoVisible("cp")}
    ORDER BY (cp.id = d.cover_photo_id) DESC, cp.is_featured DESC, (cp.width >= cp.height) DESC, cp.sort_order
    LIMIT 1
  ) p ON true`;

/** The chosen portrait if visible, otherwise the person's best visible photo (solo, upright first). */
const PORTRAIT_JOIN = `
  LEFT JOIN LATERAL (
    SELECT pp.* FROM photo_people x JOIN photos pp ON pp.id = x.photo_id
    WHERE x.person_id = pe.id AND ${photoVisible("pp")}
    ORDER BY (pp.id = pe.portrait_photo_id) DESC,
             (SELECT count(*) FROM photo_people y WHERE y.photo_id = pp.id),
             (pp.height > pp.width) DESC, pp.sort_order
    LIMIT 1
  ) p ON true`;

export const getDisciplines = cache(async (lang: Locale): Promise<DisciplineCard[]> => {
  await connection();
  const rows = await query<PhotoJoinRow & Record<string, unknown>>(`
    SELECT d.slug, d.name_sq, d.name_en,
      (SELECT count(*) FROM people pe WHERE pe.discipline_id = d.id AND ${personVisible("pe")})::int AS people_count,
      (SELECT count(*) FROM photos ph WHERE ph.discipline_id = d.id AND ${photoVisible("ph")})::int AS photo_count,
      ${PHOTO_AS("p")}
    FROM disciplines d ${COVER_JOIN}
    WHERE d.is_published
    ORDER BY d.sort_order, d.name_sq`);
  return rows.map((r) => ({
    slug: r.slug as string,
    name: pick(r, "name", lang)!,
    peopleCount: r.people_count as number,
    photoCount: r.photo_count as number,
    cover: photoFromJoin(r, lang),
  }));
});

function toPersonCard(r: PhotoJoinRow & Record<string, unknown>, lang: Locale): PersonCard {
  return {
    slug: r.slug as string,
    fullName: r.full_name as string,
    role: r.role as Role,
    isCaptain: r.is_captain as boolean,
    shirtNumber: r.shirt_number as number | null,
    position: r.position as string | null,
    portrait: photoFromJoin(r, lang),
  };
}

const PERSON_CARD_COLUMNS = "pe.slug, pe.full_name, pe.role, pe.is_captain, pe.shirt_number, pe.position";

export const getDiscipline = cache(async (slug: string, lang: Locale): Promise<DisciplineDetail | null> => {
  await connection();
  const [d] = await query<PhotoJoinRow & Record<string, unknown>>(
    `SELECT d.*, ${PHOTO_AS("p")},
       (SELECT count(*) FROM photos ph WHERE ph.discipline_id = d.id AND ${photoVisible("ph")})::int AS photo_count
     FROM disciplines d ${COVER_JOIN}
     WHERE d.slug = $1 AND d.is_published`,
    [slug],
  );
  if (!d) return null;

  const people = await query<PhotoJoinRow & Record<string, unknown>>(
    `SELECT ${PERSON_CARD_COLUMNS}, ${PHOTO_AS("p")}
     FROM people pe ${PORTRAIT_JOIN}
     WHERE pe.discipline_id = $1 AND ${personVisible("pe")}
     ORDER BY CASE pe.role WHEN 'head_coach' THEN 0 WHEN 'assistant_coach' THEN 1 ELSE 2 END,
              pe.sort_order, pe.full_name`,
    [d.id],
  );
  const cards = people.map((r) => toPersonCard(r, lang));

  return {
    id: d.id as number,
    slug: d.slug as string,
    name: pick(d, "name", lang)!,
    description: pick(d, "description", lang),
    ageGroups: pick(d, "age_groups", lang),
    schedule: pick(d, "schedule", lang),
    venue: d.venue as string | null,
    achievements: pick(d, "achievements", lang),
    peopleCount: cards.length,
    photoCount: d.photo_count as number,
    cover: photoFromJoin(d, lang),
    coaches: cards.filter((c) => c.role !== "athlete"),
    athletes: cards.filter((c) => c.role === "athlete"),
  };
});

export const getPerson = cache(
  async (disciplineSlug: string, personSlug: string, lang: Locale): Promise<PersonDetail | null> => {
    await connection();
    const [r] = await query<PhotoJoinRow & Record<string, unknown>>(
      `SELECT pe.*, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en, ${PHOTO_AS("p")},
         (SELECT count(*) FROM photo_people x JOIN photos ph ON ph.id = x.photo_id
          WHERE x.person_id = pe.id AND ${photoVisible("ph")})::int AS photo_count
       FROM people pe JOIN disciplines d ON d.id = pe.discipline_id ${PORTRAIT_JOIN}
       WHERE d.slug = $1 AND pe.slug = $2 AND d.is_published AND ${personVisible("pe")}`,
      [disciplineSlug, personSlug],
    );
    if (!r) return null;
    return {
      ...toPersonCard(r, lang),
      id: r.id as number,
      disciplineId: r.discipline_id as number,
      birthYear: r.birth_year as number | null,
      nationality: r.nationality as string | null,
      bio: pick(r, "bio", lang),
      achievements: pick(r, "achievements", lang),
      discipline: {
        slug: r.d_slug as string,
        name: (lang === "en" ? (r.d_name_en as string | null) : null) ?? (r.d_name_sq as string),
      },
      photoCount: r.photo_count as number,
    };
  },
);

/** Visible photos of a discipline or a person, newest-first within curated order. */
export async function getPhotos(
  owner: { disciplineId: number } | { personId: number },
  lang: Locale,
  limit: number,
): Promise<PhotoRef[]> {
  await connection();
  const byPerson = "personId" in owner;
  const rows = await query<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS("ph")} FROM photos ph
     WHERE ${byPerson ? "EXISTS (SELECT 1 FROM photo_people x WHERE x.photo_id = ph.id AND x.person_id = $1)" : "ph.discipline_id = $1"}
       AND ${photoVisible("ph")}
     ORDER BY ph.is_featured DESC, ph.taken_at DESC NULLS LAST, ph.sort_order
     LIMIT $2`,
    [byPerson ? owner.personId : owner.disciplineId, limit],
  );
  return rows.map((r) => toPhotoRef(r, lang));
}

/** Curated photos across the club, for the home page. */
export const getFeaturedPhotos = cache(async (lang: Locale, limit: number): Promise<PhotoRef[]> => {
  await connection();
  const rows = await query<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS("ph")} FROM photos ph JOIN disciplines d ON d.id = ph.discipline_id
     WHERE ph.is_featured AND d.is_published AND ${photoVisible("ph")}
     ORDER BY ph.sort_order LIMIT $1`,
    [limit],
  );
  return rows.map((r) => toPhotoRef(r, lang));
});

export type CoachCard = PersonCard & { href: string; disciplineName: string };

/** Visible coaches across the club, head coaches first (Academy "Trajnerët tanë"). */
export const getCoaches = cache(async (lang: Locale, limit = 4): Promise<CoachCard[]> => {
  await connection();
  const rows = await query<PhotoJoinRow & Record<string, unknown>>(
    `SELECT ${PERSON_CARD_COLUMNS}, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en, ${PHOTO_AS("p")}
     FROM people pe JOIN disciplines d ON d.id = pe.discipline_id ${PORTRAIT_JOIN}
     WHERE d.is_published AND pe.role <> 'athlete' AND ${personVisible("pe")}
     ORDER BY (p.id IS NULL), CASE pe.role WHEN 'head_coach' THEN 0 ELSE 1 END, d.sort_order, pe.sort_order
     LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({
    ...toPersonCard(r, lang),
    href: `/${lang}/sportet/${r.d_slug}/${r.slug}`,
    disciplineName: pick(r, "d_name", lang)!,
  }));
});

/** Other visible people in the same discipline, for "teammates". */
export async function getTeammates(disciplineId: number, excludePersonId: number, lang: Locale, limit = 8) {
  await connection();
  const rows = await query<PhotoJoinRow & Record<string, unknown>>(
    `SELECT ${PERSON_CARD_COLUMNS}, ${PHOTO_AS("p")}
     FROM people pe ${PORTRAIT_JOIN}
     WHERE pe.discipline_id = $1 AND pe.id <> $2 AND ${personVisible("pe")}
     ORDER BY random() LIMIT $3`,
    [disciplineId, excludePersonId, limit],
  );
  return rows.map((r) => toPersonCard(r, lang));
}
