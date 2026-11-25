import type { Fixture } from "@/lib/data/site";

/** RFC 5545 calendar file that phones, Outlook and Google Calendar can import. */
export function buildIcs(fixtures: Fixture[], calendarName: string) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const text = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const now = stamp(new Date());
  const events = fixtures.flatMap((f) => {
    const start = new Date(f.startsAt);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:fixture-${f.id}@kstirana`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${text(`${f.home} – ${f.away} (${f.discipline.name})`)}`,
      ...(f.venue ? [`LOCATION:${text(f.venue)}`] : []),
      ...(f.competition ? [`DESCRIPTION:${text(f.competition)}`] : []),
      "END:VEVENT",
    ];
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KS Tirana//Kalendari//SQ",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${text(calendarName)}`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function icsResponse(body: string, filename: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
