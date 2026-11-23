import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getDiscipline, getPhotos } from "@/lib/data/sports";
import { sportIcon } from "@/lib/sport-icons";
import { MediaImage } from "@/components/MediaImage";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PersonCard } from "@/components/PersonCard";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

const PAGE = 24;

export async function generateMetadata({ params }: PageProps<"/[lang]/sportet/[discipline]">): Promise<Metadata> {
  const { lang, discipline: slug } = await params;
  if (!hasLocale(lang)) return {};
  const discipline = await getDiscipline(slug, lang);
  if (!discipline) return {};
  return {
    title: `${discipline.name} · KS Tirana`,
    description: discipline.description?.slice(0, 160) ?? undefined,
    openGraph: discipline.cover ? { images: [{ url: discipline.cover.large }] } : undefined,
  };
}

export default async function DisciplinePage({ params, searchParams }: PageProps<"/[lang]/sportet/[discipline]">) {
  const { lang, discipline: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, discipline] = await Promise.all([getDictionary(lang), getDiscipline(slug, lang)]);
  if (!discipline) notFound();
  const t = dict.sports;

  const requested = Number((await searchParams).foto);
  const shown = Math.min(
    discipline.photoCount,
    Number.isInteger(requested) && requested > PAGE ? Math.min(requested, 1000) : PAGE,
  );
  const photos = await getPhotos({ disciplineId: discipline.id }, lang, shown);
  const base = `/${lang}/sportet/${discipline.slug}`;
  const facts = [
    { label: t.ageGroups, value: discipline.ageGroups, icon: "users" as const },
    { label: t.schedule, value: discipline.schedule, icon: "clock" as const },
    { label: t.venue, value: discipline.venue, icon: "pin" as const },
    { label: t.achievements, value: discipline.achievements, icon: "trophy" as const },
  ].filter((f) => f.value);
  const cardLabels = { headCoach: t.headCoach, assistantCoach: t.assistantCoach, athlete: t.athlete, captain: t.captain };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {discipline.cover && (
          <MediaImage photo={discipline.cover} alt="" sizes="100vw" fill priority position="center 35%" />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,14,31,0.95) 22%, rgba(6,14,31,0.65) 55%, rgba(6,14,31,0.15) 90%), linear-gradient(0deg, rgba(6,14,31,0.85), transparent 50%)",
          }}
        />
        <div className="wrap relative flex min-h-[420px] flex-col justify-end py-14 lg:min-h-[520px]">
          <Reveal>
            <Link
              href={`/${lang}/sportet`}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
            >
              <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
              {t.allSports}
            </Link>
            <h1 className="font-display mt-4 flex items-center gap-4 text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
              <Icon name={sportIcon(discipline.slug)} className="h-10 w-10 shrink-0 text-sky-300 lg:h-12 lg:w-12" />
              {discipline.name}
            </h1>
            <dl className="mt-8 flex gap-10 border-t border-white/15 pt-6">
              {discipline.peopleCount > 0 && (
                <div>
                  <dd className="font-display text-3xl font-semibold">{discipline.peopleCount}</dd>
                  <dt className="mt-1 text-xs text-white/60">{t.members}</dt>
                </div>
              )}
              <div>
                <dd className="font-display text-3xl font-semibold">{discipline.photoCount}</dd>
                <dt className="mt-1 text-xs text-white/60">{t.photos}</dt>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-paper py-14 lg:py-16">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{t.about}</h2>
            <p className={`mt-4 max-w-2xl whitespace-pre-line leading-relaxed ${discipline.description ? "text-ink/75" : "text-ink/50"}`}>
              {discipline.description ?? t.noDescription}
            </p>
          </div>
          {facts.length > 0 && (
            <dl className="space-y-4 rounded-xl border border-line bg-surface p-6">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <Icon name={f.icon} className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink/50">{f.label}</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm text-ink/80">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* PEOPLE */}
      {(discipline.coaches.length > 0 || discipline.athletes.length > 0) && (
        <section className="bg-surface py-14 lg:py-16">
          <div className="wrap space-y-12">
            {discipline.coaches.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{t.coaches}</h2>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {discipline.coaches.map((p) => (
                    <li key={p.slug}>
                      <PersonCard person={p} href={`${base}/${p.slug}`} labels={cardLabels} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{t.athletes}</h2>
              {discipline.athletes.length > 0 ? (
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {discipline.athletes.map((p) => (
                    <li key={p.slug}>
                      <PersonCard person={p} href={`${base}/${p.slug}`} labels={cardLabels} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-ink/50">{t.emptyRoster}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY */}
      <section id="galeria" className="scroll-mt-24 bg-paper py-14 lg:py-16">
        <div className="wrap">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{t.gallery}</h2>
            {discipline.photoCount > 0 && (
              <p className="text-sm text-ink/50">
                {t.showing.replace("{shown}", String(photos.length)).replace("{total}", String(discipline.photoCount))}
              </p>
            )}
          </div>
          <div className="mt-6">
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} labels={t.lightbox} />
            ) : (
              <p className="text-ink/50">{t.emptyGallery}</p>
            )}
          </div>
          {shown < discipline.photoCount && (
            <div className="mt-8 flex justify-center">
              <Link href={`${base}?foto=${shown + PAGE}#galeria`} scroll={false} className="btn btn-ghost">
                {t.showMore}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
