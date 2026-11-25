import { getFixtureForCalendar } from "@/lib/data/site";
import { buildIcs, icsResponse } from "@/lib/ics";

/** "Shto në kalendar": a one-event .ics file. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const f = await getFixtureForCalendar(id);
  if (!f) return new Response("Not found", { status: 404 });
  return icsResponse(buildIcs([f], "KS Tirana"), `ks-tirana-${f.id}.ics`);
}
