import type { IconName } from "@/components/Icons";

/** Icon per discipline slug; anything unknown gets the club shield. */
const ICONS: Record<string, IconName> = {
  "basketboll-meshkuj": "hoop",
  "basketboll-femra": "hoop",
  "volejboll-meshkuj": "volley",
  "volejboll-femra": "volley",
  atletike: "track",
  "mundje-e-lire": "wrestling",
  "mundje-greko-romake": "wrestling",
  boks: "boxing",
  not: "swim",
  ciklizem: "bike",
};

export const sportIcon = (slug: string): IconName => ICONS[slug] ?? "shield";
