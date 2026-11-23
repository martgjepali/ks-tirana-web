import Image from "next/image";

const sources = {
  heroVolleyball: "/images/photos/hero-volleyball.webp",
  sportBasketball: "/images/photos/sport-basketball.webp",
  sportVolleyball: "/images/photos/sport-volleyball.webp",
  sportAthletics: "/images/photos/sport-athletics.webp",
  sportWrestling: "/images/photos/sport-wrestling.webp",
  sportSwimming: "/images/photos/sport-swimming.webp",
  sportBoxing: "/images/photos/sport-boxing.webp",
  academyTraining: "/images/photos/academy-training.webp",
  clubHistoryHero: "/images/photos/club-history-hero.webp",
  clubTeamHuddle: "/images/photos/club-team-huddle.webp",
  shopFlatlay: "/images/photos/shop-flatlay.webp",
  athletePortrait: "/images/photos/athlete-portrait.webp",
} as const;

export type PhotoName = keyof typeof sources;

export function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  fill = false,
}: {
  name: PhotoName;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Fill the nearest positioned ancestor instead of sizing via aspect-ratio. */
  fill?: boolean;
}) {
  const position = fill ? "absolute inset-0" : "relative";
  return (
    <div className={`photo-zoom ${position} isolate overflow-hidden ${className}`}>
      <Image
        src={sources[name]}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="photo-fill object-cover"
      />
    </div>
  );
}
