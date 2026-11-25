import type { IconName } from "@/components/Icons";
import { groupOf } from "./sport-groups";

/** Icons that differ from the discipline's group icon. */
const ICONS: Record<string, IconName> = {
  boks: "boxing",
  karate: "boxing",
  taekwondo: "boxing",
  pingpong: "table",
};

export const sportIcon = (slug: string): IconName => ICONS[slug] ?? groupOf(slug).icon;
