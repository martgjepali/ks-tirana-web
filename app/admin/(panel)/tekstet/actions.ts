"use server";

import { requireStaff } from "@/lib/admin/session";
import { run } from "@/lib/admin/form";
import { transaction } from "@/lib/db/pool";
import { locales } from "@/app/[lang]/dictionaries";
import { sectionDefaults, TEXT_SECTIONS } from "./sections";
import { notFound } from "next/navigation";

export async function saveTextSection(section: string, form: FormData) {
  await requireStaff();
  if (!Object.hasOwn(TEXT_SECTIONS, section)) notFound();
  await run(`/admin/tekstet/${section}`, async () => {
    const dictionaries = await Promise.all(locales.map((locale) => sectionDefaults(locale, section)));
    const changes: { locale: string; key: string; value: string }[] = [];
    const resets: { locale: string; key: string }[] = [];
    for (const [i, defaults] of dictionaries.entries()) {
      const locale = locales[i];
      for (const [key, initial] of defaults) {
        const value = form.get(`${locale}:${key}`);
        if (typeof value !== "string") continue;
        if (value.trim() && value !== initial) changes.push({ locale, key, value });
        else resets.push({ locale, key });
      }
    }
    await transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`site_texts:${section}`]);
      await client.query(
        `DELETE FROM site_texts t USING jsonb_to_recordset($1::jsonb) AS r(locale text, key text)
         WHERE t.locale = r.locale AND t.key = r.key`, [JSON.stringify(resets)],
      );
      await client.query(
        `INSERT INTO site_texts (locale, key, value)
         SELECT locale, key, value FROM jsonb_to_recordset($1::jsonb) AS r(locale text, key text, value text)
         ON CONFLICT (locale, key) DO UPDATE SET value = excluded.value, updated_at = now()
         WHERE site_texts.value IS DISTINCT FROM excluded.value`, [JSON.stringify(changes)],
      );
    });
  });
}
