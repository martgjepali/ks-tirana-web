import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { recordId } from "@/lib/admin/form";
import { disciplineOptions } from "@/lib/admin/lookups";
import { getSection, type Section } from "@/lib/admin/sections";
import { query } from "@/lib/db/pool";
import { Badge, Field, FilterButton, Input, LinkButton, Notice, PageHeader, Select, Table, one } from "@/components/admin/ui";
import type { IconName } from "@/components/Icons";

type Search = Record<string, string | string[] | undefined>;
type Row = { id: number } & Record<string, unknown>;
const dateTime = new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Tirane" });
const columnIcons: Record<string, IconName> = { discipline: "trophy", role: "users", score: "target" };

function cell(row: Row, column: Section["columns"][number]) {
  const value = row[column.key];
  const label = column.options?.find((o) => o.value === value)?.label;
  switch (column.kind) {
    case "published": return <Badge tone={value ? "green" : "gray"}>{value ? "Publikuar" : "I fshehur"}</Badge>;
    case "date": return value instanceof Date ? dateTime.format(value) : "—";
    case "news": {
      if (!(value instanceof Date)) return <Badge tone="gray">Draft</Badge>;
      const scheduled = value.getTime() > Date.now();
      return <Badge tone={scheduled ? "amber" : "green"}>{scheduled ? "Planifikuar" : "Publikuar"} · {dateTime.format(value)}</Badge>;
    }
    case "status": return <Badge tone={value === "new" || value === "live" ? "blue" : "gray"}>{label ?? String(value)}</Badge>;
    default: return label ?? (value == null || value === "" ? "—" : String(value));
  }
}

export default async function EntryList({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Search> }) {
  await requireStaff();
  const [{ section: key }, sp] = await Promise.all([params, searchParams]);
  const section = getSection(key);
  if (!section) notFound();
  const base = `/admin/${key}`;
  const args: unknown[] = [];
  const status = one(sp.status) ?? "";
  const search = (one(sp.q) ?? "").trim().slice(0, 120);
  const discipline = recordId(one(sp.disiplina) ?? "");
  const statusOptions = section.columns.find((c) => c.key === "status")?.options ?? [];
  const filters = section.filters ?? [];
  if (filters.includes("discipline")) args.push(discipline);
  if (filters.includes("search")) args.push(search);
  if (filters.includes("status")) args.push(statusOptions.some((o) => o.value === status) ? status : null);
  const [rows, disciplines] = await Promise.all([
    query<Row>(section.list, args),
    filters.includes("discipline") ? disciplineOptions() : [],
  ]);

  return (
    <>
      <PageHeader title={section.title} actions={!section.inbox && <LinkButton href={`${base}/i-ri`} icon="plus" compact>Shto {section.singular.toLocaleLowerCase("sq")}</LinkButton>} />
      <Notice ok={sp.ok} error={sp.gabim} />
      {filters.length > 0 && (
        <form action={base} className="mb-4 flex flex-wrap items-end gap-2 sm:mb-5 sm:gap-3">
          {filters.includes("discipline") && <Field label="Disiplina" className="w-full sm:w-auto"><Select name="disiplina" defaultValue={discipline ?? ""} options={[{ value: "", label: "Të gjitha" }, ...disciplines]} /></Field>}
          {filters.includes("search") && <Field label="Emri" className="flex-1 sm:flex-none"><Input type="search" name="q" enterKeyHint="search" defaultValue={search} maxLength={120} /></Field>}
          {filters.includes("status") && <Field label="Statusi" className="flex-1 sm:flex-none"><Select name="status" defaultValue={status} options={[{ value: "", label: "Të gjitha" }, ...statusOptions]} /></Field>}
          <FilterButton />
        </form>
      )}
      <Table head={section.columns.map((column) => column.label)} mobileColumns={section.columns.slice(1).map(({ key, kind }) => {
        if (kind === "date") return "calendar";
        if (kind === "published" || kind === "news" || kind === "status") return "value";
        return columnIcons[key];
      })} rows={rows.map((row) => ({
        id: row.id,
        href: `${base}/${row.id}`,
        title: cell(row, section.columns[0]),
        details: section.columns.slice(1).map((column) => cell(row, column)),
      }))} />
    </>
  );
}
