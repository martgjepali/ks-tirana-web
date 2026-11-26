/**
 * Club settings edited in /admin → Cilësimet (stored in site_settings, key "site").
 * These defaults apply until something is saved, and whenever the database is
 * unreachable, so the site never shows empty contact details.
 */

export type SocialName = "facebook" | "instagram" | "linkedin" | "youtube";

export type SiteSettings = {
  contact: { venue: string; address: string; phone: string; email: string };
  socials: Record<SocialName, string>;
  tickets: { whatsapp: string; images: string[] };
  mediaKitUrl: string;
  orgChartPdfUrl: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    venue: 'Pallati i Sportit "Farie Hoti"',
    address: "Rruga e Kavajës, Tiranë",
    phone: "042 227 006",
    email: "info@kstirana.al",
  },
  socials: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/",
  },
  tickets: { whatsapp: "355690000000", images: ["/images/demo/bileta.jpg", "/images/demo/bileta.jpg"] },
  mediaKitUrl: "",
  orgChartPdfUrl: "",
};

export const SOCIAL_LABELS: Record<SocialName, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export const CLUB_NAME = "Klubi Sportiv Tirana";

export const whatsappLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

/** Merges a saved settings document over the defaults (missing keys keep their default). */
export function mergeSettings(saved: Partial<SiteSettings> | null | undefined): SiteSettings {
  const s = saved ?? {};
  return {
    contact: { ...DEFAULT_SETTINGS.contact, ...s.contact },
    socials: { ...DEFAULT_SETTINGS.socials, ...s.socials },
    tickets: { ...DEFAULT_SETTINGS.tickets, ...s.tickets },
    mediaKitUrl: s.mediaKitUrl ?? DEFAULT_SETTINGS.mediaKitUrl,
    orgChartPdfUrl: s.orgChartPdfUrl ?? DEFAULT_SETTINGS.orgChartPdfUrl,
  };
}
