"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Icon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { CLUB_INFO } from "@/lib/club";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

/**
 * Header from the client's final design: thin navy bar ("KLUBI SPORTIV TIRANA" /
 * "THEMELUAR 15 GUSHT 1920"), then crest + KS TIRANA and the menu
 * Disiplinat · Akademia · Kalendari · Lajme · Revista · Klubi · Partnerët · Kontakt · SQ / EN · Shop.
 */
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

  // While the mobile menu is open: lock page scroll, close on Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rest = pathname.replace(/^\/(sq|en)/, "") || "";
  const n = dict.nav;
  const links: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
    { href: `/${lang}/sportet`, label: n.sports },
    { href: `/${lang}/akademia`, label: n.academy },
    { href: `/${lang}/kalendari`, label: n.calendar },
    { href: `/${lang}/lajme`, label: n.media },
    { href: `/${lang}/revista`, label: n.magazine },
    {
      href: `/${lang}/klubi`,
      label: n.club,
      children: [
        { href: `/${lang}/klubi`, label: n.history },
        { href: `/${lang}/klubi/drejtimi`, label: n.management },
      ],
    },
    { href: `/${lang}/partneret`, label: n.partners },
    { href: `/${lang}/kontakt`, label: n.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const langSwitch = (
    <span className="flex items-center gap-1.5 text-[0.95rem] font-bold text-strong">
      {(["sq", "en"] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {code === lang ? (
            <span aria-current="true">{code.toUpperCase()}</span>
          ) : (
            <Link href={`/${code}${rest}`} hrefLang={code} className="text-ink/50 transition hover:text-blue-500">
              {code.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );

  return (
    <header
      // Named so page transitions keep the header still while content moves.
      style={{ viewTransitionName: "site-header" }}
      className={`site-header sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_24px_rgba(2,31,72,0.12)]" : ""}`}
    >
      <div className="bg-navy-900 text-white">
        <div className="wrap flex h-7 items-center justify-between text-[0.6875rem] font-bold uppercase tracking-wide">
          <p>{dict.header.club}</p>
          <p className="hidden sm:block">{CLUB_INFO.founded[lang]}</p>
        </div>
      </div>

      <div className="border-b border-line bg-[var(--color-header)]">
        <div className="wrap flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Link href={`/${lang}`} className="flex shrink-0 items-center gap-3" aria-label="KS Tirana">
            <Image src="/images/ks-tirana-crest.png" alt="" width={39} height={48} priority className="h-11 w-auto" />
            <span className="font-display text-[1.6rem] font-extrabold leading-none tracking-tight text-strong lg:text-[1.85rem]">
              KS TIRANA
            </span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8" aria-label={n.home}>
            {links.map((l) => {
              const active = isActive(l.href) || (l.children?.some((c) => isActive(c.href)) ?? false);
              return (
                <div key={l.href} className="group relative">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-[72px] items-center gap-1 text-[0.95rem] font-bold transition-colors ${
                      active ? "text-blue-500" : "text-strong hover:text-blue-500"
                    }`}
                  >
                    {l.label}
                    {l.children && <Icon name="chevronDown" className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                  {l.children && (
                    <div className="invisible absolute left-1/2 top-full z-10 w-60 -translate-x-1/2 translate-y-1 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="mt-px border border-t-0 border-line bg-card py-2 shadow-[var(--shadow-card)]">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={`block px-5 py-2.5 text-sm font-semibold transition hover:bg-surface hover:text-blue-500 ${
                                pathname === c.href ? "text-blue-500" : "text-strong"
                              }`}
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
            {langSwitch}
            <Link
              href={`/${lang}/dyqani`}
              aria-current={isActive(`/${lang}/dyqani`) ? "page" : undefined}
              className={`text-[0.95rem] font-bold transition-colors ${isActive(`/${lang}/dyqani`) ? "text-blue-500" : "text-strong hover:text-blue-500"}`}
            >
              {n.shop}
            </Link>
            <ThemeToggle label={dict.header.theme} />
          </nav>

          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle label={dict.header.theme} />
            <button
              type="button"
              aria-label={dict.header.menu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-strong"
            >
              {/* Three bars that fold into an X. */}
              {[-7, 0, 7].map((y, i) => (
                <span
                  key={y}
                  className="absolute h-[2px] w-6 rounded-full bg-current transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{
                    transform: open ? (i === 1 ? "scaleX(0)" : `rotate(${i === 0 ? 45 : -45}deg)`) : `translateY(${y}px)`,
                    opacity: open && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1], delay: 0.1 } }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-x-0 bottom-0 top-[92px] z-40 flex flex-col overflow-y-auto bg-paper lg:top-[100px] xl:hidden"
          >
            <motion.nav className="wrap flex flex-1 flex-col pt-2" variants={menuList} initial="closed" animate="open" exit="closed">
              <ul>
                {[...links, { href: `/${lang}/dyqani`, label: n.shop }].map((l) => (
                  <motion.li key={l.href + l.label} variants={menuItem} className="border-b border-line">
                    <Link
                      href={l.href}
                      className={`font-display flex py-3.5 text-2xl font-extrabold ${isActive(l.href) ? "text-blue-500" : "text-strong"}`}
                    >
                      {l.label}
                    </Link>
                    {"children" in l && l.children && (
                      <ul className="-mt-1 flex gap-5 pb-3.5">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="text-sm font-semibold text-ink/70 hover:text-blue-500">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={menuItem} className="mt-auto py-8">
                {langSwitch}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const menuList: Variants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.18 } },
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const menuItem: Variants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  closed: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};
