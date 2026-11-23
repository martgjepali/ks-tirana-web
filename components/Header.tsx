"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
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
            src="/images/ks-tirana-crest.png"
            alt="KS Tirana"
            width={39}
            height={48}
            priority
            className="h-10 w-auto"
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
                  transform: open
                    ? i === 1
                      ? "scaleX(0)"
                      : `rotate(${i === 0 ? 45 : -45}deg)`
                    : `translateY(${y}px)`,
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
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
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-line bg-paper lg:hidden"
          >
            <motion.nav
              className="wrap flex flex-1 flex-col pt-6"
              variants={menuList}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <ul>
                {links.map((l, i) => {
                  const active = pathname.startsWith(l.href);
                  return (
                    <motion.li key={l.href} variants={menuItem} className="border-b border-line">
                      <Link
                        href={l.href}
                        className={`font-display flex items-baseline gap-4 py-4 text-3xl font-semibold uppercase tracking-tight ${
                          active ? "text-blue-500" : "text-strong"
                        }`}
                      >
                        <span className="text-xs font-semibold tracking-widest text-ink/40">0{i + 1}</span>
                        {l.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <motion.div variants={menuItem} className="mt-auto flex items-center gap-3 py-8">
                <Link
                  href={`/${otherLang}${rest}`}
                  className="rounded-md border border-line px-3 py-2.5 text-xs font-semibold text-strong/80"
                >
                  {lang === "sq" ? "English" : "Shqip"}
                </Link>
                <Link href={`/${lang}/dyqani`} className="btn btn-primary flex-1 justify-center">
                  <Icon name="shirt" className="h-4 w-4" />
                  {dict.nav.shop}
                </Link>
              </motion.div>
              <motion.div variants={menuItem} className="flex gap-2 pb-8">
                {(["instagram", "facebook", "youtube"] as const).map((social) => (
                  <a
                    key={social}
                    href="#"
                    aria-label={social}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-strong transition hover:border-blue-500 hover:text-blue-500"
                  >
                    <Icon name={social} className="h-5 w-5" />
                  </a>
                ))}
              </motion.div>
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
