import "server-only";
import { getDefaultDictionary, type Locale } from "@/app/[lang]/dictionaries";

export const TEXT_SECTIONS: Record<string, string> = {
  meta: "Titulli dhe përshkrimi i faqes",
  header: "Kreu i faqes",
  nav: "Menuja kryesore",
  footer: "Fundi i faqes",
  home: "Ballina",
  sports: "Sportet",
  profile: "Profili i sportistit",
  academy: "Akademia",
  calendar: "Kalendari",
  news: "Lajmet",
  history: "Historia e klubit",
  org: "Drejtimi i klubit",
  shop: "Dyqani",
  partner: "Bashkëpunimi me partnerët",
  search: "Kërkimi",
  contact: "Kontakti",
  team: "Ekipi i disiplinës",
  magazine: "Revista",
  partners: "Partnerët",
  formErrors: "Mesazhet e formularëve",
};

function flatten(value: unknown, path: string, output: Map<string, string>) {
  if (typeof value === "string") output.set(path, value);
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) flatten(entry, `${path}.${key}`, output);
  }
}

export async function sectionDefaults(locale: Locale, section: string) {
  const dictionary = await getDefaultDictionary(locale);
  const fields = new Map<string, string>();
  if (Object.hasOwn(dictionary, section)) flatten(dictionary[section as keyof typeof dictionary], section, fields);
  return fields;
}
