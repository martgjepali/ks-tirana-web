"use server";

import { requireStaff } from "@/lib/admin/session";
import { AdminError, opt, required, run, webUrl } from "@/lib/admin/form";
import { removeUpload, saveImage, savePdf, withUploads } from "@/lib/admin/uploads";
import { DEFAULT_SETTINGS, mergeSettings, SOCIAL_LABELS, type SiteSettings, type SocialName } from "@/lib/club";
import { ASSET_FIELDS, assetValue, CONTACT_FIELDS, setAsset } from "./fields";
import { z } from "zod";

const base = "/admin/cilesimet";

async function editSettings<T>(change: (settings: SiteSettings, undo: (cleanup: () => Promise<void>) => void) => Promise<T>) {
  return withUploads(async (client, undo) => {
    await client.query("INSERT INTO site_settings (key, value) VALUES ('site', '{}') ON CONFLICT (key) DO NOTHING");
    const { rows: [row] } = await client.query<{ value: Partial<SiteSettings> }>("SELECT value FROM site_settings WHERE key = 'site' FOR UPDATE");
    const settings = structuredClone(mergeSettings(row.value));
    const output = await change(settings, undo);
    await client.query("UPDATE site_settings SET value = $1, updated_at = now() WHERE key = 'site'", [settings]);
    return output;
  });
}

export async function saveSettings(form: FormData) {
  await requireStaff();
  await run(base, async () => {
    await editSettings(async (settings) => {
      for (const field of CONTACT_FIELDS) settings.contact[field.key] = required(form, field.key, field.label);
      if (!z.email().safeParse(settings.contact.email).success) throw new AdminError("Shkruani një adresë të vlefshme emaili.");
      for (const name of Object.keys(SOCIAL_LABELS) as SocialName[]) {
        settings.socials[name] = webUrl(opt(form, name), SOCIAL_LABELS[name]) ?? "";
      }
      const number = required(form, "whatsapp", "WhatsApp").replace(/[\s()+-]/g, "");
      if (!/^[1-9]\d{6,14}$/.test(number)) throw new AdminError("Shkruani numrin e WhatsApp-it me prefiksin e shtetit.");
      settings.tickets.whatsapp = number;
    });
  });
}

export async function saveSettingFile(key: string, reset: boolean, form: FormData) {
  await requireStaff();
  const asset = ASSET_FIELDS.find((field) => field.key === key);
  if (!asset) throw new AdminError("Skedari nuk njihet.");
  await run(`${base}#${asset.key}`, async () => {
    const previous = await editSettings(async (settings, undo) => {
      const old = assetValue(settings, asset.key);
      if (reset) {
        setAsset(settings, asset.key, assetValue(DEFAULT_SETTINGS, asset.key));
      } else {
        const file = form.get("file");
        const url = asset.pdf ? await savePdf(file) : await saveImage(file);
        if (!url) throw new AdminError("Zgjidhni një skedar.");
        undo(() => removeUpload(url));
        setAsset(settings, asset.key, url);
      }
      return old;
    });
    await removeUpload(previous);
  });
}
