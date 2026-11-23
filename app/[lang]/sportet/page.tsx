import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getDisciplines } from "@/lib/data/sports";
import { sportIcon } from "@/lib/sport-icons";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { ViewTransition } from "react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/sportet">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.sports.title} · KS Tirana`, description: dict.sports.subtitle };
}

export default async function SportsPage({ params }: PageProps<"/[lang]/sportet">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, disciplines] = await Promise.all([getDictionary(lang), getDisciplines(lang)]);
  const t = dict.sports;
  const hero = disciplines.find((d) => d.cover)?.cover;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {hero && <MediaImage photo={hero} alt="" sizes="100vw" fill priority position="center 35%" className="hero-media" />}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,14,31,0.96) 25%, rgba(6,14,31,0.7) 55%, rgba(6,14,31,0.25) 85%)",
          }}
        />
        <div className="wrap relative flex min-h-[380px] flex-col justify-end py-14 lg:min-h-[440px]">
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
              {t.eyebrow}
            </p>
            <h1 className="font-display mt-3 max-w-xl text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-md text-white/70">{t.subtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-20">
        <StaggerGroup className="wrap grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d, i) => (
            <StaggerItem key={d.slug}>
              <div className="reveal">
              <Link
                href={`/${lang}/sportet/${d.slug}`}
                className="card-hover group relative block aspect-[4/3] overflow-hidden rounded-xl bg-navy-900"
              >
                {d.cover && (
                  // Same name as the discipline page hero: the photo morphs into it.
                  <ViewTransition name={`disc-${d.slug}`} share="morph" default="none">
                    <MediaImage
                      photo={d.cover}
                      alt=""
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                      fill
                      priority={i < 3}
                    />
                  </ViewTransition>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">{d.name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
                      <span className="flex items-center gap-1.5">
                        <Icon name={sportIcon(d.slug)} className="h-3.5 w-3.5" />
                        {d.peopleCount > 0 ? `${d.peopleCount} ${t.members.toLowerCase()}` : t.eyebrow}
                      </span>
                      {d.photoCount > 0 && (
                        <span>
                          {d.photoCount} {t.photos.toLowerCase()}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-blue-500">
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
