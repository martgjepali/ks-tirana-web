/**
 * Club links and files that the client still has to provide. Anything left
 * empty here is simply not shown, so the site never has a dead link
 * ("Lidhjet dhe formularët duhet të funksionojnë saktë" — client proposal).
 */

/** Official social media pages. Icons appear in the header and footer once a URL is set. */
export const SOCIAL_LINKS: { name: "facebook" | "instagram" | "youtube" | "linkedin"; url: string }[] = [
  // { name: "facebook", url: "https://www.facebook.com/..." },
  // { name: "instagram", url: "https://www.instagram.com/..." },
  // { name: "youtube", url: "https://www.youtube.com/@..." },
  // { name: "linkedin", url: "https://www.linkedin.com/company/..." },
];

/**
 * Partnership presentation (PDF) for "Shkarko Media Kit", e.g. "/files/ks-tirana-media-kit.pdf"
 * (put the file in public/files/). While empty, the buttons ask for it through the contact form.
 */
export const MEDIA_KIT_URL: string | null = null;

/** Official organisation chart (PDF) for "Shkarko PDF" on Drejtimi & Organizimi. Hidden while empty. */
export const ORG_CHART_PDF_URL: string | null = null;

/**
 * Sponsors and partners shown on the home page, the partner page and in the footer.
 * Put logos in public/images/partners/ (SVG or PNG, transparent background).
 * The strip stays hidden while this list is empty.
 */
export const PARTNERS: { name: string; logo: string; url?: string }[] = [
  // { name: "Partner", logo: "/images/partners/partner.svg", url: "https://..." },
];
