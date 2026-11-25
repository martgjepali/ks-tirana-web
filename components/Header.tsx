"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Icon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { SOCIAL_LINKS } from "@/lib/club";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

/**
 * Site header from the client's design: navy top bar (tagline, direct links),
 * white bar with the wordmark, the five main sections, search, Shop and SQ | EN.
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
  const clubLinks = [
    { href: `/${lang}/klubi`, label: n.history },
    { href: `/${lang}/klubi/drejtimi`, label: n.management },
    { href: `/${lang}/partneritet`, label: n.partner },
    { href: `/${lang}/kontakt`, label: n.contact },
  ];
  const links = [
    { href: `/${lang}/sportet`, label: n.sports },
    { href: `/${lang}/akademia`, label: n.academy },
    { href: `/${lang}/kalendari`, label: n.calendar },
    { href: `/${lang}/lajme`, label: n.media },
    { href: `/${lang}/klubi`, label: n.club, children: clubLinks },
  ];
  const isActive = (l: (typeof links)[number]) =>
    pathname.startsWith(l.href) || (l.children?.some((c) => pathname.startsWith(c.href)) ?? false);

  const langSwitch = (
    <span className="flex items-center gap-2 text-sm font-semibold">
      {(["sq", "en"] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-2">
          {i > 0 && <span className="text-line" aria-hidden>|</span>}
          {code === lang ? (
            <span className="text-strong" aria-current="true">{code.toUpperCase()}</span>
          ) : (
            <Link href={`/${code}${rest}`} hrefLang={code} className="text-ink/45 transition hover:text-blue-500">
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
      {/* Top bar */}
      <div className="hidden bg-navy-900 text-white md:block">
        <div className="wrap flex h-9 items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.18em]">
          <p className="text-white/80">{dict.header.tagline.join(" • ")}</p>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/partneritet`} className="text-white/80 transition hover:text-white">
              {n.partner}
            </Link>
            <Link href={`/${lang}/kontakt`} className="text-white/80 transition hover:text-white">
              {n.contact}
            </Link>
            {SOCIAL_LINKS.length > 0 && (
              <span className="flex items-center gap-1 border-l border-white/20 pl-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon name={s.name} className="h-4 w-4" />
                  </a>
                ))}
              </span>
            )}
            <span className="border-l border-white/20 pl-4 text-white/60">{dict.header.motto}</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-line bg-[var(--color-header)]">
        <div className="wrap flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2.5" aria-label="KS Tirana">
            <Image src="/images/ks-tirana-crest.png" alt="" width={39} height={48} priority className="h-10 w-auto" />
            <span className="font-display text-[1.65rem] font-black leading-none tracking-tight text-strong lg:text-[1.85rem]">
              KS TIRANA
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label={n.home}>
            {links.map((l) => {
              const active = isActive(l);
              return (
                <div key={l.href} className="group relative">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-[72px] items-center gap-1 text-[0.95rem] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-4 after:h-[2px] after:origin-left after:bg-blue-500 after:transition-transform ${
                      active ? "text-blue-500 after:scale-x-100" : "text-strong after:scale-x-0 hover:text-blue-500 hover:after:scale-x-100"
                    }`}
                  >
                    {l.label}
                    {l.children && <Icon name="chevronDown" className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                  {l.children && (
                    <div className="invisible absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 translate-y-1 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="mt-px overflow-hidden rounded-b border border-t-0 border-line bg-card py-2 shadow-[var(--shadow-card)]">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={`block px-5 py-2.5 text-sm font-medium transition hover:bg-surface hover:text-blue-500 ${
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
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href={`/${lang}/kerkim`}
              aria-label={dict.header.search}
              title={dict.header.search}
              className="text-strong transition hover:text-blue-500"
            >
              <Icon name="search" className="h-5 w-5" />
            </Link>
            <Link href={`/${lang}/dyqani`} className="btn btn-primary !px-5 !py-2.5">
              <Icon name="bag" className="h-4 w-4" />
              {n.shop}
            </Link>
            {langSwitch}
            <ThemeToggle label={dict.header.theme} />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link href={`/${lang}/kerkim`} aria-label={dict.header.search} className="flex h-10 w-10 items-center justify-center text-strong">
              <Icon name="search" className="h-5 w-5" />
            </Link>
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
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-paper md:top-[100px] lg:hidden"
          >
            <motion.nav className="wrap flex flex-1 flex-col pt-4" variants={menuList} initial="closed" animate="open" exit="closed">
              <ul>
                {links.map((l, i) => (
                  <motion.li key={l.href} variants={menuItem} className="border-b border-line">
                    <Link
                      href={l.href}
                      className={`font-display flex items-baseline gap-4 py-4 text-3xl font-extrabold uppercase tracking-tight ${
                        isActive(l) ? "text-blue-500" : "text-strong"
                      }`}
                    >
                      <span className="text-xs font-semibold tracking-widest text-ink/40">0{i + 1}</span>
                      {l.label}
                    </Link>
                    {l.children && (
                      <ul className="-mt-1 grid grid-cols-2 gap-x-4 gap-y-2 pb-4 pl-9">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="text-sm font-medium text-ink/70 hover:text-blue-500">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={menuItem} className="mt-auto flex items-center gap-4 py-8">
                {langSwitch}
                <Link href={`/${lang}/dyqani`} className="btn btn-primary flex-1">
                  <Icon name="bag" className="h-4 w-4" />
                  {n.shop}
                </Link>
              </motion.div>
              {SOCIAL_LINKS.length > 0 && (
                <motion.div variants={menuItem} className="flex gap-2 pb-8">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-strong transition hover:border-blue-500 hover:text-blue-500"
                    >
                      <Icon name={s.name} className="h-5 w-5" />
                    </a>
                  ))}
                </motion.div>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const menuList: Variants = {
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const menuItem: Variants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  closed: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};
