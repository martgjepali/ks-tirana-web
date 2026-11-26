import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { query } from "@/lib/db/pool";
import { mergeSettings, type SiteSettings } from "@/lib/club";
import type { Locale } from "./locale";

/*
 * Club-wide content edited in /admin: settings, sponsors and magazine issues.
 * Read on every request (like the rest of the site), so edits show at once.
 */

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  await connection();
  try {
    const [row] = await query<{ value: Partial<SiteSettings> }>("SELECT value FROM site_settings WHERE key = 'site'");
    return mergeSettings(row?.value);
  } catch {
    // Database unreachable or not migrated yet: the site still renders with defaults.
    return mergeSettings(null);
  }
});

export type Partner = { id: number; name: string; logo: string; website: string | null };

export const getPartners = cache(async (): Promise<{ main: Partner | null; sponsors: Partner[] }> => {
  await connection();
  const rows = await query<{ id: number; name: string; logo_url: string; website: string | null; is_main_supporter: boolean }>(
    `SELECT id, name, logo_url, website, is_main_supporter FROM partners
     WHERE is_published ORDER BY sort_order, id`,
  );
  const toPartner = (r: (typeof rows)[number]): Partner => ({ id: r.id, name: r.name, logo: r.logo_url, website: r.website });
  const main = rows.find((r) => r.is_main_supporter);
  return { main: main ? toPartner(main) : null, sponsors: rows.filter((r) => !r.is_main_supporter).map(toPartner) };
});

export type MagazineIssue = { id: number; number: number; date: string | null; cover: string; pages: string[] };

export const getMagazineIssues = cache(async (lang: Locale): Promise<MagazineIssue[]> => {
  await connection();
  const rows = await query<{ id: number; number: number; date_sq: string | null; date_en: string | null; cover_url: string; pages: string[] }>(
    `SELECT i.id, i.number, i.date_sq, i.date_en, i.cover_url,
       COALESCE((SELECT array_agg(p.image_url ORDER BY p.sort_order, p.id) FROM magazine_pages p WHERE p.issue_id = i.id), '{}') AS pages
     FROM magazine_issues i WHERE i.is_published ORDER BY i.number DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    date: (lang === "en" ? r.date_en : r.date_sq) || r.date_sq || r.date_en,
    cover: r.cover_url,
    pages: r.pages,
  }));
});
