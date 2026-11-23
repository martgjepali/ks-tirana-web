import Link from "next/link";
import type { PersonCard as Person } from "@/lib/data/sports";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icons";

export type PersonCardLabels = {
  headCoach: string;
  assistantCoach: string;
  athlete: string;
  captain: string;
};

export function roleLabel(person: Person, labels: PersonCardLabels) {
  if (person.role === "head_coach") return labels.headCoach;
  if (person.role === "assistant_coach") return labels.assistantCoach;
  return person.position ?? labels.athlete;
}

export function PersonCard({
  person,
  href,
  labels,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw",
}: {
  person: Person;
  href: string;
  labels: PersonCardLabels;
  sizes?: string;
}) {
  return (
    <Link
      href={href}
      className="card-hover group block overflow-hidden rounded-xl border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <div className="relative">
        {person.portrait ? (
          <MediaImage photo={person.portrait} alt="" sizes={sizes} className="aspect-[4/5]" position="center 20%" />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-surface-2">
            <Icon name="users" className="h-10 w-10 text-navy-700/25" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {person.shirtNumber !== null && (
            <span className="font-display flex h-8 min-w-8 items-center justify-center rounded-md bg-navy-950/85 px-2 text-sm font-semibold text-white backdrop-blur">
              {person.shirtNumber}
            </span>
          )}
          {person.isCaptain && (
            <span
              className="font-display flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 text-sm font-bold text-navy-950"
              title={labels.captain}
            >
              C<span className="sr-only"> — {labels.captain}</span>
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">{roleLabel(person, labels)}</p>
        <h3 className="font-display mt-1 text-base font-semibold leading-snug text-ink group-hover:text-blue-600">
          {person.fullName}
        </h3>
      </div>
    </Link>
  );
}
