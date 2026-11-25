"use client";

import { useState } from "react";
import { Icon } from "./Icons";

/** "FILLET · NGRITJA · SFIDAT · SUKSESET · BREZAT · SOT" with arrows; the chosen period's text shows below. */
export function HistoryTimeline({
  items,
  labels,
}: {
  items: { label: string; body: string }[];
  labels: { prev: string; next: string };
}) {
  const [index, setIndex] = useState(0);
  const go = (i: number) => setIndex((i + items.length) % items.length);

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={labels.prev}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/80 text-white transition hover:bg-white hover:text-navy-900"
        >
          <Icon name="arrowLeft" className="h-5 w-5" />
        </button>
        <ol className="relative flex flex-1 justify-between">
          <span className="absolute inset-x-0 top-[9px] h-px bg-white/40" aria-hidden />
          {items.map((item, i) => (
            <li key={item.label} className="relative flex flex-1 flex-col items-center">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "step" : undefined}
                className="group flex flex-col items-center gap-3"
              >
                <span
                  className={`relative z-10 block h-5 w-5 rounded-full border-2 transition ${
                    i === index ? "scale-110 border-blue-400 bg-blue-400" : "border-white bg-navy-950 group-hover:bg-white/30"
                  }`}
                />
                <span className={`hidden text-[0.6875rem] font-bold uppercase tracking-wider sm:block lg:text-sm ${i === index ? "text-white" : "text-white/75"}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={labels.next}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/80 text-white transition hover:bg-white hover:text-navy-900"
        >
          <Icon name="arrowRight" className="h-5 w-5" />
        </button>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-white/85 lg:text-base" aria-live="polite">
        <strong className="mr-2 uppercase tracking-wider text-white sm:hidden">{items[index].label} —</strong>
        {items[index].body}
      </p>
    </div>
  );
}
