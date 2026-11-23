/**
 * Loads the client's filled-in data workbook into `people` and `disciplines`.
 *
 *   npm run import:workbook -- "C:\path\KS-Tirana-Te-dhenat-per-faqen.xlsx"
 *   npm run import:workbook -- file.xlsx --dry-run       show changes, write nothing
 *   npm run import:workbook -- file.xlsx --update-slugs  also rebuild URL slugs from corrected names
 *                                                        (only before launch: it changes page URLs)
 *
 * Run import:photos first — rows are matched to people by their original folder name.
 * Only non-empty cells are applied, so a half-filled workbook never erases data.
 * Consent "Po" publishes the person; "Jo" unpublishes them.
 */
import ExcelJS from "exceljs";
import path from "node:path";
import { getPool, transaction } from "../lib/db/pool";
import { slugify } from "./import/text";

try {
  process.loadEnvFile();
} catch {}

type CellValue = ExcelJS.CellValue;

/** Cell content as a string, keeping line breaks (for bios and descriptions). */
function longText(value: CellValue): string | null {
  if (value == null) return null;
  let raw: string;
  if (value instanceof Date) raw = value.toISOString().slice(0, 10);
  else if (typeof value === "object" && "richText" in value) raw = value.richText.map((r) => r.text).join("");
  else if (typeof value === "object" && "result" in value) return longText(value.result as CellValue);
  else if (typeof value === "object" && "text" in value) raw = String(value.text);
  else raw = String(value);
  return raw.trim() || null;
}

/** Single-line cell content with whitespace collapsed. */
function text(value: CellValue): string | null {
  return longText(value)?.replace(/\s+/g, " ") ?? null;
}

function yesNo(value: CellValue): boolean | null {
  const s = text(value)?.toLowerCase();
  if (!s) return null;
  if (["po", "yes", "p", "y", "true", "1"].includes(s)) return true;
  if (["jo", "no", "j", "n", "false", "0"].includes(s)) return false;
  return null;
}

function integer(value: CellValue, min: number, max: number): number | null {
  const s = text(value);
  if (!s) return null;
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

const ROLE: Record<string, string> = {
  sportist: "athlete",
  sportiste: "athlete",
  trajner: "head_coach",
  "zv. trajner": "assistant_coach",
  "zv trajner": "assistant_coach",
  "zevendes trajner": "assistant_coach",
};

const normFolder = (s: string) => s.replace(/\s+/g, " ").trim().toUpperCase();

/** Finds a sheet by name, ignoring accents ("Sportistët" = "Sportistet"). */
function sheet(wb: ExcelJS.Workbook, name: string) {
  const key = slugify(name);
  const found = wb.worksheets.find((ws) => slugify(ws.name) === key);
  if (!found) throw new Error(`Sheet "${name}" not found in workbook`);
  return found;
}

/** Maps header text → column number, so the client may reorder columns. */
function headerIndex(ws: ExcelJS.Worksheet) {
  const map = new Map<string, number>();
  ws.getRow(1).eachCell((cell, col) => {
    const h = text(cell.value);
    if (h) map.set(slugify(h), col);
  });
  return (header: string) => {
    const col = map.get(slugify(header));
    if (!col) throw new Error(`Column "${header}" not found in sheet "${ws.name}"`);
    return col;
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const updateSlugs = args.includes("--update-slugs");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error('Usage: npm run import:workbook -- "<file.xlsx>" [--dry-run] [--update-slugs]');
    process.exit(1);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve(file));
  const changes: string[] = [];
  const problems: string[] = [];

  await transaction(async (client) => {
    // ------------------------------------------------------------ people
    const ws = sheet(wb, "Sportistët");
    const col = headerIndex(ws);
    const c = {
      discipline: col("Disiplina"),
      folder: col("Emri i dosjes (origjinal)"),
      name: col("Emri i plotë"),
      role: col("Roli"),
      captain: col("Kapiten/e"),
      shirt: col("Numri i fanellës"),
      position: col("Pozicioni / Pesha / Specialiteti"),
      birthYear: col("Viti i lindjes"),
      nationality: col("Kombësia"),
      bioSq: col("Biografi e shkurtër (shqip)"),
      bioEn: col("Biografi e shkurtër (anglisht)"),
      achievements: col("Arritjet kryesore"),
      minor: col("I mitur? (Po/Jo)"),
      consent: col("Pëlqim për publikim (Po/Jo)"),
    };

    const { rows: people } = await client.query<{
      id: number; discipline_id: number; slug: string; full_name: string; source_folder: string; discipline: string;
    }>(`SELECT pe.id, pe.discipline_id, pe.slug, pe.full_name, pe.source_folder, d.name_sq AS discipline
        FROM people pe JOIN disciplines d ON d.id = pe.discipline_id WHERE pe.source_folder IS NOT NULL`);
    const byFolder = Map.groupBy(people, (p) => normFolder(p.source_folder.split("/").slice(1).join("/")));

    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const folder = text(row.getCell(c.folder).value);
      if (!folder) continue;
      let matches = byFolder.get(normFolder(folder)) ?? [];
      if (matches.length > 1) {
        const disc = slugify(text(row.getCell(c.discipline).value) ?? "");
        matches = matches.filter((m) => slugify(m.discipline) === disc);
      }
      if (matches.length !== 1) {
        problems.push(`Row ${r}: no unique person for folder "${folder}"`);
        continue;
      }
      const person = matches[0];

      const set: Record<string, unknown> = {};
      const name = text(row.getCell(c.name).value);
      if (name && name !== person.full_name) {
        set.full_name = name;
        if (updateSlugs) {
          const { rows: taken } = await client.query<{ slug: string }>(
            "SELECT slug FROM people WHERE discipline_id = $1 AND id <> $2", [person.discipline_id, person.id]);
          const used = new Set(taken.map((t) => t.slug));
          let slug = slugify(name);
          for (let n = 2; used.has(slug); n++) slug = `${slugify(name)}-${n}`;
          if (slug && slug !== person.slug) set.slug = slug;
        }
      }
      const roleText = text(row.getCell(c.role).value)?.toLowerCase();
      if (roleText) {
        if (ROLE[roleText]) set.role = ROLE[roleText];
        else problems.push(`Row ${r} (${folder}): unknown role "${roleText}"`);
      }
      const captain = yesNo(row.getCell(c.captain).value);
      if (captain !== null) set.is_captain = captain;
      const shirt = integer(row.getCell(c.shirt).value, 0, 999);
      if (shirt !== null) set.shirt_number = shirt;
      const birthYear = integer(row.getCell(c.birthYear).value, 1900, 2100);
      if (birthYear !== null) set.birth_year = birthYear;
      else if (text(row.getCell(c.birthYear).value)) problems.push(`Row ${r} (${folder}): unreadable birth year`);
      for (const [key, column, reader] of [
        ["position", c.position, text], ["nationality", c.nationality, text],
        ["bio_sq", c.bioSq, longText], ["bio_en", c.bioEn, longText], ["achievements_sq", c.achievements, longText],
      ] as const) {
        const value = reader(row.getCell(column).value);
        if (value) set[key] = value;
      }
      const minor = yesNo(row.getCell(c.minor).value);
      if (minor !== null) set.is_minor = minor;
      const consent = yesNo(row.getCell(c.consent).value);
      if (consent !== null) {
        set.consent_confirmed = consent;
        set.is_published = consent;
        set.consent_note = `Workbook ${path.basename(file)}, imported ${new Date().toISOString().slice(0, 10)}`;
      } else if (text(row.getCell(c.consent).value)) {
        problems.push(`Row ${r} (${folder}): consent must be Po or Jo`);
      }

      // Apply only what actually differs, so re-running reports (and touches) nothing.
      const fields = Object.keys(set).filter((k) => k !== "consent_note");
      if (!fields.length) continue;
      const { rows: current } = await client.query<Record<string, unknown>>(
        `SELECT ${fields.join(", ")} FROM people WHERE id = $1`, [person.id]);
      const changed = fields.filter((k) => current[0][k] !== set[k]);
      if (!changed.length) continue;
      if (changed.includes("consent_confirmed") || changed.includes("is_published")) changed.push("consent_note");
      await client.query(
        `UPDATE people SET ${changed.map((k, i) => `${k} = $${i + 2}`).join(", ")} WHERE id = $1`,
        [person.id, ...changed.map((k) => set[k])],
      );
      changes.push(`${person.full_name}: ${changed.filter((k) => k !== "consent_note").join(", ")}`);
    }

    // ------------------------------------------------------- disciplines
    const ds = sheet(wb, "Disiplinat");
    const dc = headerIndex(ds);
    const d = {
      folder: dc("Dosja (origjinale)"),
      nameSq: dc("Emri në shqip"),
      nameEn: dc("Emri në anglisht"),
      descSq: dc("Përshkrim i shkurtër (shqip)"),
      descEn: dc("Përshkrim i shkurtër (anglisht)"),
      ageGroups: dc("Kategoritë / grupmoshat"),
      schedule: dc("Orari i stërvitjeve"),
      venue: dc("Ambienti / palestra"),
      trophies: dc("Trofetë dhe arritjet kryesore"),
    };
    for (let r = 2; r <= ds.rowCount; r++) {
      const row = ds.getRow(r);
      const folder = text(row.getCell(d.folder).value);
      if (!folder) continue;
      const set: Record<string, string> = {};
      for (const [key, column, reader] of [
        ["name_sq", d.nameSq, text], ["name_en", d.nameEn, text],
        ["description_sq", d.descSq, longText], ["description_en", d.descEn, longText],
        ["age_groups_sq", d.ageGroups, longText], ["schedule_sq", d.schedule, longText],
        ["venue", d.venue, text], ["achievements_sq", d.trophies, longText],
      ] as const) {
        const value = reader(row.getCell(column).value);
        if (value) set[key] = value;
      }
      const keys = Object.keys(set);
      if (!keys.length) continue;
      const { rows, rowCount } = await client.query<Record<string, string | null>>(
        `SELECT ${keys.join(", ")} FROM disciplines WHERE upper(source_folder) = $1`, [normFolder(folder)]);
      if (!rowCount) {
        problems.push(`Disiplinat row ${r}: unknown folder "${folder}"`);
        continue;
      }
      const changed = keys.filter((k) => rows[0][k] !== set[k]);
      if (!changed.length) continue;
      await client.query(
        `UPDATE disciplines SET ${changed.map((k, i) => `${k} = $${i + 2}`).join(", ")} WHERE upper(source_folder) = $1`,
        [normFolder(folder), ...changed.map((k) => set[k])],
      );
      changes.push(`Discipline ${folder}: ${changed.join(", ")}`);
    }

    if (dryRun) throw new DryRun();
  }).catch((error) => {
    if (!(error instanceof DryRun)) throw error;
  });

  // ------------------------------------------------- answers to questions
  const answers: string[] = [];
  try {
    const qs = sheet(wb, "Pyetje");
    const qc = headerIndex(qs);
    for (let r = 2; r <= qs.rowCount; r++) {
      const row = qs.getRow(r);
      const answer = longText(row.getCell(qc("Përgjigja juaj")).value);
      if (answer) answers.push(`${text(row.getCell(qc("Nr.")).value)}. [${text(row.getCell(qc("Tema")).value)}] ${answer}`);
    }
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  console.log(`# Workbook import${dryRun ? " (dry run — nothing saved)" : ""}\n`);
  console.log(`## Changes (${changes.length})`);
  changes.forEach((line) => console.log(`- ${line}`));
  if (problems.length) {
    console.log(`\n## Problems (${problems.length})`);
    problems.forEach((line) => console.log(`- ${line}`));
  }
  console.log(`\n## Answers to our questions (${answers.length})`);
  answers.forEach((line) => console.log(`- ${line}`));
  await getPool().end();
  if (problems.length) process.exitCode = 1;
}

class DryRun extends Error {}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
