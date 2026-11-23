/**
 * Applies db/migrations/*.sql in filename order and records each one in
 * schema_migrations. Safe to run any number of times.
 *
 *   npm run db:migrate            apply pending migrations
 *   npm run db:migrate -- status  list applied / pending without changing anything
 *
 * Each file runs in its own transaction. A checksum is stored so an edit to an
 * already-applied migration is reported instead of silently ignored — add a
 * new migration file instead of editing an old one.
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getPool } from "../lib/db/pool";

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on variables already in the environment (CI, Docker).
}

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");
const LOCK_ID = 7_202_019_20; // arbitrary constant: one migrator at a time

async function main() {
  const statusOnly = process.argv.includes("status");
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name        text PRIMARY KEY,
        checksum    text NOT NULL,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )`);
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
    const applied = new Map(
      (await client.query<{ name: string; checksum: string }>("SELECT name, checksum FROM schema_migrations"))
        .rows.map((r) => [r.name, r.checksum]),
    );

    let ran = 0;
    for (const file of files) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      // Line endings ignored: a Windows (CRLF) and a Linux (LF) checkout must match.
      const checksum = createHash("sha256").update(sql.replace(/\r\n/g, "\n")).digest("hex");
      const previous = applied.get(file);

      if (previous) {
        if (previous !== checksum) {
          console.warn(`! ${file} changed after it was applied. Add a new migration instead.`);
        } else if (statusOnly) {
          console.log(`  applied  ${file}`);
        }
        continue;
      }

      if (statusOnly) {
        console.log(`  pending  ${file}`);
        continue;
      }

      process.stdout.write(`→ ${file} … `);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [file, checksum]);
        await client.query("COMMIT");
        console.log("ok");
        ran++;
      } catch (error) {
        await client.query("ROLLBACK");
        console.log("FAILED");
        throw error;
      }
    }

    for (const name of applied.keys()) {
      if (!files.includes(name)) console.warn(`! ${name} is recorded as applied but the file is missing.`);
    }
    if (!statusOnly) console.log(ran ? `Applied ${ran} migration(s).` : "Database is up to date.");
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
