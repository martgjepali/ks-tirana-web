import { requireStaff } from "@/lib/admin/session";
import { getSiteSettings } from "@/lib/data/club";
import { DEFAULT_SETTINGS, SOCIAL_LABELS, type SocialName } from "@/lib/club";
import { Card, Field, Grid, Input, Notice, PageHeader } from "@/components/admin/ui";
import { ConfirmButton, ImageInput, SubmitButton } from "@/components/admin/client";
import { saveSettings, saveSettingFile } from "./actions";
import { ASSET_FIELDS, assetValue, CONTACT_FIELDS } from "./fields";

type Search = Record<string, string | string[] | undefined>;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const [settings, sp] = await Promise.all([getSiteSettings(), searchParams]);
  return (
    <>
      <PageHeader title="Cilësimet e faqes" />
      <Notice ok={sp.ok} error={sp.gabim} />
      <div className="max-w-5xl space-y-5">
        <Card title="Kontakti, rrjetet sociale dhe biletat">
          <form action={saveSettings} className="space-y-5">
            <Grid>
              {CONTACT_FIELDS.map(({ key, label, type }) => (
                <Field key={key} label={label}><Input name={key} type={type} defaultValue={settings.contact[key]} required /></Field>
              ))}
              {(Object.keys(SOCIAL_LABELS) as SocialName[]).map((key) => (
                <Field key={key} label={SOCIAL_LABELS[key]}><Input name={key} type="url" defaultValue={settings.socials[key]} /></Field>
              ))}
              <Field label="WhatsApp për biletat" hint="Përfshini prefiksin e shtetit, p.sh. +355.">
                <Input name="whatsapp" type="tel" defaultValue={settings.tickets.whatsapp} required />
              </Field>
            </Grid>
            <SubmitButton>Ruaj cilësimet</SubmitButton>
          </form>
        </Card>
        {ASSET_FIELDS.map(({ key, label, pdf }) => {
          const current = assetValue(settings, key);
          const customized = current !== assetValue(DEFAULT_SETTINGS, key);
          return (
            <div id={key} key={key}>
              <Card title={label}>
                <form action={saveSettingFile.bind(null, key, false)} className="space-y-4">
                  <ImageInput name="file" current={current} label={label} accept={pdf ? "application/pdf" : "image/*"} />
                  <SubmitButton>Ruaj skedarin</SubmitButton>
                </form>
                {customized && (
                  <form action={saveSettingFile.bind(null, key, true)} className="mt-3">
                    <ConfirmButton icon={pdf ? "trash" : "arrowLeft"}>{pdf ? "Hiq dokumentin" : "Rikthe imazhin fillestar"}</ConfirmButton>
                  </form>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
}
