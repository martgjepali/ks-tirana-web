/**
 * Loads the official team lists from the client's final design into the database.
 *
 *   npm run import:rosters              apply
 *   npm run import:rosters -- --dry-run show what would change, write nothing
 *
 * - Creates missing disciplines (Shah, Qitje, Tenis, MMA) and renames existing
 *   ones to the design's names; sort order follows the design's "Disiplinat" grid.
 * - Matches each listed person to an existing one in the same discipline by name
 *   (ignoring case and accents), otherwise adds them.
 * - Everyone listed is published with consent confirmed: the club provided these
 *   lists for publication (2026-11-26). People not listed are left as they are.
 * - Adds the Academy programmes shown in the design.
 *
 * Safe to re-run: it updates instead of duplicating. Runs in one transaction.
 */
import { getPool } from "../lib/db/pool";
import { ROSTERS } from "./import/rosters";
import { slugify } from "./import/text";

try {
  process.loadEnvFile();
} catch {}

const CONSENT_NOTE = "Lista zyrtare e ekipit nga klubi (KS_TIRANA_WEB_Final.pdf), 2026-11-26";
const norm = (s: string) => slugify(s).replace(/-/g, " ");

/** Academy programmes from the design ("Programet e Akademisë"), ages 6–18 ("Zgjidh grupmoshën"). */
const PROGRAMS = [
  { discipline: "basketboll-meshkuj", sq: "Basketboll për meshkuj", en: "Boys' basketball" },
  { discipline: "basketboll-femra", sq: "Basketboll për femra", en: "Girls' basketball" },
  { discipline: "volejboll-meshkuj", sq: "Volejboll për meshkuj", en: "Boys' volleyball" },
  { discipline: "volejboll-femra", sq: "Volejboll për femra", en: "Girls' volleyball" },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const host = new URL(process.env.DATABASE_URL ?? "postgres://localhost").hostname;
  console.log(`${dryRun ? "[dry run] " : ""}Importing rosters into ${host}…`);

  const client = await getPool().connect();
  const stats = { disciplinesCreated: 0, disciplinesUpdated: 0, matched: 0, added: 0, programs: 0 };
  try {
    await client.query("BEGIN");

    for (const [order, r] of ROSTERS.entries()) {
      // ---- discipline
      const existing = await client.query<{ id: number }>("SELECT id FROM disciplines WHERE slug = $1", [r.slug]);
      let disciplineId: number;
      if (existing.rows[0]) {
        disciplineId = existing.rows[0].id;
        await client.query(
          "UPDATE disciplines SET name_sq = $2, name_en = $3, sort_order = $4, is_published = true WHERE id = $1",
          [disciplineId, r.name.sq, r.name.en, order],
        );
        stats.disciplinesUpdated++;
      } else {
        const inserted = await client.query<{ id: number }>(
          `INSERT INTO disciplines (slug, name_sq, name_en, sort_order, is_published)
           VALUES ($1, $2, $3, $4, true) RETURNING id`,
          [r.slug, r.name.sq, r.name.en, order],
        );
        disciplineId = inserted.rows[0].id;
        stats.disciplinesCreated++;
        console.log(`  + discipline ${r.name.sq}`);
      }

      // ---- people
      const current = await client.query<{ id: number; full_name: string; slug: string }>(
        "SELECT id, full_name, slug FROM people WHERE discipline_id = $1",
        [disciplineId],
      );
      const byName = new Map(current.rows.map((p) => [norm(p.full_name), p]));
      const slugs = new Set(current.rows.map((p) => p.slug));
      const listed = [
        ...r.staff.map((s) => ({ name: s.name, role: s.role as string, title: s.title ?? null })),
        ...r.athletes.map((name) => ({ name, role: "athlete", title: null })),
      ];

      for (const [i, person] of listed.entries()) {
        const match = byName.get(norm(person.name));
        if (match) {
          await client.query(
            `UPDATE people SET full_name = $2, role = $3, position = COALESCE($4, position), sort_order = $5,
               consent_confirmed = true, consent_note = $6, is_published = true WHERE id = $1`,
            [match.id, person.name, person.role, person.title, i, CONSENT_NOTE],
          );
          stats.matched++;
        } else {
          let slug = slugify(person.name);
          for (let n = 2; slugs.has(slug); n++) slug = `${slugify(person.name)}-${n}`;
          slugs.add(slug);
          await client.query(
            `INSERT INTO people (discipline_id, slug, full_name, role, position, sort_order,
               consent_confirmed, consent_note, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, true, $7, true)`,
            [disciplineId, slug, person.name, person.role, person.title, i, CONSENT_NOTE],
          );
          stats.added++;
        }
      }
    }

    // ---- academy programmes
    for (const [i, p] of PROGRAMS.entries()) {
      await client.query(
        `INSERT INTO academy_programs (discipline_id, slug, name_sq, name_en, age_min, age_max, sort_order, is_published)
         SELECT d.id, $2, $3, $4, 6, 18, $5, true FROM disciplines d WHERE d.slug = $1
         ON CONFLICT (slug) DO UPDATE SET name_sq = EXCLUDED.name_sq, name_en = EXCLUDED.name_en,
           sort_order = EXCLUDED.sort_order, is_published = true`,
        [p.discipline, `akademia-${p.discipline}`, p.sq, p.en, i],
      );
      stats.programs++;
    }

    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await getPool().end();
  }

  console.log(
    `${dryRun ? "Would change" : "Done"}: ${stats.disciplinesCreated} disciplines created, ${stats.disciplinesUpdated} updated; ` +
      `${stats.matched} people matched, ${stats.added} added (all published); ${stats.programs} academy programmes.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
