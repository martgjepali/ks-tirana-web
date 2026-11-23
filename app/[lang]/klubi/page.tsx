import type { Metadata } from "next";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { getHeroPhoto, getShowcasePhotos } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export async function generateMetadata({ params }: PageProps<"/[lang]/klubi">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.club.title} · KS Tirana`, description: dict.club.subtitle };
}

/** One curated portrait-style shot from each of these teams for the gallery strip. */
const GALLERY_FROM = ["basketboll-femra", "volejboll-femra", "atletike", "basketboll-meshkuj"];

export default async function ClubPage({ params }: PageProps<"/[lang]/klubi">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hero, [history], [quoteBg], ...gallerySets] = await Promise.all([
    getDictionary(lang),
    getHeroPhoto(lang, "mundje-e-lire"),
    getShowcasePhotos(lang, { discipline: "volejboll-meshkuj", orientation: "landscape" }),
    getShowcasePhotos(lang, { discipline: "basketboll-femra", orientation: "landscape" }),
    ...GALLERY_FROM.map((discipline) => getShowcasePhotos(lang, { discipline, orientation: "portrait" })),
  ]);
  const gallery = gallerySets.flat();
  const c = dict.club;

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={dict.nav.club}
        title={c.title}
        subtitle={c.subtitle}
      />

      {/* History */}
      <section className="bg-paper py-20 lg:py-24">
        <div className="wrap reveal grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {c.historyTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-ink/65">{c.historyBody}</p>
          </Reveal>
          {history && (
            <Reveal y={0}>
              <MediaImage
                photo={history}
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="aspect-[4/3] rounded-2xl"
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-surface py-20 lg:py-24">
        <div className="wrap reveal">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {c.missionTitle}
            </h2>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {c.mission.map((m) => (
              <StaggerItem key={m.title}>
                <div className="card-hover h-full rounded-xl border border-line bg-card p-6">
                  <h3 className="font-display text-base font-semibold text-ink">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {m.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Trophies */}
      <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-24">
        <div className="blob -right-24 -top-24 h-[340px] w-[340px] bg-gold-500/15" />
        <div className="wrap reveal relative">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold">
              {c.trophiesTitle}
            </h2>
          </Reveal>
          <StaggerGroup className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {c.trophies.map((t) => (
              <StaggerItem key={t.label}>
                <p className="font-display text-3xl font-semibold text-sky-300 sm:text-4xl">
                  <Counter value={t.value} />
                </p>
                <p className="mt-1 text-sm text-white/55">{t.label}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Org chart */}
      <section className="bg-paper py-20 lg:py-24">
        <div className="wrap reveal">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {c.orgTitle}
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">{c.orgBody}</p>
          </Reveal>
          <StaggerGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.org.map((o, i) => (
              <StaggerItem key={o.role}>
                <div className="card-hover relative h-full rounded-xl border border-line bg-card p-5">
                  {i > 0 && (
                    <span className="absolute -left-4 top-1/2 hidden h-px w-4 bg-line lg:block" />
                  )}
                  <Icon name="shield" className="h-6 w-6 text-blue-500" />
                  <p className="font-display mt-3 text-sm font-semibold text-ink">
                    {o.role}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">{o.name}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Legends */}
      <section className="bg-surface py-20 lg:py-24">
        <div className="wrap reveal">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {c.legendsTitle}
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">{c.legendsBody}</p>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallery.map((p) => (
              <StaggerItem key={p.id}>
                <MediaImage
                  photo={p}
                  sizes="(min-width: 1024px) 23vw, 45vw"
                  className="aspect-[4/5] rounded-xl"
                  position="center 25%"
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Quote CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-24">
        {quoteBg && <MediaImage photo={quoteBg} alt="" sizes="100vw" className="opacity-30" fill />}
        <div className="wrap reveal relative text-center">
          <Reveal>
            <p className="font-display mx-auto max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl">
              &ldquo;{c.quote}&rdquo;
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
