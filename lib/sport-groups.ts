import type { IconName } from "@/components/Icons";

/**
 * How the 16 disciplines are grouped on the site (home "Sportet tanë" tiles,
 * Disciplines filters, Calendar chips). Men's and women's teams of one sport
 * share a group; combat sports are one group, as in the client's design.
 */
export type SportKind = "team" | "individual";
export type Gender = "men" | "women" | "mixed";

export type SportGroup = {
  key: string;
  name: { sq: string; en: string };
  icon: IconName;
  kind: SportKind;
  slugs: string[];
};

export const SPORT_GROUPS: SportGroup[] = [
  { key: "volejboll", name: { sq: "Volejboll", en: "Volleyball" }, icon: "volley", kind: "team", slugs: ["volejboll-meshkuj", "volejboll-femra"] },
  { key: "basketboll", name: { sq: "Basketboll", en: "Basketball" }, icon: "hoop", kind: "team", slugs: ["basketboll-meshkuj", "basketboll-femra"] },
  { key: "atletike", name: { sq: "Atletikë", en: "Athletics" }, icon: "run", kind: "individual", slugs: ["atletike"] },
  { key: "not", name: { sq: "Not", en: "Swimming" }, icon: "swim", kind: "individual", slugs: ["not"] },
  {
    key: "luftarake",
    name: { sq: "Sportet luftarake", en: "Combat sports" },
    icon: "wrestling",
    kind: "individual",
    slugs: ["mundje-e-lire", "mundje-greko-romake", "boks", "xhudo", "karate", "taekwondo"],
  },
  { key: "peshengritje", name: { sq: "Peshëngritje", en: "Weightlifting" }, icon: "weights", kind: "individual", slugs: ["peshengritje"] },
  { key: "ciklizem", name: { sq: "Çiklizëm", en: "Cycling" }, icon: "bike", kind: "individual", slugs: ["ciklizem"] },
  { key: "te-tjera", name: { sq: "Të tjera", en: "Others" }, icon: "dots", kind: "individual", slugs: ["pingpong", "bilardo"] },
];

const OTHERS = SPORT_GROUPS[SPORT_GROUPS.length - 1];

/** The group a discipline belongs to; unknown (newly added) disciplines go to "Të tjera". */
export function groupOf(slug: string): SportGroup {
  return SPORT_GROUPS.find((g) => g.slugs.includes(slug)) ?? OTHERS;
}

export function genderOf(slug: string): Gender {
  if (slug.endsWith("-meshkuj")) return "men";
  if (slug.endsWith("-femra")) return "women";
  return "mixed";
}

/** Sports season label, e.g. "2026–2027" (a new season starts in September). */
export function currentSeason(now = new Date()) {
  const year = now.getFullYear();
  const start = now.getMonth() >= 8 ? year : year - 1;
  return `${start}–${start + 1}`;
}
