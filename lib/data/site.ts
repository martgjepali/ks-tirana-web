import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { query } from "@/lib/db/pool";
import { pick, type Locale } from "./locale";
import { PHOTO_COLUMNS, toPhotoRef, type PhotoRef, type PhotoRow } from "./photos";
import { personVisible, photoVisible } from "./visibility";

/*
 * Public data for news, calendar, academy, shop, search and page artwork.
 * Same rules as lib/data/sports.ts: request-time reads, consent-aware photos.
 */

export const TZ = "Europe/Tirane";
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

/** Short date for cards, e.g. "12 nën 2026". */
export function formatShortDate(date: Date, lang: Locale) {
  return new Intl.DateTimeFormat(intlLocale(lang), { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Photo joined as a JSON object, only if visible. */
const coverSelect = (fk: string) => `
  (SELECT json_build_object(${PHOTO_COLUMNS("cp")
    .split(", ")
    .map((c) => `'${c.split(".")[1]}', ${c}`)
    .join(", ")})
   FROM photos cp WHERE cp.id = ${fk} AND ${photoVisible("cp")}) AS cover`;

// ----------------------------------------------------------------- photos

/**
 * Featured, visible photos for page artwork (heroes, promos), optionally from
 * one or more disciplines and in one orientation. Order is stable, so each page
 * keeps the same picture between visits.
 */
export const getShowcasePhotos = cache(
  async (
    lang: Locale,
    opts: { discipline?: string | string[]; orientation?: "landscape" | "portrait"; limit?: number; offset?: number } = {},
  ): Promise<PhotoRef[]> => {
    await connection();
    const orientation =
      opts.orientation === "landscape"
        ? "AND ph.width > ph.height * 1.2"
        : opts.orientation === "portrait"
          ? "AND ph.height > ph.width"
          : "";
    const slugs = opts.discipline === undefined ? null : ([] as string[]).concat(opts.discipline);
    const rows = await query<PhotoRow>(
      `SELECT ${PHOTO_COLUMNS("ph")} FROM photos ph JOIN disciplines d ON d.id = ph.discipline_id
       WHERE d.is_published AND ${photoVisible("ph")} ${orientation}
         AND ($1::text[] IS NULL OR d.slug = ANY($1))
       ORDER BY ph.is_featured DESC, ph.sort_order, ph.id
       LIMIT $2 OFFSET $3`,
      [slugs, opts.limit ?? 1, opts.offset ?? 0],
    );
    return rows.map((r) => toPhotoRef(r, lang));
  },
);

/**
 * One photo for a hero or promo: the discipline's n-th wide shot, else its n-th
 * shot of any shape (cropped by the layout), else a wide shot from the club.
 * `index` wraps around what is visible, so a slot is never left empty when
 * consent rules hide some photos; pages sharing a discipline pass different
 * indexes to show different pictures.
 */
export async function getHeroPhoto(lang: Locale, discipline: string | string[], index = 0): Promise<PhotoRef | null> {
  const wide = await getShowcasePhotos(lang, { discipline, orientation: "landscape", limit: 12 });
  if (wide.length) return wide[index % wide.length];
  const own = await getShowcasePhotos(lang, { discipline, limit: 12 });
  if (own.length) return own[index % own.length];
  const any = await getShowcasePhotos(lang, { orientation: "landscape", limit: 12 });
  return any.length ? any[index % any.length] : null;
}

/** Latest visible photos across the club (Media page strip). */
export const getLatestPhotos = cache(async (lang: Locale, limit: number): Promise<PhotoRef[]> => {
  await connection();
  const rows = await query<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS("ph")} FROM photos ph JOIN disciplines d ON d.id = ph.discipline_id
     WHERE d.is_published AND ${photoVisible("ph")}
     ORDER BY ph.taken_at DESC NULLS LAST, ph.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => toPhotoRef(r, lang));
});

// ------------------------------------------------------------------- news

export type NewsCategory = "lajm" | "akademia" | "intervista" | "klubi" | "komuniteti";
/** Filters on the Media page: Të gjitha / Sportet / Akademia / Intervista. */
export type NewsFilter = "sports" | "academy" | "interviews";

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  date: string;
  shortDate: string;
  publishedAt: string;
  category: NewsCategory;
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
    shortDate: formatShortDate(r.published_at, lang),
    publishedAt: r.published_at.toISOString(),
    category: r.category as NewsCategory,
    discipline: pick(r, "d_name", lang),
    cover: r.cover ? toPhotoRef(r.cover, lang) : null,
  };
}

const NEWS_COLUMNS = `n.slug, n.title_sq, n.title_en, n.excerpt_sq, n.excerpt_en, n.published_at, n.category,
  d.name_sq AS d_name_sq, d.name_en AS d_name_en, ${coverSelect("n.cover_photo_id")}`;

const NEWS_FILTERS: Record<NewsFilter, string> = {
  sports: "(n.discipline_id IS NOT NULL OR n.category = 'lajm')",
  academy: "n.category = 'akademia'",
  interviews: "n.category = 'intervista'",
};

export const getNews = cache(
  async (lang: Locale, limit = 24, opts: { filter?: NewsFilter; disciplineId?: number } = {}): Promise<NewsItem[]> => {
    await connection();
    const rows = await query<NewsRow>(
      `SELECT ${NEWS_COLUMNS} FROM news n LEFT JOIN disciplines d ON d.id = n.discipline_id
       WHERE n.published_at <= now()
         ${opts.filter ? `AND ${NEWS_FILTERS[opts.filter]}` : ""}
         AND ($2::int IS NULL OR n.discipline_id = $2)
       ORDER BY n.published_at DESC LIMIT $1`,
      [limit, opts.disciplineId ?? null],
    );
    return rows.map((r) => toNewsItem(r, lang));
  },
);

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
  /** "12 nëntor 2026" */
  day: string;
  /** "e shtunë" */
  weekday: string;
  /** "17:00" */
  time: string;
  /** Day of the month in Tirana time, for the mini calendar. */
  dayOfMonth: number;
  startsAt: string;
  venue: string | null;
  competition: string | null;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  /** "78 – 70" in home–away order, when played. */
  score: string | null;
  scoreHome: number | null;
  scoreAway: number | null;
  won: boolean | null;
};

export const CLUB = "KS Tirana";

function toFixture(r: Record<string, unknown>, lang: Locale): Fixture {
  const isHome = r.is_home as boolean;
  const ours = r.score_for as number | null;
  const theirs = r.score_against as number | null;
  const opponent = r.opponent as string;
  const starts = r.starts_at as Date;
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(lang), { timeZone: TZ, ...o }).format(starts);
  const played = ours !== null && theirs !== null;
  return {
    id: r.id as number,
    discipline: { slug: r.d_slug as string, name: pick(r, "d_name", lang)! },
    home: isHome ? CLUB : opponent,
    away: isHome ? opponent : CLUB,
    isHome,
    date: formatDate(starts, lang, true),
    day: part({ day: "numeric", month: "long", year: "numeric" }),
    weekday: part({ weekday: "long" }),
    time: part({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    dayOfMonth: Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" }).format(starts)),
    startsAt: starts.toISOString(),
    venue: r.venue as string | null,
    competition: r.competition as string | null,
    status: r.status as Fixture["status"],
    score: !played ? null : isHome ? `${ours} – ${theirs}` : `${theirs} – ${ours}`,
    scoreHome: !played ? null : isHome ? ours : theirs,
    scoreAway: !played ? null : isHome ? theirs : ours,
    won: !played || ours === theirs ? null : ours! > theirs!,
  };
}

const FIXTURE_COLUMNS = `f.*, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en`;
const FIXTURE_FROM = `FROM fixtures f JOIN disciplines d ON d.id = f.discipline_id WHERE d.is_published`;

/** Next match and latest result, for the home page card. */
export const getNextAndLast = cache(async (lang: Locale) => {
  await connection();
  const [[next], [last]] = await Promise.all([
    query(
      `SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.status IN ('scheduled', 'live')
         AND f.starts_at >= now() - interval '4 hours' ORDER BY f.starts_at LIMIT 1`,
    ),
    query(`SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.status = 'finished' ORDER BY f.starts_at DESC LIMIT 1`),
  ]);
  return { next: next ? toFixture(next, lang) : null, last: last ? toFixture(last, lang) : null };
});

/** Every fixture in one calendar month (Tirana time), optionally for some disciplines. */
export const getFixturesForMonth = cache(
  async (lang: Locale, year: number, month: number, slugs: string[] | null): Promise<Fixture[]> => {
    await connection();
    const rows = await query(
      `SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM}
         AND f.starts_at >= make_timestamptz($1, $2, 1, 0, 0, 0, '${TZ}')
         AND f.starts_at <  make_timestamptz($1, $2, 1, 0, 0, 0, '${TZ}') + interval '1 month'
         AND ($3::text[] IS NULL OR d.slug = ANY($3))
       ORDER BY f.starts_at`,
      [year, month, slugs],
    );
    return rows.map((r) => toFixture(r, lang));
  },
);

/** Upcoming and recent fixtures of one discipline. */
export async function getDisciplineFixtures(lang: Locale, disciplineId: number) {
  await connection();
  const rows = await query(
    `(SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.discipline_id = $1 AND f.status <> 'finished'
        AND f.starts_at >= now() - interval '4 hours' ORDER BY f.starts_at LIMIT 4)
     UNION ALL
     (SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.discipline_id = $1 AND f.status = 'finished'
        ORDER BY f.starts_at DESC LIMIT 4)`,
    [disciplineId],
  );
  return rows.map((r) => toFixture(r, lang));
}

export async function getFixtureForCalendar(id: number) {
  await connection();
  const [r] = await query(`SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.id = $1 AND f.status <> 'cancelled'`, [id]);
  return r ? toFixture(r, "sq") : null;
}

/** All upcoming fixtures, for "Shto të gjitha ndeshjet në kalendar". */
export async function getUpcomingForCalendar(slugs: string[] | null) {
  await connection();
  const rows = await query(
    `SELECT ${FIXTURE_COLUMNS} ${FIXTURE_FROM} AND f.status IN ('scheduled', 'live', 'postponed')
       AND f.starts_at >= now() - interval '4 hours' AND ($1::text[] IS NULL OR d.slug = ANY($1))
     ORDER BY f.starts_at LIMIT 500`,
    [slugs],
  );
  return rows.map((r) => toFixture(r, "sq"));
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
  cover: PhotoRef | null;
};

export const getPrograms = cache(async (lang: Locale): Promise<Program[]> => {
  await connection();
  const rows = await query<Record<string, unknown> & { cover: PhotoRow | null }>(
    `SELECT a.*, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en,
       CASE WHEN ${personVisible("pe")} THEN pe.full_name END AS coach_name,
       (SELECT json_build_object(${PHOTO_COLUMNS("cp")
         .split(", ")
         .map((c) => `'${c.split(".")[1]}', ${c}`)
         .join(", ")})
        FROM photos cp WHERE cp.discipline_id = d.id AND ${photoVisible("cp")} AND cp.width > cp.height
        ORDER BY (cp.id = d.cover_photo_id) DESC, cp.is_featured DESC, cp.sort_order LIMIT 1) AS cover
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
    cover: r.cover ? toPhotoRef(r.cover, lang) : null,
  }));
});

// ------------------------------------------------------------------- shop

export type ProductCategory = "fanella" | "stervitje" | "aksesore";
export const PRODUCT_CATEGORIES: ProductCategory[] = ["fanella", "stervitje", "aksesore"];

export type Product = {
  slug: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  price: string | null;
  sizes: string[];
  inStock: boolean;
  photo: PhotoRef | null;
};

function toProduct(r: Record<string, unknown> & { cover: PhotoRow | null }, lang: Locale): Product {
  const lek = new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 0 });
  return {
    slug: r.slug as string,
    name: pick(r, "name", lang)!,
    description: pick(r, "description", lang),
    category: r.category as ProductCategory,
    price: r.price_lek === null ? null : `${lek.format(r.price_lek as number)} L`,
    sizes: r.sizes as string[],
    inStock: r.in_stock as boolean,
    photo: r.cover ? toPhotoRef(r.cover, lang) : null,
  };
}

export const getProducts = cache(async (lang: Locale, category?: ProductCategory): Promise<Product[]> => {
  await connection();
  const rows = await query<Record<string, unknown> & { cover: PhotoRow | null }>(
    `SELECT pr.*, ${coverSelect("pr.photo_id")} FROM products pr
     WHERE pr.is_published AND ($1::product_category IS NULL OR pr.category = $1)
     ORDER BY pr.sort_order, pr.name_sq`,
    [category ?? null],
  );
  return rows.map((r) => toProduct(r, lang));
});

export const getProduct = cache(async (slug: string, lang: Locale): Promise<Product | null> => {
  await connection();
  const [r] = await query<Record<string, unknown> & { cover: PhotoRow | null }>(
    `SELECT pr.*, ${coverSelect("pr.photo_id")} FROM products pr WHERE pr.slug = $1 AND pr.is_published`,
    [slug],
  );
  return r ? toProduct(r, lang) : null;
});

// ------------------------------------------------------------------ stats

/** Aggregate numbers for "KS Tirana në shifra" and the Disciplines stats strip (no personal data). */
export const getClubStats = cache(async () => {
  await connection();
  const [r] = await query<Record<string, number>>(
    `SELECT
       (SELECT count(*) FROM disciplines WHERE is_published)::int AS disciplines,
       (SELECT count(*) FROM people pe JOIN disciplines d ON d.id = pe.discipline_id WHERE d.is_published)::int AS people,
       (SELECT count(*) FROM people pe JOIN disciplines d ON d.id = pe.discipline_id
         WHERE d.is_published AND pe.role = 'athlete')::int AS athletes,
       (SELECT count(*) FROM photos WHERE is_published)::int AS photos,
       (SELECT count(*) FROM fixtures f JOIN disciplines d ON d.id = f.discipline_id
         WHERE d.is_published AND f.status <> 'cancelled'
           AND f.starts_at >= date_trunc('year', now() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}'
           AND f.starts_at < (date_trunc('year', now() AT TIME ZONE '${TZ}') + interval '1 year') AT TIME ZONE '${TZ}')::int AS events`,
  );
  return r as { disciplines: number; people: number; athletes: number; photos: number; events: number };
});

// ----------------------------------------------------------------- search

export type SearchResults = {
  people: { name: string; href: string; discipline: string; portrait: PhotoRef | null }[];
  disciplines: { name: string; href: string; cover: PhotoRef | null }[];
  news: NewsItem[];
};

/** Accent-insensitive match: "e" finds "ë", "c" finds "ç". */
const norm = (col: string) => `translate(lower(${col}), 'ëç', 'ec')`;

export async function search(lang: Locale, q: string): Promise<SearchResults> {
  await connection();
  const needle = `%${q.toLowerCase().replace(/[ë]/g, "e").replace(/[ç]/g, "c").replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  const photo = (a: string) =>
    `(SELECT json_build_object(${PHOTO_COLUMNS("sp")
      .split(", ")
      .map((c) => `'${c.split(".")[1]}', ${c}`)
      .join(", ")}) FROM photos sp WHERE ${a} AND ${photoVisible("sp")}
      ORDER BY sp.is_featured DESC, sp.sort_order LIMIT 1) AS cover`;

  const [people, disciplines, news] = await Promise.all([
    query<Record<string, unknown> & { cover: PhotoRow | null }>(
      `SELECT pe.slug, pe.full_name, d.slug AS d_slug, d.name_sq AS d_name_sq, d.name_en AS d_name_en,
         ${photo("sp.id = COALESCE(pe.portrait_photo_id, (SELECT x.photo_id FROM photo_people x WHERE x.person_id = pe.id LIMIT 1))")}
       FROM people pe JOIN disciplines d ON d.id = pe.discipline_id
       WHERE d.is_published AND ${personVisible("pe")} AND ${norm("pe.full_name")} LIKE $1
       ORDER BY pe.full_name LIMIT 24`,
      [needle],
    ),
    query<Record<string, unknown> & { cover: PhotoRow | null }>(
      `SELECT d.slug, d.name_sq, d.name_en, ${photo("sp.id = d.cover_photo_id")}
       FROM disciplines d WHERE d.is_published
         AND (${norm("d.name_sq")} LIKE $1 OR ${norm("coalesce(d.name_en, '')")} LIKE $1)
       ORDER BY d.sort_order LIMIT 16`,
      [needle],
    ),
    query<NewsRow>(
      `SELECT ${NEWS_COLUMNS} FROM news n LEFT JOIN disciplines d ON d.id = n.discipline_id
       WHERE n.published_at <= now() AND (${norm("n.title_sq")} LIKE $1 OR ${norm("coalesce(n.title_en, '')")} LIKE $1
         OR ${norm("coalesce(n.excerpt_sq, '')")} LIKE $1 OR ${norm("coalesce(n.excerpt_en, '')")} LIKE $1)
       ORDER BY n.published_at DESC LIMIT 12`,
      [needle],
    ),
  ]);

  return {
    people: people.map((r) => ({
      name: r.full_name as string,
      href: `/${lang}/sportet/${r.d_slug}/${r.slug}`,
      discipline: pick(r, "d_name", lang)!,
      portrait: r.cover ? toPhotoRef(r.cover, lang) : null,
    })),
    disciplines: disciplines.map((r) => ({
      name: pick(r, "name", lang)!,
      href: `/${lang}/sportet/${r.slug}`,
      cover: r.cover ? toPhotoRef(r.cover, lang) : null,
    })),
    news: news.map((r) => toNewsItem(r, lang)),
  };
}
