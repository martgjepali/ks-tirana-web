import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icons";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: `/${lang}/sportet`, label: dict.nav.sports },
    { href: `/${lang}/akademia`, label: dict.nav.academy },
    { href: `/${lang}/kalendari`, label: dict.nav.calendar },
    { href: `/${lang}/lajme`, label: dict.nav.news },
  ];
  const club = [
    { href: `/${lang}/klubi`, label: dict.nav.club },
    { href: `/${lang}/dyqani`, label: dict.nav.shop },
    { href: `/${lang}/kontakt`, label: dict.nav.contact },
  ];

  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="wrap grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <Image
              src="/images/Tirana_Club_Logo.svg.webp"
              alt="KF Tirana"
              width={32}
              height={51}
              className="h-8 w-auto"
            />
            <span className="font-display text-lg font-semibold tracking-wide">
              KS TIRANA
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {dict.footer.tagline}
          </p>
          <div className="mt-6 flex gap-3">
            {(["instagram", "facebook", "youtube"] as const).map((s) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <Icon name={s} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {dict.footer.nav}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {dict.footer.club}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {club.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {dict.footer.contactTitle}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" />
              {dict.footer.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="mail" className="h-4 w-4 shrink-0" />
              info@kstirana.example
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Klubi Sportiv Tirana. {dict.footer.rights}</p>
          <p className="font-display tracking-wide">BARDHE E BLU</p>
        </div>
      </div>
    </footer>
  );
}
