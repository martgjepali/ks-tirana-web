"use client";

import { useState } from "react";
import { Icon } from "./Icons";

type Node = { name: string; body: string; items: string[] };

/**
 * Organisation chart from the client's design ("Skemë me klikim në kompjuter
 * dhe listë që hapet në telefon"): on large screens a clickable chart with a
 * detail panel; on phones an expanding list.
 */
export function OrgChart({
  root,
  units,
  labels,
}: {
  root: Node;
  units: Node[];
  labels: { unit: string; responsibilities: string; close: string };
}) {
  // -1 = root, 0..n = units, null = panel closed.
  const [selected, setSelected] = useState<number | null>(0);
  const nodes = [root, ...units];
  const unitLabel = (i: number) => labels.unit.replace("{n}", String(i + 1).padStart(2, "0"));
  const current = selected === null ? null : nodes[selected + 1];

  const detail = (node: Node, i: number) => (
    <>
      {i >= 0 && <p className="eyebrow flex items-center gap-3 text-[0.625rem] text-ink/60">{unitLabel(i)}<span className="h-px w-10 bg-line" /></p>}
      <h3 className="display mt-3 text-2xl text-strong">{node.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{node.body}</p>
      <hr className="my-5 border-line" />
      <p className="eyebrow text-[0.625rem] text-ink/60">{labels.responsibilities}</p>
      <ul className="mt-4 space-y-3">
        {node.items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-ink/80">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      {/* Phones: expanding list */}
      <ul className="space-y-2 lg:hidden">
        {nodes.map((node, k) => {
          const i = k - 1;
          const open = selected === i;
          return (
            <li key={node.name} className="rounded-sm border border-line bg-card">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setSelected(open ? null : i)}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left font-bold ${i < 0 ? "bg-navy-900 text-white" : "text-strong"}`}
              >
                <Icon name="users" className="h-5 w-5 shrink-0" />
                <span className="flex-1">{i < 0 ? node.name : `${unitLabel(i)} · ${node.name}`}</span>
                <Icon name="chevronDown" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open && <div className="px-4 pb-5 pt-2">{detail(node, i)}</div>}
            </li>
          );
        })}
      </ul>

      {/* Computers: chart + detail panel */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
        <div className="flex flex-col items-center pt-4">
          <button
            type="button"
            onClick={() => setSelected(-1)}
            aria-pressed={selected === -1}
            className={`relative flex w-full max-w-sm flex-col items-center gap-2 rounded-sm px-6 py-5 text-white shadow-lg transition ${
              selected === -1 ? "bg-blue-500" : "bg-navy-900 hover:bg-navy-800"
            }`}
          >
            <Icon name="users" className="h-7 w-7" />
            <span className="text-lg font-bold">{root.name}</span>
            <span className="absolute right-5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900">
              <Icon name="chevronRight" className="h-4 w-4" />
            </span>
          </button>
          {/* Dotted connectors */}
          <div className="h-6 border-l border-dashed border-ink/40" />
          <div className="w-[calc(100%-12rem)] border-t border-dashed border-ink/40" />
          <ul className="grid w-full grid-cols-3 gap-8">
            {units.map((u, i) => (
              <li key={u.name} className="flex flex-col items-center">
                <div className="h-6 border-l border-dashed border-ink/40" />
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={selected === i}
                  title={u.name}
                  className={`flex w-full items-center gap-3 rounded-sm border px-5 py-5 text-left transition ${
                    selected === i ? "border-blue-500 bg-blue-500 text-white shadow-lg" : "border-line bg-card text-strong hover:border-blue-500"
                  }`}
                >
                  <Icon name="users" className="h-6 w-6 shrink-0" />
                  <span className="flex-1 text-base font-bold">{unitLabel(i)}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${selected === i ? "border-white bg-white text-blue-500" : "border-line"}`}>
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="min-h-[22rem]" aria-live="polite">
          {current && selected !== null && (
            <div className="relative border border-line bg-surface p-7 shadow-[var(--shadow-card)]">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={labels.close}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-ink/60 hover:text-strong"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
              {detail(current, selected)}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
