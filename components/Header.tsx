"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/app/[lang]/dictionaries";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const rest = pathname.replace(/^\/(sq|en)/, "") || "/";
  const otherLang: Locale = lang === "sq" ? "en" : "sq";

  const links = [
    { href: `/${lang}/sportet`, label: dict.nav.sports },
    { href: `/${lang}/akademia`, label: dict.nav.academy },
    { href: `/${lang}/kalendari`, label: dict.nav.calendar },
    { href: `/${lang}/lajme`, label: dict.nav.news },
    { href: `/${lang}/klubi`, label: dict.nav.club },
    { href: `/${lang}/dyqani`, label: dict.nav.shop },
    { href: `/${lang}/kontakt`, label: dict.nav.contact },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-navy-950/92 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-[0_8px_30px_rgba(2,6,16,0.45)]" : ""
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between lg:h-20">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 text-white"
        >
          <Image
            src="/images/Tirana_Club_Logo.svg.webp"
            alt="KF Tirana"
            width={36}
            height={57}
            priority
            className="h-9 w-auto"
          />
          <span className="font-display text-lg font-semibold tracking-wide">
            KS TIRANA
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline text-[0.9rem] font-medium text-white/85 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={`/${otherLang}${rest}`}
            className="rounded-md border border-white/25 px-2.5 py-1 text-xs font-semibold tracking-wide text-white/80 transition hover:border-white/50 hover:text-white"
          >
            {lang === "sq" ? "EN" : "SQ"}
          </Link>
          <Link href={`/${lang}/akademia`} className="btn btn-primary">
            {dict.nav.apply}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-950 lg:hidden">
          <nav className="wrap flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-2.5 text-[0.95rem] font-medium text-white/90 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <Link
                href={`/${otherLang}${rest}`}
                className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/80"
              >
                {lang === "sq" ? "English" : "Shqip"}
              </Link>
              <Link
                href={`/${lang}/akademia`}
                className="btn btn-primary flex-1 justify-center"
              >
                {dict.nav.apply}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
