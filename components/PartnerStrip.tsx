import Image from "next/image";
import { PARTNERS } from "@/lib/club";

/**
 * Sponsor / partner logos (lib/club.ts → PARTNERS). Renders nothing until the
 * club provides logos, so no empty band appears on the site.
 */
export function PartnerStrip({ title, tone = "light" }: { title: string; tone?: "light" | "plain" }) {
  if (PARTNERS.length === 0) return null;
  return (
    <section className={tone === "light" ? "border-t border-line bg-surface py-10" : "py-10"} aria-label={title}>
      <div className="wrap">
        <p className="section-label text-center">{title}</p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {PARTNERS.map((p) => {
            const logo = (
              <Image
                src={p.logo}
                alt={p.name}
                width={160}
                height={64}
                className="h-12 w-auto max-w-[160px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0 [:root[data-theme=dark]_&]:invert"
              />
            );
            return (
              <li key={p.name}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer" title={p.name}>
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
