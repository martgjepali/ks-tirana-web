/**
 * Club details, sponsors and links, from the client's final design
 * (docs/KS_TIRANA_WEB_Final .pdf).
 *
 * Items marked EXAMPLE are placeholder data for the MVP (agreed with the client):
 * replace them with the real values when the club sends them.
 */

export const CLUB_INFO = {
  name: "Klubi Sportiv Tirana",
  founded: { sq: "Themeluar 15 Gusht 1920", en: "Founded 15 August 1920" },
  venue: 'Pallati i Sportit "Farie Hoti"',
  address: "Rruga e Kavajës, Tiranë",
  phone: "042 227 006",
  email: "info@kstirana.al",
};

/** Social media pages. EXAMPLE: platform home pages until the club sends its own profile links. */
export const SOCIAL_LINKS: { name: "facebook" | "instagram" | "linkedin" | "youtube"; label: string; url: string }[] = [
  { name: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
  { name: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
  { name: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/" },
  { name: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
];

/** Main supporter, shown beside the sponsor bar ("Mbështetësi kryesor i KS Tirana"). */
export const MAIN_SUPPORTER = { name: "Bashkia Tiranë", logo: "/images/partners/bashkia-tirane.png" };

/** Sponsors in the sliding logo bar (home, Partnerët, footer). Logos taken from the client's design. */
export const PARTNERS: { name: string; logo: string; url?: string }[] = [
  { name: "Sixt", logo: "/images/partners/sixt.png" },
  { name: "Selita", logo: "/images/partners/selita.png" },
  { name: "Raiffeisen Invest", logo: "/images/partners/raiffeisen-invest.png" },
  { name: "Geely", logo: "/images/partners/geely.png" },
  { name: "Delfino", logo: "/images/partners/delfino.png" },
];

/**
 * Tickets ("Rezervo biletën" on the calendar): for now a WhatsApp chat with the
 * ticket office. EXAMPLE number and ticket images until the club provides them.
 */
export const TICKETS = {
  whatsapp: "355690000000",
  images: ["/images/demo/bileta.jpg", "/images/demo/bileta.jpg"],
};

/** Magazine "Ne jemi Tirona". EXAMPLE issues: cover from the design, pages filled with club photos. */
export const MAGAZINE_ISSUES: { number: number; date: { sq: string; en: string }; cover: string }[] = [
  { number: 4, date: { sq: "Dhjetor 2026", en: "December 2026" }, cover: "/images/demo/revista-cover.png" },
  { number: 3, date: { sq: "Shtator 2026", en: "September 2026" }, cover: "/images/demo/revista-cover.png" },
  { number: 2, date: { sq: "Qershor 2026", en: "June 2026" }, cover: "/images/demo/revista-cover.png" },
  { number: 1, date: { sq: "Mars 2026", en: "March 2026" }, cover: "/images/demo/revista-cover.png" },
];

/** Partnership presentation (PDF), e.g. "/files/ks-tirana-media-kit.pdf" in public/files/. Hidden while empty. */
export const MEDIA_KIT_URL: string | null = null;

/** Official organisation chart (PDF) for "Shkarko PDF" on Drejtimi & Organizimi. Hidden while empty. */
export const ORG_CHART_PDF_URL: string | null = null;

export const whatsappLink = (text: string) => `https://wa.me/${TICKETS.whatsapp}?text=${encodeURIComponent(text)}`;
