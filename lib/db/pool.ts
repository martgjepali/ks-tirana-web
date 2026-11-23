import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * One shared Postgres pool for the whole app (pages, server actions, auth)
 * and for the CLI scripts. Configured only through DATABASE_URL, so the same
 * code runs against local Docker, a VPS or a managed Postgres.
 *
 * Kept free of `server-only` so scripts run with tsx can import it; files in
 * lib/data/* add that guard.
 */

const globalForDb = globalThis as unknown as { __ksPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Not thrown: `next build` imports modules that create the pool without
    // ever querying. Any real query will fail with a connection error.
    console.warn("DATABASE_URL is not set. Copy .env.example to .env.");
  }
  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
  });
}

/** Created on first use; connections open only when a query runs. */
export function getPool(): Pool {
  if (!globalForDb.__ksPool) globalForDb.__ksPool = createPool();
  return globalForDb.__ksPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** Runs `fn` inside BEGIN/COMMIT, rolling back on any error. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
