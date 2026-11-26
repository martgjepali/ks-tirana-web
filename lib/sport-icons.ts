import type { IconName } from "@/components/Icons";
import { groupOf } from "./sport-groups";

/** Icons that differ from the discipline's group icon. */
const ICONS: Record<string, IconName> = {
  boks: "boxing",
  taekwondo: "boxing",
  mma: "boxing",
  peshengritje: "weights",
  ciklizem: "bike",
  pingpong: "table",
  shah: "chess",
  qitje: "target",
  tenis: "tennis",
};

export const sportIcon = (slug: string): IconName => ICONS[slug] ?? groupOf(slug).icon;
