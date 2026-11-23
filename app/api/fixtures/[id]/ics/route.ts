import { getFixtureForCalendar } from "@/lib/data/site";

/** "Add to calendar": a one-event .ics file that phones and Outlook/Google can import. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const f = await getFixtureForCalendar(id);
  if (!f) return new Response("Not found", { status: 404 });

  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  // RFC 5545 text escaping.
  const text = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const start = new Date(f.startsAt);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KS Tirana//Kalendari//SQ",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:fixture-${f.id}@kstirana`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(`${f.home} – ${f.away} (${f.discipline.name})`)}`,
    ...(f.venue ? [`LOCATION:${text(f.venue)}`] : []),
    ...(f.competition ? [`DESCRIPTION:${text(f.competition)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="ks-tirana-${f.id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
