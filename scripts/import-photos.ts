/**
 * Imports the client's photo archive into the database + storage.
 *
 *   npm run import:photos -- "D:\KS Tirana WEB"            import (safe to re-run)
 *   npm run import:photos -- "D:\KS Tirana WEB" --dry-run  scan and report only
 *
 * The archive is only ever READ. Nothing in it is renamed, moved or written.
 *
 * Archive layout:
 *   White and Blue Legacy/<DISCIPLINE>/<PERSON (ROLE)>/<photos>
 *   White and Blue Legacy/<DISCIPLINE>/<photos>     discipline photos, no person
 *   <Curated folder>/<photos>                       10 featured photos per team
 *
 * Re-running is idempotent: disciplines and people are matched by source
 * folder and never overwritten (admin/workbook edits survive), photos are
 * matched by SHA-256 and only reprocessed if their files are missing.
 */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PoolClient } from "pg";
import { getPool, transaction } from "../lib/db/pool";
import { processPhoto, PHOTO_SIZES, type PhotoSize } from "../lib/images/process";
import { getStorage } from "../lib/storage";
import { CURATED_FOLDERS, DISCIPLINES, LEGACY_ROOT } from "./import/disciplines";
import { slugify, titleCase } from "./import/text";

try {
  process.loadEnvFile();
} catch {}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const RAW_EXT = new Set([".nef", ".cr2", ".cr3", ".arw", ".dng", ".raf", ".orf"]);
const CONCURRENCY = 3;

type Role = "athlete" | "head_coach" | "assistant_coach";

type PersonEntry = {
  disciplineFolder: string;
  folder: string; // folder name on disk
  sourceFolder: string; // "<DISCIPLINE>/<PERSON>"
  fullName: string;
  role: Role;
  isCaptain: boolean;
  unknownTags: string[];
};

type FileEntry = {
  abs: string;
  rel: string; // relative to archive root, forward slashes
  disciplineFolder: string;
  person: PersonEntry | null;
  curated: boolean;
};

type PhotoGroup = {
  sha256: string;
  files: FileEntry[];
  disciplineFolder: string;
  people: PersonEntry[];
  featured: boolean;
};

// ----------------------------------------------------------------- parsing

/** "ENISA QOSJA (KAPITENE)" → { name: "Enisa Qosja", captain }, "(ZV TRAINER )" → assistant coach. */
function parsePersonFolder(disciplineFolder: string, folder: string): PersonEntry {
  let role: Role = "athlete";
  let isCaptain = false;
  const unknownTags: string[] = [];
  for (const match of folder.matchAll(/\(([^)]*)\)/g)) {
    const tag = match[1].trim().toUpperCase().replace(/\s+/g, " ");
    if (/^(ZV\.?|ZEVENDES) ?TRAINER$/.test(tag)) role = "assistant_coach";
    else if (/^TRAINER$/.test(tag)) role = "head_coach";
    else if (/^KAPITENE?$/.test(tag)) isCaptain = true;
    else unknownTags.push(match[1].trim());
  }
  const bare = folder.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  return {
    disciplineFolder,
    folder,
    sourceFolder: `${disciplineFolder}/${folder}`,
    fullName: titleCase(bare),
    role,
    isCaptain,
    unknownTags,
  };
}

// ----------------------------------------------------------------- scanning

async function listDir(dir: string) {
  return (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, "en"));
}

type Scan = {
  files: FileEntry[];
  people: PersonEntry[];
  rawSkipped: string[];
  otherSkipped: string[];
  unknownFolders: string[];
};

async function scanArchive(root: string): Promise<Scan> {
  const scan: Scan = { files: [], people: [], rawSkipped: [], otherSkipped: [], unknownFolders: [] };
  const known = new Set(DISCIPLINES.map((d) => d.folder));
  const rel = (abs: string) => path.relative(root, abs).split(path.sep).join("/");

  async function collect(dir: string, disciplineFolder: string, person: PersonEntry | null, curated: boolean) {
    for (const entry of await listDir(dir)) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Nested folders inside a person folder: still that person's photos.
        await collect(abs, disciplineFolder, person, curated);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) scan.files.push({ abs, rel: rel(abs), disciplineFolder, person, curated });
      else if (RAW_EXT.has(ext)) scan.rawSkipped.push(rel(abs));
      else if (!entry.name.startsWith(".") && entry.name !== "Thumbs.db" && entry.name !== "desktop.ini") {
        scan.otherSkipped.push(rel(abs));
      }
    }
  }

  const legacy = path.join(root, LEGACY_ROOT);
  for (const disc of await listDir(legacy)) {
    if (!disc.isDirectory()) continue;
    if (!known.has(disc.name)) {
      scan.unknownFolders.push(`${LEGACY_ROOT}/${disc.name}`);
      continue;
    }
    const discDir = path.join(legacy, disc.name);
    for (const entry of await listDir(discDir)) {
      const abs = path.join(discDir, entry.name);
      if (entry.isDirectory()) {
        const person = parsePersonFolder(disc.name, entry.name);
        scan.people.push(person);
        await collect(abs, disc.name, person, false);
      } else {
        // Loose file in a discipline folder = discipline photo with no person.
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXT.has(ext)) scan.files.push({ abs, rel: rel(abs), disciplineFolder: disc.name, person: null, curated: false });
        else if (RAW_EXT.has(ext)) scan.rawSkipped.push(rel(abs));
      }
    }
  }

  for (const top of await listDir(root)) {
    if (!top.isDirectory() || top.name === LEGACY_ROOT) continue;
    const disciplineFolder = CURATED_FOLDERS[top.name];
    if (!disciplineFolder) {
      scan.unknownFolders.push(top.name);
      continue;
    }
    await collect(path.join(root, top.name), disciplineFolder, null, true);
  }
  return scan;
}

function hashFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(file)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", () => resolve(hash.digest("hex")));
  });
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function groupByHash(files: FileEntry[], hashes: string[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>();
  files.forEach((file, i) => {
    const sha256 = hashes[i];
    let group = groups.get(sha256);
    if (!group) {
      group = { sha256, files: [], disciplineFolder: file.disciplineFolder, people: [], featured: false };
      groups.set(sha256, group);
    }
    // The first person-folder copy decides the discipline over a curated copy.
    if (!file.curated && group.files.every((f) => f.curated)) group.disciplineFolder = file.disciplineFolder;
    group.files.push(file);
    if (file.person && !group.people.includes(file.person)) group.people.push(file.person);
    if (file.curated) group.featured = true;
  });
  return [...groups.values()].sort((a, b) => a.files[0].rel.localeCompare(b.files[0].rel, "en"));
}

// ----------------------------------------------------------------- database

const ROLE_RANK: Record<Role, number> = { head_coach: 0, assistant_coach: 1, athlete: 2 };

async function upsertDisciplines(client: PoolClient) {
  for (const [i, d] of DISCIPLINES.entries()) {
    await client.query(
      `INSERT INTO disciplines (slug, source_folder, name_sq, name_en, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (source_folder) DO NOTHING`,
      [d.slug, d.folder, d.nameSq, d.nameEn, i],
    );
  }
  const { rows } = await client.query<{ id: number; source_folder: string; name_sq: string; name_en: string | null }>(
    "SELECT id, source_folder, name_sq, name_en FROM disciplines WHERE source_folder = ANY($1)",
    [DISCIPLINES.map((d) => d.folder)],
  );
  return new Map(rows.map((r) => [r.source_folder, r]));
}

async function upsertPeople(client: PoolClient, people: PersonEntry[], disciplineIds: Map<string, { id: number }>) {
  const byDiscipline = Map.groupBy(people, (p) => p.disciplineFolder);
  for (const [folder, list] of byDiscipline) {
    const disciplineId = disciplineIds.get(folder)!.id;
    const { rows } = await client.query<{ slug: string; source_folder: string | null }>(
      "SELECT slug, source_folder FROM people WHERE discipline_id = $1",
      [disciplineId],
    );
    const existingFolders = new Set(rows.map((r) => r.source_folder));
    const usedSlugs = new Set(rows.map((r) => r.slug));
    const ordered = [...list].sort(
      (a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.fullName.localeCompare(b.fullName, "sq"),
    );
    for (const [i, person] of ordered.entries()) {
      if (existingFolders.has(person.sourceFolder)) continue;
      const base = slugify(person.fullName) || "person";
      let slug = base;
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`;
      usedSlugs.add(slug);
      await client.query(
        `INSERT INTO people (discipline_id, slug, full_name, source_folder, role, is_captain, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (source_folder) DO NOTHING`,
        [disciplineId, slug, person.fullName, person.sourceFolder, person.role, person.isCaptain, i],
      );
    }
  }
  const { rows } = await client.query<{ id: number; source_folder: string }>(
    "SELECT id, source_folder FROM people WHERE source_folder = ANY($1)",
    [people.map((p) => p.sourceFolder)],
  );
  return new Map(rows.map((r) => [r.source_folder, r.id]));
}

// ----------------------------------------------------------------- main

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const rootArg = args.find((a) => !a.startsWith("--"));
  if (!rootArg) {
    console.error('Usage: npm run import:photos -- "D:\\KS Tirana WEB" [--dry-run]');
    process.exit(1);
  }
  const root = path.resolve(rootArg);
  if (!(await stat(path.join(root, LEGACY_ROOT)).catch(() => null))?.isDirectory()) {
    console.error(`Not an archive folder (missing "${LEGACY_ROOT}"): ${root}`);
    process.exit(1);
  }
  const storageDir = path.resolve(process.env.STORAGE_DIR ?? "./storage");
  if (storageDir.toLowerCase().startsWith(root.toLowerCase())) {
    console.error("STORAGE_DIR must not be inside the archive — the archive is read-only.");
    process.exit(1);
  }

  const started = Date.now();
  console.log(`Scanning ${root} …`);
  const scan = await scanArchive(root);
  console.log(`  ${scan.files.length} image files, ${scan.people.length} person folders. Hashing …`);
  const hashes = await mapLimit(scan.files, 8, (f) => hashFile(f.abs));
  const groups = groupByHash(scan.files, hashes);
  const mergedCopies = scan.files.length - groups.length;
  console.log(`  ${groups.length} unique photos (${mergedCopies} duplicate copies merged).`);

  const report: string[] = [];
  const failed: string[] = [];
  let created = 0;
  let regenerated = 0;
  let unchanged = 0;

  if (!dryRun) {
    const pool = getPool();
    const storage = getStorage();

    const { disciplines, peopleIds } = await transaction(async (client) => {
      const disciplines = await upsertDisciplines(client);
      const peopleIds = await upsertPeople(client, scan.people, disciplines);
      return { disciplines, peopleIds };
    });

    async function writeVariants(storageKey: string, abs: string) {
      const processed = await processPhoto(await readFile(abs));
      for (const size of Object.keys(PHOTO_SIZES) as PhotoSize[]) {
        await storage.put(`${storageKey}/${size}.webp`, processed.variants[size].data, "image/webp");
      }
      return processed;
    }

    await mapLimit(groups, CONCURRENCY, async (group, index) => {
      const source = group.files.find((f) => !f.curated) ?? group.files[0];
      const discipline = disciplines.get(group.disciplineFolder)!;
      const personIds = group.people.map((p) => peopleIds.get(p.sourceFolder)!);
      const paths = group.files.map((f) => f.rel);
      try {
        const { rows } = await pool.query<{ id: string; storage_key: string }>(
          "SELECT id, storage_key FROM photos WHERE sha256 = $1",
          [group.sha256],
        );
        let photoId: string;
        if (rows[0]) {
          photoId = rows[0].id;
          const complete = await Promise.all(
            (Object.keys(PHOTO_SIZES) as PhotoSize[]).map((s) => storage.exists(`${rows[0].storage_key}/${s}.webp`)),
          );
          if (complete.every(Boolean)) unchanged++;
          else {
            await writeVariants(rows[0].storage_key, source.abs);
            regenerated++;
          }
          await pool.query(
            `UPDATE photos SET
               source_paths = ARRAY(SELECT DISTINCT unnest(source_paths || $2::text[]) ORDER BY 1),
               is_featured = is_featured OR $3
             WHERE id = $1`,
            [photoId, paths, group.featured],
          );
        } else {
          photoId = randomUUID();
          const storageKey = `photos/${photoId}`;
          const processed = await writeVariants(storageKey, source.abs);
          const names = group.people.map((p) => p.fullName).join(", ");
          const altSq = names ? `${names} – ${discipline.name_sq}, KS Tirana` : `${discipline.name_sq}, KS Tirana`;
          const altEn = names ? `${names} – ${discipline.name_en}, KS Tirana` : `${discipline.name_en}, KS Tirana`;
          try {
            await pool.query(
              `INSERT INTO photos (id, discipline_id, sha256, storage_key, width, height, blur_data_url,
                                   taken_at, alt_sq, alt_en, is_featured, is_published, sort_order, source_paths)
               VALUES ($1, $2, $3, $4, $5, $6, $7,
                       $8::timestamp AT TIME ZONE 'Europe/Tirane', $9, $10, $11, true, $12, $13)`,
              [photoId, discipline.id, group.sha256, storageKey, processed.width, processed.height,
               processed.blurDataUrl, processed.takenAtLocal, altSq, altEn, group.featured, index, paths],
            );
          } catch (error) {
            await storage.remove(`${storageKey}/`);
            throw error;
          }
          created++;
        }
        if (personIds.length) {
          await pool.query(
            "INSERT INTO photo_people (photo_id, person_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING",
            [photoId, personIds],
          );
        }
      } catch (error) {
        failed.push(`${source.rel}: ${error instanceof Error ? error.message : error}`);
      }
      const done = created + regenerated + unchanged + failed.length;
      if (done % 25 === 0 || done === groups.length) {
        process.stdout.write(`\r  photos ${done}/${groups.length}`);
      }
    });
    console.log();

    // Covers prefer curated landscape shots; portraits prefer solo, upright shots.
    await pool.query(`
      UPDATE disciplines d SET cover_photo_id = (
        SELECT p.id FROM photos p WHERE p.discipline_id = d.id
        ORDER BY p.is_featured DESC, (p.width >= p.height) DESC, p.sort_order LIMIT 1)
      WHERE d.cover_photo_id IS NULL`);
    await pool.query(`
      UPDATE people pe SET portrait_photo_id = (
        SELECT p.id FROM photo_people pp JOIN photos p ON p.id = pp.photo_id
        WHERE pp.person_id = pe.id
        ORDER BY (SELECT count(*) FROM photo_people x WHERE x.photo_id = p.id), (p.height > p.width) DESC, p.sort_order
        LIMIT 1)
      WHERE pe.portrait_photo_id IS NULL`);

    const [counts] = (await pool.query(`
      SELECT (SELECT count(*) FROM disciplines)::int AS disciplines,
             (SELECT count(*) FROM people)::int AS people,
             (SELECT count(*) FROM photos)::int AS photos,
             (SELECT count(*) FROM photos WHERE is_featured)::int AS featured,
             (SELECT count(*) FROM photo_people)::int AS tags,
             (SELECT count(*) FROM photos WHERE taken_at IS NOT NULL)::int AS dated`)).rows;
    report.push(
      "## Database",
      `- Disciplines: ${counts.disciplines}`,
      `- People: ${counts.people}`,
      `- Photos: ${counts.photos} (${counts.featured} featured, ${counts.dated} with date taken)`,
      `- Person tags: ${counts.tags}`,
      `- This run: ${created} new, ${regenerated} files regenerated, ${unchanged} unchanged, ${failed.length} failed`,
      "",
    );

    const noPhotos = (await pool.query<{ full_name: string; discipline: string }>(`
      SELECT pe.full_name, d.name_sq AS discipline FROM people pe JOIN disciplines d ON d.id = pe.discipline_id
      WHERE NOT EXISTS (SELECT 1 FROM photo_people pp WHERE pp.person_id = pe.id) ORDER BY 2, 1`)).rows;
    if (noPhotos.length) {
      report.push("## People with no usable photo", ...noPhotos.map((r) => `- ${r.full_name} (${r.discipline})`), "");
    }
    await pool.end();
  }

  // Findings that need the client — same in dry-run and real runs.
  const pngs = scan.files.filter((f) => /\.png$/i.test(f.rel)).map((f) => f.rel);
  const singleNames = scan.people.filter((p) => !p.fullName.includes(" "));
  const unknownTags = scan.people.filter((p) => p.unknownTags.length);
  const coaches = scan.people.filter((p) => p.role !== "athlete");
  const captains = scan.people.filter((p) => p.isCaptain);
  const mundje = Object.entries(CURATED_FOLDERS).find(([k]) => k === "Mundje");

  report.unshift(
    `# Photo import report — ${new Date().toISOString().slice(0, 16).replace("T", " ")}${dryRun ? " (dry run)" : ""}`,
    "",
    "## Archive",
    `- Image files: ${scan.files.length}, unique: ${groups.length} (${mergedCopies} duplicate copies merged)`,
    `- Person folders: ${scan.people.length} — ${coaches.length} coaches, ${captains.length} captains`,
    "",
  );
  const section = (title: string, lines: string[]) => lines.length && report.push(`## ${title}`, ...lines.map((l) => `- ${l}`), "");
  section("Failed", failed);
  section("Skipped RAW files (client to send JPG)", scan.rawSkipped);
  section("Instagram screenshots / PNGs (imported; originals wanted)", pngs);
  section("Single-name people (full name needed)", singleNames.map((p) => p.sourceFolder));
  section("Unrecognised role tags", unknownTags.map((p) => `${p.sourceFolder}: ${p.unknownTags.join(", ")}`));
  section("Unknown folders (not imported)", scan.unknownFolders);
  section("Other files ignored", scan.otherSkipped);
  if (mundje) section("Assumptions", [`Curated folder "Mundje" assigned to ${mundje[1]} — confirm with the client`]);
  report.push(`Finished in ${Math.round((Date.now() - started) / 1000)} s.`);

  const text = report.join("\n");
  console.log("\n" + text);
  if (!dryRun) {
    await mkdir(storageDir, { recursive: true });
    await writeFile(path.join(storageDir, "import-report.md"), text + "\n");
    console.log(`\nReport saved to ${path.join(storageDir, "import-report.md")}`);
  }
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
