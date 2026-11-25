import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icons";
import { PartnerStrip } from "./PartnerStrip";
import { SOCIAL_LINKS } from "@/lib/club";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

/** Slim footer from the client's design: wordmark, main sections, social icons. */
export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const n = dict.nav;
  const nav = [
    { href: `/${lang}/sportet`, label: n.sports },
    { href: `/${lang}/akademia`, label: n.academy },
    { href: `/${lang}/kalendari`, label: n.calendar },
    { href: `/${lang}/lajme`, label: n.media },
    { href: `/${lang}/klubi`, label: n.club },
  ];
  const direct = [
    { href: `/${lang}/dyqani`, label: n.shop },
    { href: `/${lang}/partneritet`, label: n.partner },
    { href: `/${lang}/kontakt`, label: n.contact },
  ];

  return (
    <footer>
      <PartnerStrip title={dict.footer.partners} />
      <div className="bg-navy-900 text-white">
        <div className="wrap flex flex-col items-center gap-6 py-7 lg:flex-row lg:justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-2.5">
            <Image src="/images/ks-tirana-crest.png" alt="" width={26} height={32} className="h-8 w-auto" />
            <span className="font-display text-xl font-black tracking-tight">KS TIRANA</span>
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-white/80">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name={s.name} className="h-[18px] w-[18px]" />
              </a>
            ))}
            {SOCIAL_LINKS.length === 0 && (
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                {dict.footer.tagline.join(" • ")}
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="wrap flex flex-col items-center justify-between gap-3 py-4 text-xs text-white/50 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Klubi Sportiv Tirana. {dict.footer.rights}
            </p>
            <ul className="flex gap-6">
              {direct.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
