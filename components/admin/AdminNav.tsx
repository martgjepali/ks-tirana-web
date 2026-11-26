"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/Icons";

/** Sections of the staff panel, grouped like the public site. */
const GROUPS: { title: string; items: { href: string; label: string; icon: IconName; short?: string }[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Paneli", icon: "home" }] },
  {
    title: "Përmbajtja",
    items: [
      { href: "/admin/lajme", label: "Lajmet", icon: "news" },
      { href: "/admin/ndeshjet", label: "Ndeshjet & kalendari", short: "Ndeshjet", icon: "calendar" },
      { href: "/admin/disiplinat", label: "Disiplinat", icon: "trophy" },
      { href: "/admin/personat", label: "Sportistët & stafi", short: "Sportistët", icon: "users" },
      { href: "/admin/fotot", label: "Fotot", icon: "camera" },
      { href: "/admin/akademia", label: "Programet e Akademisë", short: "Akademia", icon: "run" },
      { href: "/admin/produktet", label: "Produktet (Shop)", short: "Produktet", icon: "shirt" },
      { href: "/admin/revista", label: "Revista", icon: "book" },
      { href: "/admin/partneret", label: "Partnerët & sponsorët", short: "Partnerët", icon: "handshake" },
    ],
  },
  {
    title: "Kërkesat",
    items: [
      { href: "/admin/aplikimet", label: "Aplikimet në Akademi", short: "Aplikimet", icon: "check" },
      { href: "/admin/mesazhet", label: "Mesazhet", icon: "mail" },
    ],
  },
  {
    title: "Faqja",
    items: [
      { href: "/admin/tekstet", label: "Tekstet e faqeve", short: "Tekstet", icon: "book" },
      { href: "/admin/cilesimet", label: "Kontakt, rrjete, bileta", short: "Cilësimet", icon: "pin" },
      { href: "/admin/perdoruesit", label: "Përdoruesit", icon: "shield" },
    ],
  },
];

const TABS = [
  { href: "/admin", label: "Paneli", icon: "home" },
  { href: "/admin/lajme", label: "Lajme", icon: "news" },
  { href: "/admin/fotot", label: "Fotot", icon: "camera" },
  { href: "/admin/mesazhet", label: "Mesazhe", icon: "mail" },
] as const;

type Staff = { name: string; email: string };
type SignOut = () => Promise<void>;

function Count({ count }: { count: number }) {
  return (
    <span className="inline-block min-w-5 rounded-full bg-gold-400 px-1 text-center text-[0.625rem] leading-4 font-bold tabular-nums text-navy-900">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> të reja</span>
    </span>
  );
}

function Account({ staff, signOut, onNavigate }: { staff: Staff; signOut: SignOut; onNavigate?: () => void }) {
  return (
    <div className="border-t border-current/10 py-4 text-sm">
      <p className="font-semibold [overflow-wrap:anywhere]">{staff.name}</p>
      <p className="mt-0.5 text-xs opacity-75 [overflow-wrap:anywhere]">{staff.email}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/admin/perdoruesit/une" onClick={onNavigate} className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-current/20 px-3 text-xs font-semibold hover:underline active:bg-blue-500/10">
          <Icon name="key" className="h-4 w-4" /> Fjalëkalimi
        </Link>
        <form action={signOut}>
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-current/20 px-3 text-xs font-semibold hover:underline active:bg-blue-500/10">
            <Icon name="logout" className="h-4 w-4" /> Dil
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminNav({ badges, staff, signOut }: { badges: Record<string, number>; staff: Staff; signOut: SignOut }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuId = useId();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const moreActive = !TABS.some(({ href }) => active(href));
  const closeMenu = () => dialog.current?.close();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnResize = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnResize);
    return () => desktop.removeEventListener("change", closeOnResize);
  }, []);

  return (
    <>
      <nav aria-label="Seksionet e panelit" className="hidden pb-4 lg:block">
        {GROUPS.map((g) => (
          <div key={g.title || "main"} className="mt-2">
            {g.title && <p className="px-5 pb-1 pt-3 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-white/45">{g.title}</p>}
            <ul>
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active(item.href) ? "page" : undefined}
                    className={`flex items-center gap-3 px-5 py-2 text-sm font-semibold transition ${
                      active(item.href) ? "bg-blue-500 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badges[item.href] > 0 && (
                      <Count count={badges[item.href]} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="hidden px-5 lg:block"><Account staff={staff} signOut={signOut} /></div>
      <nav aria-label="Navigimi i panelit" className="admin-tabs fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-line bg-white text-ink lg:hidden">
        {TABS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`admin-tab relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 py-1 text-[0.6875rem] font-semibold active:bg-surface-2 ${active(href) ? "bg-blue-500/8 text-blue-600" : "text-ink/75"}`}
          >
            <span className="relative">
              <Icon name={icon} className="h-5 w-5" />
              {badges[href] > 0 && <span className="absolute -top-1 left-full -ml-1"><Count count={badges[href]} /></span>}
            </span>
            {label}
          </Link>
        ))}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="dialog"
          onClick={() => {
            dialog.current?.showModal();
            setOpen(true);
          }}
          className={`admin-tab flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 py-1 text-[0.6875rem] font-semibold active:bg-surface-2 ${moreActive ? "bg-blue-500/8 text-blue-600" : "text-ink/75"}`}
        >
          <span className="relative">
            <Icon name="menu" className="h-5 w-5" />
            {badges["/admin/aplikimet"] > 0 && <span className="absolute -top-1 left-full -ml-1"><Count count={badges["/admin/aplikimet"]} /></span>}
          </span>
          Menuja
        </button>
      </nav>
      <dialog
        id={menuId}
        ref={dialog}
        aria-labelledby={`${menuId}-title`}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}
        className="admin-menu fixed inset-x-0 inset-y-auto bottom-0 mx-auto w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-2xl bg-white pt-2 text-ink backdrop:bg-navy-950/55"
      >
        <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between bg-white px-1">
          <h2 id={`${menuId}-title`} className="text-lg font-extrabold text-strong">Menuja</h2>
          <button type="button" aria-label="Mbyll menunë" onClick={closeMenu} className="grid h-11 w-11 place-items-center rounded-sm hover:bg-surface active:bg-surface-2">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Të gjitha seksionet" className="my-2 space-y-3">
          {GROUPS.filter((group) => group.title).map(({ title, items }) => (
            <div key={title}>
              <h3 className="mb-1 text-xs font-bold text-ink/70">{title}</h3>
              <ul className={`grid grid-cols-2 gap-1 ${items.length > 3 ? "min-[360px]:grid-cols-3" : ""}`}>
                {items.map(({ href, label, icon, short }) => (
                  <li key={href} className="min-w-0">
                    <Link href={href} prefetch={false} onClick={closeMenu} aria-current={active(href) ? "page" : undefined} title={short ? label : undefined}
                      className={`admin-menu-link flex h-full min-h-11 items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold active:bg-blue-500/15 ${active(href) ? "bg-blue-500/10 text-blue-600" : "bg-surface text-strong hover:bg-surface-2"}`}>
                      <Icon name={icon} className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{short ?? label}</span>
                      {badges[href] > 0 && <Count count={badges[href]} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <Account staff={staff} signOut={signOut} onNavigate={closeMenu} />
      </dialog>
    </>
  );
}
