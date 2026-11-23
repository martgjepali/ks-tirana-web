"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- closes the mobile menu on route change
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
  ];

  return (
    <header
      // Named so page transitions keep the header still while content moves.
      style={{ viewTransitionName: "site-header" }}
      className={`site-header sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-[var(--color-header)] shadow-[0_2px_24px_rgba(10,23,48,0.12)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-paper"
      }`}
    >
      <div className="hidden border-b border-line bg-navy-950 lg:block">
        <div className="wrap flex h-10 items-center justify-between text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/60">
          <span>Sport · Edukim · Komunitet · Tiranë</span>
          <div className="-mr-2 flex items-center gap-1">
            {(["instagram", "facebook", "youtube"] as const).map((s) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:scale-110 hover:bg-white/10 hover:text-white"
              >
                <Icon name={s} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap flex h-16 items-center justify-between lg:h-20">
        <Link href={`/${lang}`} className="flex items-center gap-2.5">
          <Image
            src="/images/Tirana_Club_Logo.svg.webp"
            alt="KF Tirana"
            width={36}
            height={57}
            priority
            className="h-9 w-auto"
          />
          <span className="font-display text-lg font-semibold tracking-wide text-strong">
            KS TIRANA
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline text-[0.9rem] font-medium text-strong/80 hover:text-strong"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle label={dict.common.theme} />
          <Link
            href={`/${otherLang}${rest}`}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold tracking-wide text-strong/70 transition hover:border-blue-500 hover:text-strong"
          >
            {lang === "sq" ? "EN" : "SQ"}
          </Link>
          <Link href={`/${lang}/dyqani`} className="btn btn-primary !py-2">
            <Icon name="shirt" className="h-4 w-4" />
            {dict.nav.shop}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle label={dict.common.theme} />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-strong"
          >
            <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav className="wrap flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-2.5 text-[0.95rem] font-medium text-strong hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-4">
              <Link
                href={`/${otherLang}${rest}`}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-strong/70"
              >
                {lang === "sq" ? "English" : "Shqip"}
              </Link>
              <Link
                href={`/${lang}/dyqani`}
                className="btn btn-primary flex-1 justify-center"
              >
                {dict.nav.shop}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
