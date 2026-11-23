import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { getPerson, getPhotos, getTeammates } from "@/lib/data/sports";
import { MediaImage } from "@/components/MediaImage";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PersonCard, roleLabel } from "@/components/PersonCard";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/sportet/[discipline]/[person]">): Promise<Metadata> {
  const { lang, discipline, person: slug } = await params;
  if (!hasLocale(lang)) return {};
  const person = await getPerson(discipline, slug, lang);
  if (!person) return {};
  return {
    title: `${person.fullName} · ${person.discipline.name} · KS Tirana`,
    description: person.bio?.slice(0, 160) ?? undefined,
    openGraph: person.portrait ? { images: [{ url: person.portrait.large }] } : undefined,
  };
}

export default async function PersonPage({ params }: PageProps<"/[lang]/sportet/[discipline]/[person]">) {
  const { lang, discipline: disciplineSlug, person: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, person] = await Promise.all([getDictionary(lang), getPerson(disciplineSlug, slug, lang)]);
  if (!person) notFound();
  const t = dict.sports;
  const p = t.profile;

  const [photos, teammates] = await Promise.all([
    getPhotos({ personId: person.id }, lang, 60),
    getTeammates(person.disciplineId, person.id, lang, 4),
  ]);
  const base = `/${lang}/sportet/${person.discipline.slug}`;
  const cardLabels = { headCoach: t.headCoach, assistantCoach: t.assistantCoach, athlete: t.athlete, captain: t.captain };
  const facts = [
    { label: p.number, value: person.shirtNumber },
    { label: p.position, value: person.role === "athlete" ? person.position : null },
    { label: p.born, value: person.birthYear },
    { label: p.nationality, value: person.nationality },
  ].filter((f) => f.value !== null && f.value !== "");

  return (
    <>
      <section className="bg-navy-950 text-white">
        <div className="wrap grid grid-cols-1 gap-10 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16 lg:py-16">
          <Reveal y={0}>
            {person.portrait ? (
              <MediaImage
                photo={person.portrait}
                alt={person.fullName}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/5] rounded-2xl"
                position="center 20%"
                priority
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-navy-900">
                <Icon name="users" className="h-16 w-16 text-white/15" />
              </div>
            )}
          </Reveal>
          <Reveal delay={0.08}>
            <Link href={base} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
              <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
              {p.back} {person.discipline.name}
            </Link>
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">
              {roleLabel(person, cardLabels)}
              {person.isCaptain && (
                <span className="rounded bg-gold-400 px-2 py-0.5 text-xs tracking-wider text-navy-950">{t.captain}</span>
              )}
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {person.fullName}
            </h1>
            {facts.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-white/60">{f.label}</dt>
                    <dd className="font-display mt-1 text-2xl font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-16">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{p.bio}</h2>
            <p className={`mt-4 max-w-2xl whitespace-pre-line leading-relaxed ${person.bio ? "text-ink/75" : "text-ink/50"}`}>
              {person.bio ?? p.noBio}
            </p>
          </div>
          {person.achievements && (
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
                <Icon name="trophy" className="h-4 w-4 text-gold-500" />
                {p.achievements}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{person.achievements}</p>
            </div>
          )}
        </div>
      </section>

      {photos.length > 0 && (
        <section className="bg-surface py-14 lg:py-16">
          <div className="wrap">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">
              {p.photos} <span className="text-ink/40">({person.photoCount})</span>
            </h2>
            <div className="mt-6">
              <PhotoGallery photos={photos} labels={t.lightbox} />
            </div>
          </div>
        </section>
      )}

      {teammates.length > 0 && (
        <section className="bg-paper py-14 lg:py-16">
          <div className="wrap">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{p.teammates}</h2>
              <Link href={base} className="link-underline text-sm font-semibold text-blue-600">
                {t.viewTeam}
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {teammates.map((m) => (
                <li key={m.slug}>
                  <PersonCard person={m} href={`${base}/${m.slug}`} labels={cardLabels} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
