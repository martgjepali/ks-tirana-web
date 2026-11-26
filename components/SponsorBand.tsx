import Image from "next/image";
import { MAIN_SUPPORTER, PARTNERS } from "@/lib/club";

/**
 * Sponsor band from the client's final design (home and Partnerët): the main
 * supporter (Bashkia Tiranë) on the left, the sponsors' logos sliding inside a
 * navy frame on the right ("LOGOT E SPONSOREVE TE JENE ME ANIMATION, SLIDE").
 *
 * The logo list is rendered twice and the track moves by half its width, so the
 * loop is seamless. It pauses on hover; with reduced motion it stands still and
 * can be scrolled sideways instead.
 */
export function SponsorBand({
  eyebrow,
  body,
  label,
}: {
  /** Small blue line above the supporter's name (Partnerët page). */
  eyebrow?: string;
  /** Line under the supporter's name (home page). */
  body?: string;
  /** Accessible name of the logo list. */
  label: string;
}) {
  const logos = (copy: number) =>
    PARTNERS.map((p) => {
      const logo = (
        <Image src={p.logo} alt={copy === 0 ? p.name : ""} width={180} height={72} className="max-h-14 w-auto max-w-[150px] object-contain" />
      );
      return (
        <li key={`${copy}-${p.name}`} className="flex h-[4.75rem] w-48 shrink-0 items-center justify-center bg-white px-5" aria-hidden={copy > 0}>
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer" tabIndex={copy > 0 ? -1 : undefined} title={p.name}>
              {logo}
            </a>
          ) : (
            logo
          )}
        </li>
      );
    });

  return (
    <section className="bg-[#eef3fa] [:root[data-theme=dark]_&]:bg-surface">
      <div className="wrap py-4">
        <div className="grid grid-cols-1 items-center gap-5 border-l-4 border-blue-500 bg-[#eef3fa] py-3 pl-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8 [:root[data-theme=dark]_&]:bg-surface">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-[11.5rem] shrink-0 items-center justify-center bg-white px-4">
              <Image src={MAIN_SUPPORTER.logo} alt={MAIN_SUPPORTER.name} width={200} height={112} className="h-auto max-h-20 w-full object-contain" />
            </div>
            <div>
              {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-blue-500">{eyebrow}</p>}
              <p className="text-2xl font-extrabold text-strong">{MAIN_SUPPORTER.name}</p>
              {body && <p className="mt-1 text-sm text-ink/70">{body}</p>}
            </div>
          </div>

          {PARTNERS.length > 0 && (
            <div className="bg-navy-900 p-2.5">
              <div
                className="marquee overflow-x-auto bg-white [scrollbar-width:none] motion-safe:overflow-hidden"
                style={{ "--marquee-duration": `${PARTNERS.length * 4.5}s` } as React.CSSProperties}
              >
                <ul className="marquee-track flex w-max" aria-label={label}>
                  {logos(0)}
                  {logos(1)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
