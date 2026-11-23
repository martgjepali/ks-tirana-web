/**
 * DEVELOPMENT ONLY: wipes every table, then run `npm run db:migrate`.
 *
 *   npm run db:reset
 *
 * Refuses to run unless DATABASE_URL points at this machine, so it can never
 * touch a VPS or hosted database.
 */
import { getPool } from "../lib/db/pool";

try {
  process.loadEnvFile();
} catch {}

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    console.error(`Refusing to reset a non-local database (${url.hostname}).`);
    process.exit(1);
  }
  const pool = getPool();
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  console.log(`Wiped ${url.pathname.slice(1)} on ${url.hostname}:${url.port}.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
