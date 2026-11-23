import { query } from "@/lib/db/pool";

/** Liveness + database check. Used by the Docker healthcheck and uptime monitors. */
export async function GET() {
  try {
    const [row] = await query<{ migrations: number }>(
      "SELECT count(*)::int AS migrations FROM schema_migrations",
    );
    return Response.json({ ok: true, db: "up", migrations: row.migrations });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503 });
  }
}
