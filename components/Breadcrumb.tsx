import Link from "next/link";
import { Icon } from "./Icons";

/** "‹ Kryefaqja  >  Sportet  >  Atletikë  >  Profili i sportistit" */
export function Breadcrumb({ items, tone = "dark" }: { items: { label: string; href?: string }[]; tone?: "dark" | "light" }) {
  const base = tone === "light" ? "text-white/70" : "text-ink/55";
  const hover = tone === "light" ? "hover:text-white" : "hover:text-blue-500";
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] ${base}`}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3">
            {i === 0 && <Icon name="chevronRight" className="h-3.5 w-3.5 rotate-180" />}
            {i > 0 && <Icon name="chevronRight" className="h-3 w-3 opacity-70" />}
            {item.href ? (
              <Link href={item.href} className={`transition ${hover}`}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
