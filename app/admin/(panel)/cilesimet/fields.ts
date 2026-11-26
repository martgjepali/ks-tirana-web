import type { SiteSettings } from "@/lib/club";

export const CONTACT_FIELDS: { key: keyof SiteSettings["contact"]; label: string; type?: "tel" | "email" }[] = [
  { key: "venue", label: "Emri i ambientit" },
  { key: "address", label: "Adresa" },
  { key: "phone", label: "Telefoni", type: "tel" },
  { key: "email", label: "Email", type: "email" },
];

export const ASSET_FIELDS = [
  { key: "ticket0", label: "Imazhi i parë i biletave", pdf: false },
  { key: "ticket1", label: "Imazhi i dytë i biletave", pdf: false },
  { key: "mediaKitUrl", label: "Paketa për median (PDF)", pdf: true },
  { key: "orgChartPdfUrl", label: "Organigrama (PDF)", pdf: true },
] as const;

type Asset = (typeof ASSET_FIELDS)[number]["key"];

export function assetValue(settings: SiteSettings, key: Asset) {
  if (key === "ticket0") return settings.tickets.images[0] ?? "";
  if (key === "ticket1") return settings.tickets.images[1] ?? "";
  return settings[key];
}

export function setAsset(settings: SiteSettings, key: Asset, url: string) {
  if (key === "ticket0") settings.tickets.images[0] = url;
  else if (key === "ticket1") settings.tickets.images[1] = url;
  else settings[key] = url;
}
