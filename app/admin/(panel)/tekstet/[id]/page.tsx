import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { Card, Field, Grid, Notice, PageHeader, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import { locales, type Locale } from "@/app/[lang]/dictionaries";
import { sectionDefaults, TEXT_SECTIONS } from "../sections";
import { saveTextSection } from "../actions";

type Search = Record<string, string | string[] | undefined>;
const labels = { sq: "Shqip", en: "Anglisht" };

export default async function TextSection({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!Object.hasOwn(TEXT_SECTIONS, id)) notFound();
  const [sq, en, rows] = await Promise.all([
    sectionDefaults("sq", id), sectionDefaults("en", id),
    query<{ locale: Locale; key: string; value: string }>("SELECT locale, key, value FROM site_texts WHERE starts_with(key, $1)", [`${id}.`]),
  ]);
  const keys = Array.from(new Set([...sq.keys(), ...en.keys()]));
  const overrides = new Map(rows.map((r) => [`${r.locale}:${r.key}`, r.value]));
  const defaults = { sq, en };
  return (
    <>
      <PageHeader title={TEXT_SECTIONS[id]} back={{ href: "/admin/tekstet", label: "Tekstet e faqeve" }} subtitle="Për të rikthyer tekstin fillestar në një gjuhë, zbrazni fushën dhe ruajeni." />
      <Notice ok={sp.ok} error={sp.gabim} />
      <form action={saveTextSection.bind(null, id)} className="max-w-5xl space-y-4">
        <Card>
          <div className="divide-y divide-line">
            {keys.map((key) => (
              <fieldset key={key} className="py-4 first:pt-0 last:pb-0">
                <p className="mb-2 break-words text-sm font-semibold text-strong">{key.slice(id.length + 1)}</p>
                <Grid>
                  {locales.map((locale) => {
                    const initial = defaults[locale].get(key);
                    if (initial === undefined) return null;
                    const name = `${locale}:${key}`;
                    const value = overrides.get(name) ?? initial;
                    return (
                      <Field key={locale} label={labels[locale]}>
                        <Textarea name={name} defaultValue={value} placeholder={initial} rows={Math.min(8, Math.max(2, Math.ceil(value.length / 65)))} />
                      </Field>
                    );
                  })}
                </Grid>
              </fieldset>
            ))}
          </div>
        </Card>
        <SubmitButton>Ruaj tekstet</SubmitButton>
      </form>
    </>
  );
}
