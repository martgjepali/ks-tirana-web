/**
 * How the client's archive folders map to disciplines on the site.
 * Folder names are exactly as they appear on disk (including the client's spelling).
 * Names/descriptions can be edited later in the admin panel; the import never
 * overwrites a discipline that already exists.
 */
export type DisciplineSeed = {
  folder: string; // under "White and Blue Legacy/"
  slug: string;
  nameSq: string;
  nameEn: string;
};

export const DISCIPLINES: DisciplineSeed[] = [
  { folder: "BASKETBALL MESHKUJ", slug: "basketboll-meshkuj", nameSq: "Basketboll Meshkuj", nameEn: "Men's Basketball" },
  { folder: "BASKETBALL FEMRA", slug: "basketboll-femra", nameSq: "Basketboll Femra", nameEn: "Women's Basketball" },
  { folder: "VOLLEYBALL MESHKUJ", slug: "volejboll-meshkuj", nameSq: "Volejboll Meshkuj", nameEn: "Men's Volleyball" },
  { folder: "VOLLEYBALL FEMRA", slug: "volejboll-femra", nameSq: "Volejboll Femra", nameEn: "Women's Volleyball" },
  { folder: "ATLETIKA", slug: "atletike", nameSq: "Atletikë", nameEn: "Athletics" },
  { folder: "MUNDJE E LIRE", slug: "mundje-e-lire", nameSq: "Mundje e lirë", nameEn: "Freestyle Wrestling" },
  { folder: "MUNDJE GREKO ROMAKE", slug: "mundje-greko-romake", nameSq: "Mundje greko-romake", nameEn: "Greco-Roman Wrestling" },
  { folder: "BOKS", slug: "boks", nameSq: "Boks", nameEn: "Boxing" },
  { folder: "JUDO", slug: "xhudo", nameSq: "Xhudo", nameEn: "Judo" },
  { folder: "KARATE", slug: "karate", nameSq: "Karate", nameEn: "Karate" },
  { folder: "TAEKOWNDO", slug: "taekwondo", nameSq: "Taekwondo", nameEn: "Taekwondo" },
  { folder: "PESHENGRITJE", slug: "peshengritje", nameSq: "Peshëngritje", nameEn: "Weightlifting" },
  { folder: "NOT", slug: "not", nameSq: "Not", nameEn: "Swimming" },
  { folder: "CILKIZEM", slug: "ciklizem", nameSq: "Çiklizëm", nameEn: "Cycling" },
  { folder: "PING PONG", slug: "pingpong", nameSq: "Pingpong", nameEn: "Table Tennis" },
  { folder: "BILARDO", slug: "bilardo", nameSq: "Bilardo", nameEn: "Billiards" },
];

/**
 * Top-level curated folders (10 hand-picked photos each). Their photos are
 * marked featured and used for covers/heroes.
 * "Mundje" does not say which wrestling style — assumed freestyle until the
 * client confirms; photos can be moved in the admin panel.
 */
export const CURATED_FOLDERS: Record<string, string> = {
  Atletike: "ATLETIKA",
  Basketboll_Femra: "BASKETBALL FEMRA",
  Basketboll_Meshkuj: "BASKETBALL MESHKUJ",
  Mundje: "MUNDJE E LIRE",
  Volejboll_Femra: "VOLLEYBALL FEMRA",
  Volejboll_Meshkuj: "VOLLEYBALL MESHKUJ",
};

export const LEGACY_ROOT = "White and Blue Legacy";
