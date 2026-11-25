import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { getPerson, getPhotos } from "@/lib/data/sports";
import { MediaImage } from "@/components/MediaImage";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Breadcrumb } from "@/components/Breadcrumb";
import { roleLabel } from "@/components/PersonCard";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { sportIcon } from "@/lib/sport-icons";
import { ViewTransition } from "react";

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

/** "PROFILI I SPORTISTIT" — client proposal, slide 06/08. */
export default async function PersonPage({ params }: PageProps<"/[lang]/sportet/[discipline]/[person]">) {
  const { lang, discipline: disciplineSlug, person: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, person] = await Promise.all([getDictionary(lang), getPerson(disciplineSlug, slug, lang)]);
  if (!person) notFound();
  const t = dict.sports;
  const p = dict.profile;
  const photos = await getPhotos({ personId: person.id }, lang, 60);
  const isCoach = person.role !== "athlete";
  const cardLabels = { headCoach: t.headCoach, assistantCoach: t.assistantCoach, athlete: t.athlete, captain: t.captain };
  // Achievements are free text; one per line, as in the mockup's trophy list.
  const achievements = person.achievements?.split(/\r?\n/).map((l) => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean) ?? [];
  const facts: { icon: IconName; label: string; value: string; accent?: boolean }[] = [
    { icon: sportIcon(person.discipline.slug), label: p.discipline, value: person.position ?? (isCoach ? roleLabel(person, cardLabels) : "—") },
    { icon: "calendar", label: p.born, value: person.birthYear ? String(person.birthYear) : "—" },
    { icon: "pin", label: p.birthplace, value: "—" },
    { icon: "users", label: p.club, value: "KS TIRANA", accent: true },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-paper">
        {/* Portrait fills the right half and fades into the page on its left edge. */}
        <div className="relative h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[56%]">
          {person.portrait ? (
            <ViewTransition name={`person-${person.discipline.slug}-${person.slug}`} share="morph" default="none">
              <MediaImage photo={person.portrait} alt={person.fullName} sizes="(min-width: 1024px) 56vw, 100vw" fill priority position="center 20%" />
            </ViewTransition>
          ) : (
            <div className="flex h-full items-center justify-center bg-surface">
              <Icon name="users" className="h-20 w-20 text-navy-700/20" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent lg:bg-gradient-to-r lg:from-paper lg:via-paper/40 lg:to-transparent" />
        </div>

        <div className="wrap relative py-8 lg:min-h-[560px] lg:py-10">
          <Breadcrumb
            items={[
              { label: dict.nav.home, href: `/${lang}` },
              { label: dict.nav.sports, href: `/${lang}/sportet` },
              { label: person.discipline.name, href: `/${lang}/sportet/${person.discipline.slug}` },
              { label: isCoach ? p.coachTitle : p.title },
            ]}
          />
          <Reveal className="mt-8 max-w-2xl lg:mt-10">
            <span className="rule" />
            <p className="display mt-5 text-3xl text-strong lg:text-[2.75rem]">{isCoach ? p.coachTitle : p.title}</p>
            <h1 className="display mt-2 text-5xl text-strong lg:text-[4.5rem]">{person.fullName}</h1>
            <p className="font-display mt-3 flex flex-wrap items-center gap-3 text-xl font-extrabold uppercase tracking-[0.3em] text-blue-500 lg:text-2xl">
              {person.discipline.name}
              {person.isCaptain && (
                <span className="rounded-sm bg-gold-400 px-2 py-0.5 text-xs tracking-wider text-navy-950">{t.captain}</span>
              )}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-bold text-strong">{p.bio}</h2>
                <p className={`mt-4 whitespace-pre-line leading-relaxed ${person.bio ? "text-ink/75" : "text-ink/50"}`}>
                  {person.bio ?? p.noBio}
                </p>
              </div>
              <div>
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-bold text-strong">{p.achievements}</h2>
                <ul className="mt-4 space-y-3 border-l border-line pl-4">
                  {(achievements.length > 0 ? achievements : ["–", "–", "–"]).map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ink/80">
                      <Icon name="trophy" className="h-5 w-5 shrink-0 text-blue-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Facts band */}
      <section className="bg-gradient-to-r from-navy-700 to-blue-600 text-white">
        <dl className="wrap grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4 lg:divide-x lg:divide-white/20">
          {facts.map((f) => (
            <div key={f.label} className="flex items-center gap-4 lg:px-8 lg:first:pl-0">
              <Icon name={f.icon} className="h-9 w-9 shrink-0" />
              <div>
                <dt className={`text-xs font-bold uppercase tracking-wider ${f.accent ? "text-sky-300" : "text-white"}`}>{f.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Latest media */}
      <section className="bg-paper py-12 lg:py-14">
        <div className="wrap">
          {photos.length > 0 ? (
            <PhotoGallery
              photos={photos}
              labels={t.lightbox}
              media={{ title: p.media, seeAll: p.seeAll, kind: p.photo, fallbackTitle: p.photoTitle }}
            />
          ) : (
            <>
              <span className="rule" />
              <h2 className="display mt-3 text-3xl text-strong lg:text-4xl">{p.media}</h2>
              <p className="mt-4 text-ink/55">{p.noMedia}</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
