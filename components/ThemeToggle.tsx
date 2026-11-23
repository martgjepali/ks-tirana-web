"use client";

import { useLayoutEffect } from "react";
import { Icon } from "./Icons";
import { THEME_KEY } from "@/lib/theme";

/** Same rule as THEME_SCRIPT in lib/theme.ts. */
function readTheme(): "light" | "dark" {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Light/dark switch. The icon is chosen by CSS from <html data-theme>, so the
 * server and client render the same markup (no hydration mismatch). The new
 * theme spreads as a circle from the button where View Transitions exist.
 */
export function ThemeToggle({ label }: { label: string }) {
  // React's dev-mode remount resets <html> attributes; re-apply (no-op in production).
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", readTheme());
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      apply();
      return;
    }

    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    root.classList.add("theme-switching");
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-strong transition hover:border-blue-500 hover:text-blue-500"
    >
      <Icon name="moon" className="theme-icon theme-icon-moon absolute h-[18px] w-[18px]" />
      <Icon name="sun" className="theme-icon theme-icon-sun absolute h-[18px] w-[18px]" />
    </button>
  );
}
