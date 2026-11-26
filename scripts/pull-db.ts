/**
 * DEVELOPMENT ONLY: replaces the local Docker database with a copy of another
 * database (normally the deployed Neon one), so the site can be worked on with
 * real content without touching production.
 *
 *   npm run db:pull
 *
 * Needs SOURCE_DATABASE_URL in .env and the local database running (npm run db:up).
 * The source is only ever read (pg_dump). The dump runs inside the Postgres
 * container, so nothing needs to be installed on this machine besides Docker.
 *
 * Personal data is not copied: academy applications, contact messages, the form
 * log and login sessions/passwords arrive as empty tables. Create a local staff
 * login with `npm run admin:create`.
 */
import { spawnSync } from "node:child_process";

try {
  process.loadEnvFile();
} catch {}

const COMPOSE = ["compose", "-f", "docker-compose.dev.yml"];
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1"];

/** Tables whose rows stay behind: children's data, messages, credentials. */
const SKIP_DATA = [
  "academy_applications",
  "contact_messages",
  "form_submissions_log",
  "account",
  "session",
  "verification",
];

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function main() {
  const raw = process.env.SOURCE_DATABASE_URL;
  if (!raw) fail("Set SOURCE_DATABASE_URL in .env (the Vercel/Neon database to copy from).");

  let source: URL;
  try {
    source = new URL(raw);
  } catch {
    fail("SOURCE_DATABASE_URL is not a valid postgres:// URL.");
  }
  if (LOCAL_HOSTS.includes(source.hostname)) fail("SOURCE_DATABASE_URL points at this machine; nothing to copy.");

  // pg_dump needs a direct connection; Neon's pooled host ("-pooler") can break it.
  if (source.hostname.includes("-pooler.")) {
    source.hostname = source.hostname.replace("-pooler.", ".");
    console.log("Using Neon's direct (unpooled) host for the dump.");
  }

  const target = new URL(process.env.DATABASE_URL ?? "postgres://localhost");
  if (!LOCAL_HOSTS.includes(target.hostname)) {
    console.warn(`Note: DATABASE_URL points at ${target.hostname}, so the app will not read the copy made here.`);
  }

  const running = spawnSync("docker", [...COMPOSE, "ps", "--status", "running", "-q", "db"], { encoding: "utf8" });
  if (running.error) fail("Docker was not found. Install Docker Desktop and start it.");
  if (!running.stdout.trim()) fail("The local database is not running. Start it with: npm run db:up");

  // Dump to a file first, so a failed dump (network, version) leaves the local database untouched.
  const psql = `psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"`;
  const script = [
    "set -e",
    `pg_dump --no-owner --no-privileges --schema=public ${SKIP_DATA.map((t) => `--exclude-table-data=public.${t}`).join(" ")} -f /tmp/pull.sql "$SRC"`,
    `${psql} -c 'DROP SCHEMA IF EXISTS public CASCADE;'`,
    `${psql} -f /tmp/pull.sql`,
    "rm -f /tmp/pull.sql",
  ].join("\n");

  console.log(`Copying ${source.pathname.slice(1)} from ${source.hostname} into the local database…`);
  const result = spawnSync("docker", [...COMPOSE, "exec", "-T", "-e", "SRC", "db", "sh", "-c", script], {
    stdio: ["ignore", "inherit", "inherit"],
    env: { ...process.env, SRC: source.toString() },
  });
  if (result.status !== 0) fail("Copy failed (see the message above). If the dump itself failed the local database is unchanged; if the restore failed, run npm run db:pull again.");

  const counts = spawnSync(
    "docker",
    [
      ...COMPOSE,
      "exec",
      "-T",
      "db",
      "sh",
      "-c",
      `${psql} -At -c "SELECT (SELECT count(*) FROM disciplines) || ' disciplines, ' || (SELECT count(*) FROM people) || ' people, ' || (SELECT count(*) FROM photos) || ' photos, ' || (SELECT count(*) FROM news) || ' news, ' || (SELECT count(*) FROM fixtures) || ' fixtures'"`,
    ],
    { encoding: "utf8" },
  );
  console.log(`Done: ${counts.stdout.trim() || "copied"}.`);
}

main();
