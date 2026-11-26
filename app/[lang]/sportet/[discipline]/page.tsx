import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getDiscipline, getGalleryGroups, getPhotos } from "@/lib/data/sports";
import { groupOf, isTeamSport } from "@/lib/sport-groups";
import type { PhotoRef } from "@/lib/data/photos";
import { MediaImage } from "@/components/MediaImage";
import { PhotoGallery } from "@/components/PhotoGallery";
import { roleLabel } from "@/components/PersonCard";
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

/**
 * "Faqja e ekipit" — client's final design, pages 03 and 05–23: hero, Ekipi / Galeria
 * tabs, technical staff, players (a name grid for teams and larger squads, photo
 * cards for small ones) and the three gallery groups.
 */
export default async function TeamPage({ params, searchParams }: PageProps<"/[lang]/sportet/[discipline]">) {
  const { lang, discipline: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, discipline] = await Promise.all([getDictionary(lang), getDiscipline(slug, lang)]);
  if (!discipline) notFound();
  const sp = await searchParams;
  const galleryTab = sp.tab === "galeria";
  const t = dict.team;
  const base = `/${lang}/sportet/${discipline.slug}`;
  const cardLabels = {
    headCoach: dict.sports.headCoach,
    assistantCoach: dict.sports.assistantCoach,
    athlete: dict.sports.athlete,
    captain: dict.sports.captain,
  };

  const requested = Number(sp.foto);
  const shown = Math.min(discipline.photoCount, Number.isInteger(requested) && requested > PAGE ? Math.min(requested, 1000) : PAGE);
  const [groups, photos] = await Promise.all([
    getGalleryGroups(discipline.id, lang),
    galleryTab ? getPhotos({ disciplineId: discipline.id }, lang, shown) : Promise.resolve([] as PhotoRef[]),
  ]);
  const team = isTeamSport(discipline.slug);
  const asCards = !team && discipline.athletes.length <= 5;
  const tiles: { title: string; photos: PhotoRef[] }[] = [
    { title: t.galleryCats[0], photos: groups.team },
    { title: t.galleryCats[1], photos: groups.portraits },
    { title: t.galleryCats[2], photos: groups.action },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Reveal className="px-6 flex flex-col justify-center py-10 lg:py-14 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
              <Link href={`/${lang}/sportet`} className="hover:text-white">
                {t.eyebrow}
              </Link>{" "}
              / {groupOf(discipline.slug).name[lang]}
            </p>
            <h1 className="display mt-5 text-5xl normal-case lg:text-[4.25rem]">{discipline.name}</h1>
            <p className="mt-5 text-lg text-white/90">{t.subtitle}</p>
          </Reveal>
          <div className="px-4 pb-4 lg:py-3 lg:pl-0 lg:pr-[max(1rem,calc((100vw-1360px)/2+1rem))]">
            {discipline.cover ? (
              <MediaImage photo={discipline.cover} alt="" sizes="(min-width: 1024px) 45vw, 100vw" priority className="aspect-[16/8] h-full" position="center 30%" />
            ) : (
              <div className="flex aspect-[16/8] h-full items-center justify-center bg-navy-700 text-2xl font-bold">{t.teamPhoto}</div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="bg-[#eef3fa] [:root[data-theme=dark]_&]:bg-surface" aria-label={discipline.name}>
        <div className="wrap flex gap-14 py-3.5 text-lg font-bold">
          <Link href={base} aria-current={galleryTab ? undefined : "page"} className={galleryTab ? "text-strong hover:text-blue-500" : "text-blue-500"}>
            {t.tabs.team}
          </Link>
          <Link
            href={`${base}?tab=galeria`}
            aria-current={galleryTab ? "page" : undefined}
            className={galleryTab ? "text-blue-500" : "text-strong hover:text-blue-500"}
          >
            {t.tabs.gallery}
          </Link>
        </div>
      </nav>

      {galleryTab ? (
        <section className="bg-paper py-10 lg:py-12">
          <div className="wrap">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-extrabold text-strong">{t.gallery}</h2>
              {discipline.photoCount > 0 && (
                <p className="text-sm text-ink/55">
                  {dict.sports.detail.showing.replace("{shown}", String(photos.length)).replace("{total}", String(discipline.photoCount))}
                </p>
              )}
            </div>
            <div className="mt-6">
              {photos.length > 0 ? (
                <PhotoGallery photos={photos} labels={dict.sports.lightbox} />
              ) : (
                <p className="bg-[#eef3fa] px-6 py-14 text-center text-ink/60">{t.photoSpace}</p>
              )}
            </div>
            {shown < discipline.photoCount && (
              <div className="mt-8 flex justify-center">
                <Link href={`${base}?tab=galeria&foto=${shown + PAGE}`} scroll={false} className="btn btn-ghost">
                  {dict.sports.detail.showMore}
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Staff + roster */}
          <section className="bg-paper pb-6 pt-10 lg:pt-12">
            <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.7fr)]">
              <div>
                <h2 className="text-3xl font-extrabold text-strong">{t.staff}</h2>
                {discipline.coaches.length > 0 ? (
                  <ul className="mt-4 space-y-5">
                    {discipline.coaches.map((c) => (
                      <li key={c.slug}>
                        <Link href={`${base}/${c.slug}`} className="text-xl font-bold text-strong hover:text-blue-500">
                          {c.fullName}
                        </Link>
                        <p className="text-ink/60">{roleLabel(c, cardLabels)}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-ink/55">{t.emptyStaff}</p>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-strong">{team ? t.players : t.athletes}</h2>
                {discipline.athletes.length === 0 ? (
                  <p className="mt-4 text-ink/55">{t.emptyRoster}</p>
                ) : asCards ? (
                  <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {discipline.athletes.map((a) => (
                      <li key={a.slug}>
                        <Link href={`${base}/${a.slug}`} className="group block h-full bg-[#eef3fa] p-3 transition hover:bg-blue-500 hover:text-white [:root[data-theme=dark]_&]:bg-surface">
                          {a.portrait ? (
                            <MediaImage photo={a.portrait} alt="" sizes="(min-width: 1024px) 14vw, 45vw" className="aspect-[4/3]" position="center 20%" />
                          ) : (
                            <div className="flex aspect-[4/3] items-center bg-[#dde7f7] px-3 text-sm text-ink/60 group-hover:bg-white/20 group-hover:text-white [:root[data-theme=dark]_&]:bg-surface-2">
                              {t.profilePhoto}
                            </div>
                          )}
                          <p className="mt-3 font-bold text-strong group-hover:text-white">{a.fullName}</p>
                          <p className="mt-1 text-xs font-semibold text-blue-500 group-hover:text-white">{t.viewProfile} ↗</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {discipline.athletes.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`${base}/${a.slug}`}
                          className="block bg-[#eef3fa] px-4 py-2 text-lg font-bold text-strong transition hover:bg-blue-500 hover:text-white [:root[data-theme=dark]_&]:bg-surface"
                        >
                          {a.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Gallery groups */}
          <section className="bg-paper pb-12 pt-6 lg:pb-14">
            <div className="wrap">
              <h2 className="text-3xl font-extrabold text-strong">{t.gallery}</h2>
              <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                {tiles.map((tile) => (
                  <li key={tile.title}>
                    <Link href={`${base}?tab=galeria`} className="group block">
                      {tile.photos.length > 0 ? (
                        <div className="grid h-36 grid-cols-3 gap-1 overflow-hidden">
                          {[0, 1, 2].map((i) => {
                            const photo = tile.photos[i] ?? tile.photos[0];
                            return (
                              <MediaImage
                                key={i}
                                photo={photo}
                                alt=""
                                sizes="(min-width: 768px) 11vw, 33vw"
                                className="h-full [&_img]:duration-500 group-hover:[&_img]:scale-105"
                                position="center 30%"
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-36 items-start bg-[#eef3fa] p-6 text-ink/60 [:root[data-theme=dark]_&]:bg-surface">{t.photoSpace}</div>
                      )}
                      <p className="bg-navy-900 px-6 py-3 text-lg font-bold text-white transition-colors group-hover:bg-blue-500">{tile.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </>
  );
}
