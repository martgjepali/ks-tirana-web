import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { recordId } from "@/lib/admin/form";
import { disciplineOptions, photoThumb } from "@/lib/admin/lookups";
import { detailSql, getSection, type FieldSpec, type Options } from "@/lib/admin/sections";
import { query } from "@/lib/db/pool";
import { Bilingual, Card, Check, Field, Grid, Input, Notice, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { ConfirmButton, ImageInput, PhotoPicker, SubmitButton } from "@/components/admin/client";
import { loadLibrary } from "../../library";
import { saveEntry, deleteEntry } from "../actions";
import { MagazinePages } from "../../magazine";

type Search = Record<string, string | string[] | undefined>;
type Row = Record<string, string | number | boolean | string[] | null>;

async function EditorField({ spec, row, id, disciplines, coaches }: { spec: FieldSpec; row: Row; id: number | null; disciplines: Options; coaches: Options }) {
  const { key, label, required, hint } = spec;
  const value = row[key] ?? spec.initial;
  const text = value == null ? "" : String(value);
  if (spec.pair) return <Bilingual name={key} label={label} values={{ sq: row[`${key}_sq`] as string | null, en: row[`${key}_en`] as string | null }} textarea={spec.kind === "textarea"} rows={key === "body" ? 12 : undefined} required={required} />;
  if (spec.kind === "check") return <Check name={key} label={label} defaultChecked={value === true} hint={hint} />;

  if (spec.kind === "photo" || spec.kind === "portrait" || spec.kind === "image") {
    const current = spec.kind !== "image" ? await photoThumb(row[key] as string | null) : null;
    return (
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-bold text-strong">{label}</legend>
        <div className="mt-2 space-y-3">
          {spec.kind === "photo" && (!spec.scoped || id !== null) && <PhotoPicker name={key} current={current} load={loadLibrary.bind(null, spec.scoped ? id : null)} />}
          {spec.scoped && id === null && <p className="text-sm text-ink/65">Ruajeni disiplinën për të zgjedhur një foto nga biblioteka e saj.</p>}
          {(spec.upload || spec.kind !== "photo") && <ImageInput name={spec.kind === "photo" ? `${key}_file` : key} current={spec.kind === "image" ? text : current?.thumb} contain={key === "logo_url"} label={`Ngarko ${label.toLocaleLowerCase("sq")}`} />}
          {spec.kind === "portrait" && current && <Check name="remove_portrait" label="Hiq portretin" />}
        </div>
      </fieldset>
    );
  }

  if (spec.kind === "select") {
    const options = spec.options === "disciplines" ? disciplines : spec.options === "coaches" ? coaches : spec.options ?? [];
    return (
      <Field label={label} hint={hint}>
        <Select name={key} defaultValue={text} required={required} options={[{ value: "", label: required ? "Zgjidhni…" : "—" }, ...options]} />
      </Field>
    );
  }

  return (
    <Field label={label} hint={hint} wide={spec.kind === "textarea"}>
      {spec.kind === "textarea" ? <Textarea name={key} defaultValue={text} required={required} /> : (
        <Input name={key} defaultValue={spec.kind === "sizes" && Array.isArray(value) ? value.join(", ") : text} required={required}
          type={spec.kind === "number" ? "number" : spec.kind === "datetime" ? "datetime-local" : spec.kind === "url" ? "url" : "text"}
          min={spec.min} max={spec.max} />
      )}
    </Field>
  );
}

export default async function EntryPage({ params, searchParams }: { params: Promise<{ section: string; id: string }>; searchParams: Promise<Search> }) {
  await requireStaff();
  const [{ section: key, id: routeId }, sp] = await Promise.all([params, searchParams]);
  const section = getSection(key);
  const id = recordId(routeId);
  if (!section || (!id && (routeId !== "i-ri" || section.inbox))) notFound();
  const [rows, disciplines, coaches] = await Promise.all([
    id ? query<Row>(detailSql(section), [id]) : null,
    section.fields.some((field) => field.options === "disciplines") ? disciplineOptions() : [],
    key === "akademia" ? query<{ value: number; label: string }>(
      `SELECT p.id AS value, concat(p.full_name, ' · ', d.name_sq) AS label
       FROM people p JOIN disciplines d ON d.id = p.discipline_id
       WHERE p.role <> 'athlete' OR p.id = (SELECT coach_person_id FROM academy_programs WHERE id = $1)
       ORDER BY d.name_sq, p.full_name`, [id],
    ) : [],
  ]);
  if (id && !rows?.length) notFound();
  const row: Row = rows?.[0] ?? {};
  return (
    <>
      <PageHeader title={id ? String(row[section.name]) : `Shto ${section.singular.toLocaleLowerCase("sq")}`} back={{ href: `/admin/${key}`, label: section.title }} />
      <Notice ok={sp.ok} error={sp.gabim} />
      <div className="max-w-5xl space-y-5">
        {section.inbox && (
          <Card title="Të dhënat e dërguara">
            <dl className="grid gap-4 sm:grid-cols-2">
              {section.inbox.fields.map((field) => (
                <div key={field.key} className={field.key === "message" || field.key === "notes" ? "sm:col-span-2" : undefined}>
                  <dt className="text-sm font-bold text-strong">{field.label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{String(row[field.key] ?? "—")}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
        <Card>
          <form action={saveEntry.bind(null, key, routeId)} className="space-y-5">
            <Grid>{section.fields.map((spec) => <EditorField key={spec.key} spec={spec} row={row} id={id} disciplines={disciplines} coaches={coaches} />)}</Grid>
            <SubmitButton>Ruaj</SubmitButton>
          </form>
        </Card>
        {key === "revista" && id && <MagazinePages id={id} />}
        {id && <form action={deleteEntry.bind(null, key, routeId)}><ConfirmButton>Fshi</ConfirmButton></form>}
      </div>
    </>
  );
}
