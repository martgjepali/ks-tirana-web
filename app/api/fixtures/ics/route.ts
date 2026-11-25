import { getUpcomingForCalendar } from "@/lib/data/site";
import { buildIcs, icsResponse } from "@/lib/ics";
import { SPORT_GROUPS } from "@/lib/sport-groups";

/** "Shto të gjitha ndeshjet në kalendar": every upcoming match, optionally for one sport (?sport=basketboll). */
export async function GET(request: Request) {
  const sport = new URL(request.url).searchParams.get("sport");
  const group = SPORT_GROUPS.find((g) => g.key === sport) ?? null;
  const fixtures = await getUpcomingForCalendar(group?.slugs ?? null);
  const name = group ? `KS Tirana · ${group.name.sq}` : "KS Tirana";
  return icsResponse(buildIcs(fixtures, name), `ks-tirana${group ? `-${group.key}` : ""}.ics`);
}
