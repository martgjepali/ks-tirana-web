import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getDisciplines } from "@/lib/data/sports";
import { getHeroPhoto } from "@/lib/data/site";
import { sportIcon } from "@/lib/sport-icons";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/sportet">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.sports.hero.title} · KS Tirana`, description: dict.sports.hero.subtitle };
}

/** Tile names as in the design: "Volejboll femra" → "Volejboll për femra". */
const tileName = (name: string) => name.replace(/^(Volejboll|Basketboll) (femra|meshkuj)$/i, "$1 për $2");

/** "DISIPLINAT" — client's final design, page 02 (tiles with a hover effect). */
export default async function SportsPage({ params }: PageProps<"/[lang]/sportet">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, disciplines, hero] = await Promise.all([getDictionary(lang), getDisciplines(lang), getHeroPhoto(lang, "atletike", 1)]);

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="grid grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal className="px-6 py-12 lg:py-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+6rem))]">
            <h1 className="display text-6xl lg:text-[5.5rem]">{dict.sports.hero.title}</h1>
          </Reveal>
          {hero && (
            <div className="px-4 pb-4 lg:py-3 lg:pl-0 lg:pr-[max(1rem,calc((100vw-1360px)/2+1rem))]">
              <MediaImage photo={hero} alt="" sizes="(min-width: 1024px) 50vw, 100vw" priority className="aspect-[16/5]" position="center 30%" />
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-8 lg:py-10">
        <StaggerGroup className="wrap grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {disciplines.map((d, i) => (
            <StaggerItem key={d.slug}>
              <Link
                href={`/${lang}/sportet/${d.slug}`}
                className="group block overflow-hidden bg-navy-900 shadow-[0_1px_0_rgba(2,31,72,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                {d.cover ? (
                  <MediaImage
                    photo={d.cover}
                    alt=""
                    sizes="(min-width: 1024px) 19vw, (min-width: 640px) 32vw, 48vw"
                    className="aspect-[2.6/1] [&_img]:duration-500 group-hover:[&_img]:scale-110"
                    position="center 30%"
                    priority={i < 5}
                  />
                ) : (
                  <div className="flex aspect-[2.6/1] items-center justify-center bg-navy-800">
                    <Icon name={sportIcon(d.slug)} className="h-10 w-10 text-white/30 transition duration-500 group-hover:scale-110 group-hover:text-white/60" />
                  </div>
                )}
                <p className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-[1.05rem] font-bold text-white transition-colors duration-300 group-hover:bg-blue-500">
                  <span className="truncate">{lang === "sq" ? tileName(d.name) : d.name}</span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
