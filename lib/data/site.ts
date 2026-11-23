import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { query } from "@/lib/db/pool";
import { pick, type Locale } from "./locale";
import { PHOTO_COLUMNS, toPhotoRef, type PhotoRef, type PhotoRow } from "./photos";
import { photoVisible } from "./visibility";

/*
 * Public data for news, calendar, academy, shop and page artwork.
 * Same rules as lib/data/sports.ts: request-time reads, consent-aware photos.
 */

const TZ = "Europe/Tirane";
const intlLocale = (lang: Locale) => (lang === "sq" ? "sq-AL" : "en-GB");

export function formatDate(date: Date, lang: Locale, withTime = false) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : {}),
  }).format(date);
}

/** Photo joined as p_* columns, only if visible. */
const coverSelect = (fk: string) => `
  (SELECT json_build_object(${PHOTO_COLUMNS("cp")
    .split(", ")
    .map((c) => `'${c.split(".")[1]}', ${c}`)
    .join(", ")})
   FROM photos cp WHERE cp.id = ${fk} AND ${photoVisible("cp")}) AS cover`;

// ----------------------------------------------------------------- photos

/**
 * Featured, visible photos for page artwork (heroes, promos), optionally from
 * one discipline and in one orientation. Order is stable, so each page keeps
 * the same picture between visits.
 */
export const getShowcasePhotos = cache(
  async (
    lang: Locale,
    opts: { discipline?: string; orientation?: "landscape" | "portrait"; limit?: number } = {},
  ): Promise<PhotoRef[]> => {
    await connection();
    const orientation =
      opts.orientation === "landscape"
        ? "AND ph.width > ph.height * 1.2"
        : opts.orientation === "portrait"
          ? "AND ph.height > ph.width"
          : "";
    const rows = await query<PhotoRow>(
      `SELECT ${PHOTO_COLUMNS("ph")} FROM photos ph JOIN disciplines d ON d.id = ph.discipline_id
       WHERE d.is_published AND ${photoVisible("ph")} ${orientation}
         AND ($1::text IS NULL OR d.slug = $1)
       ORDER BY ph.is_featured DESC, ph.sort_order
       LIMIT $2`,
      [opts.discipline ?? null, opts.limit ?? 1],
    );
    return rows.map((r) => toPhotoRef(r, lang));
  },
);

/**
 * One hero photo for a page: the discipline's n-th wide featured shot, else its
 * n-th featured shot of any shape (cropped by the hero), else any wide shot.
 * `index` lets pages that share a discipline show different pictures.
 */
export async function getHeroPhoto(lang: Locale, discipline: string, index = 0): Promise<PhotoRef | null> {
  const limit = index + 1;
  const wide = await getShowcasePhotos(lang, { discipline, orientation: "landscape", limit });
  if (wide[index]) return wide[index];
  const own = await getShowcasePhotos(lang, { discipline, limit });
  if (own[index]) return own[index];
  const any = await getShowcasePhotos(lang, { orientation: "landscape", limit });
  return any[index] ?? any[0] ?? null;
}

// ------------------------------------------------------------------- news

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  date: string;
  publishedAt: string;
  discipline: string | null;
  cover: PhotoRef | null;
};

export type Article = NewsItem & { body: string };

type NewsRow = Record<string, unknown> & { cover: PhotoRow | null; published_at: Date };

function toNewsItem(r: NewsRow, lang: Locale): NewsItem {
  return {
    slug: r.slug as string,
    title: pick(r, "title", lang)!,
    excerpt: pick(r, "excerpt", lang),
    date: formatDate(r.published_at, lang),
    publishedAt: r.published_at.toISOString(),
    discipline: pick(r, "d_name", lang),
    cover: r.cover ? toPhotoRef(r.cover, lang) : null,
  };
}

const NEWS_COLUMNS = `n.slug, n.title_sq, n.title_en, n.excerpt_sq, n.excerpt_en, n.published_at,
  d.name_sq AS d_name_sq, d.name_en AS d_name_en, ${coverSelect("n.cover_photo_id")}`;

export const getNews = cache(async (lang: Locale, limit = 24): Promise<NewsItem[]> => {
  await connection();
  const rows = await query<NewsRow>(
    `SELECT ${NEWS_COLUMNS} FROM news n LEFT JOIN disciplines d ON d.id = n.discipline_id
     WHERE n.published_at <= now() ORDER BY n.published_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => toNewsItem(r, lang));
});

export const getArticle = cache(async (slug: string, lang: Locale): Promise<Article | null> => {
  await connection();
  const [r] = await query<NewsRow>(
    `SELECT ${NEWS_COLUMNS}, n.body_sq, n.body_en FROM news n LEFT JOIN disciplines d ON d.id = n.discipline_id
     WHERE n.slug = $1 AND n.published_at <= now()`,
    [slug],
  );
  if (!r) return null;
  return { ...toNewsItem(r, lang), body: pick(r, "body", lang) ?? "" };
});

// --------------------------------------------------------------- fixtures

export type Fixture = {
  id: number;
  discipline: { slug: string; name: string };
  home: string;
  away: string;
  isHome: boolean;
  date: string;
  startsAt: string;
  venue: string | null;
  competition: string | null;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  /** "78 – 70" in home–away order, when played. */
  score: string | null;
  won: boolean | null;
};

const CLUB = "KS Tirana";

function toFixture(r: Record<string, unknown>, lang: Locale): Fixture {
  const isHome = r.is_home as boolean;
  const ours = r.score_for as number | null;
  const theirs = r.score_against as number | null;
  const opponent = r.opponent as string;
  return {
    id: r.id as number,
    discipline: { slug: r.d_slug as string, name: pick(r, "d_name", lang)! },
    home: isHome ? CLUB : opponent,
    away: isHome ? opponent : CLUB,
    isHome,
    date: formatDate(r.starts_at as Date, lang, true),
    startsAt: (r.starts_at as Date).toISOString(),
    venue: r.venue as string | null,
    competition: r.competition as string | null,
    status: r.status as Fixture["status"],
    score: ours === null || theirs === null ? null : isHome ? `${ours} – ${theirs}` : `${theirs} – ${ours}`,
    won: ours === null || theirs === null || ours === theirs ? null : ours > theirs,
  };
}

const FIXTURE_COLUMNS = `f.*, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en`;

export const getFixtures = cache(async (lang: Locale) => {
  await connection();
  const [upcoming, results] = await Promise.all([
    query(
      `SELECT ${FIXTURE_COLUMNS} FROM fixtures f JOIN disciplines d ON d.id = f.discipline_id
       WHERE d.is_published AND f.status IN ('scheduled', 'live', 'postponed')
         AND f.starts_at >= now() - interval '4 hours'
       ORDER BY f.starts_at LIMIT 60`,
    ),
    query(
      `SELECT ${FIXTURE_COLUMNS} FROM fixtures f JOIN disciplines d ON d.id = f.discipline_id
       WHERE d.is_published AND f.status = 'finished'
       ORDER BY f.starts_at DESC LIMIT 60`,
    ),
  ]);
  return {
    upcoming: upcoming.map((r) => toFixture(r, lang)),
    results: results.map((r) => toFixture(r, lang)),
  };
});

export async function getFixtureForCalendar(id: number) {
  await connection();
  const [r] = await query(
    `SELECT ${FIXTURE_COLUMNS} FROM fixtures f JOIN disciplines d ON d.id = f.discipline_id
     WHERE f.id = $1 AND d.is_published AND f.status <> 'cancelled'`,
    [id],
  );
  return r ? toFixture(r, "sq") : null;
}

// ---------------------------------------------------------------- academy

export type Program = {
  slug: string;
  name: string;
  description: string | null;
  discipline: { slug: string; name: string };
  ageMin: number | null;
  ageMax: number | null;
  schedule: string | null;
  fee: string | null;
  coach: string | null;
};

export const getPrograms = cache(async (lang: Locale): Promise<Program[]> => {
  await connection();
  const rows = await query(
    `SELECT a.*, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en,
       CASE WHEN pe.is_published THEN pe.full_name END AS coach_name
     FROM academy_programs a JOIN disciplines d ON d.id = a.discipline_id
     LEFT JOIN people pe ON pe.id = a.coach_person_id
     WHERE a.is_published AND d.is_published
     ORDER BY a.sort_order, d.sort_order, a.age_min NULLS LAST`,
  );
  return rows.map((r) => ({
    slug: r.slug as string,
    name: pick(r, "name", lang)!,
    description: pick(r, "description", lang),
    discipline: { slug: r.d_slug as string, name: pick(r, "d_name", lang)! },
    ageMin: r.age_min as number | null,
    ageMax: r.age_max as number | null,
    schedule: pick(r, "schedule", lang),
    fee: r.fee_text as string | null,
    coach: r.coach_name as string | null,
  }));
});

// ------------------------------------------------------------------- shop

export type Product = {
  slug: string;
  name: string;
  description: string | null;
  price: string | null;
  sizes: string[];
  inStock: boolean;
  photo: PhotoRef | null;
};

export const getProducts = cache(async (lang: Locale): Promise<Product[]> => {
  await connection();
  const rows = await query<Record<string, unknown> & { cover: PhotoRow | null }>(
    `SELECT pr.*, ${coverSelect("pr.photo_id")} FROM products pr
     WHERE pr.is_published ORDER BY pr.sort_order, pr.name_sq`,
  );
  const lek = new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 0 });
  return rows.map((r) => ({
    slug: r.slug as string,
    name: pick(r, "name", lang)!,
    description: pick(r, "description", lang),
    price: r.price_lek === null ? null : `${lek.format(r.price_lek as number)} L`,
    sizes: r.sizes as string[],
    inStock: r.in_stock as boolean,
    photo: r.cover ? toPhotoRef(r.cover, lang) : null,
  }));
});
