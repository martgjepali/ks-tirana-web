import type { IconName } from "@/components/Icons";

/**
 * How disciplines are grouped on the site: the home "Sportet" tiles and the
 * calendar filters, in the order of the client's final design. Men's and
 * women's teams of one sport share a group; both wrestling styles are "Mundje".
 */
export type SportGroup = {
  key: string;
  name: { sq: string; en: string };
  icon: IconName;
  slugs: string[];
};

export const SPORT_GROUPS: SportGroup[] = [
  { key: "volejboll", name: { sq: "Volejboll", en: "Volleyball" }, icon: "volley", slugs: ["volejboll-femra", "volejboll-meshkuj"] },
  { key: "basketboll", name: { sq: "Basketboll", en: "Basketball" }, icon: "hoop", slugs: ["basketboll-femra", "basketboll-meshkuj"] },
  { key: "karate", name: { sq: "Karate", en: "Karate" }, icon: "boxing", slugs: ["karate"] },
  { key: "atletike", name: { sq: "Atletikë", en: "Athletics" }, icon: "run", slugs: ["atletike"] },
  { key: "not", name: { sq: "Not", en: "Swimming" }, icon: "swim", slugs: ["not"] },
  { key: "judo", name: { sq: "Judo", en: "Judo" }, icon: "wrestling", slugs: ["xhudo"] },
  { key: "mundje", name: { sq: "Mundje", en: "Wrestling" }, icon: "wrestling", slugs: ["mundje-e-lire", "mundje-greko-romake"] },
  {
    key: "te-tjera",
    name: { sq: "Të tjera", en: "Others" },
    icon: "dots",
    slugs: ["boks", "taekwondo", "peshengritje", "ciklizem", "shah", "qitje", "tenis", "pingpong", "mma", "bilardo"],
  },
];

const OTHERS = SPORT_GROUPS[SPORT_GROUPS.length - 1];

/** The group a discipline belongs to; unknown (newly added) disciplines go to "Të tjera". */
export function groupOf(slug: string): SportGroup {
  return SPORT_GROUPS.find((g) => g.slugs.includes(slug)) ?? OTHERS;
}

/** Team sports list "Lojtarët" by name; the rest show "Sportistët". */
export const isTeamSport = (slug: string) => /^(volejboll|basketboll)-/.test(slug);
