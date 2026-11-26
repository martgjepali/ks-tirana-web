import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { AcademyPrograms } from "@/components/AcademyPrograms";
import { MediaImage } from "@/components/MediaImage";
import { roleLabel } from "@/components/PersonCard";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { getCoaches, getDisciplines } from "@/lib/data/sports";
import { getHeroPhoto, getPrograms } from "@/lib/data/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/akademia">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.academy} · KS Tirana`, description: dict.academy.hero.subtitle };
}

const VALUE_ICONS: IconName[] = ["users", "chart", "trophy"];

/** "AKADEMIA" — client's final design, page 24. */
export default async function AcademyPage({ params }: PageProps<"/[lang]/akademia">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, programs, coaches, hero, disciplines] = await Promise.all([
    getDictionary(lang),
    getPrograms(lang),
    getCoaches(lang, 4),
    getHeroPhoto(lang, "basketboll-meshkuj", 4),
    getDisciplines(lang),
  ]);
  // A programme without its own wide photo falls back to its discipline cover.
  const coverOf = (slug: string) => disciplines.find((d) => d.slug === slug)?.cover ?? null;
  const a = dict.academy;
  const cardLabels = {
    headCoach: dict.sports.headCoach,
    assistantCoach: dict.sports.assistantCoach,
    athlete: dict.sports.athlete,
    captain: dict.sports.captain,
  };

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={a.hero.eyebrow.join(" • ")}
        title={a.hero.title}
        body={a.hero.subtitle}
        script={a.hero.script}
        size="md"
      >
        <Link href={`/${lang}/akademia/apliko`} className="btn btn-primary !normal-case !tracking-normal !text-base">
          {a.hero.cta}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </PhotoPageHero>

      {/* Discover your passion */}
      <section className="bg-[#eef3fa] py-8 lg:py-10 [:root[data-theme=dark]_&]:bg-surface">
        <div className="wrap">
          <AcademyPrograms
            lang={lang}
            title={a.discover.title}
            subtitle={a.discover.subtitle}
            agesLabel={a.discover.ages}
            ageGroups={a.discover.ageGroups}
            programs={programs.map((p) => ({ slug: p.slug, name: p.name, photo: p.cover ?? coverOf(p.discipline.slug) }))}
          />
        </div>
      </section>

      {/* Our coaches */}
      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:items-center">
          <Reveal>
            <p className="eyebrow text-[0.6875rem] text-ink/60">{a.coaches.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-strong lg:text-[2.1rem]">
              {a.coaches.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{a.coaches.body}</p>
            <Link href={`/${lang}/sportet`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-500 underline underline-offset-4">
              {a.coaches.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
          {coaches.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {coaches.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="group block">
                    {c.portrait ? (
                      <MediaImage photo={c.portrait} alt="" sizes="(min-width: 1024px) 16vw, 45vw" className="aspect-[16/11]" position="center 20%" />
                    ) : (
                      <div className="flex aspect-[16/11] items-center justify-center bg-[#eef3fa] [:root[data-theme=dark]_&]:bg-surface">
                        <Icon name="users" className="h-10 w-10 text-navy-700/25" />
                      </div>
                    )}
                    <p className="mt-2 text-xs text-ink/60">{c.disciplineName}</p>
                    <p className="font-bold text-strong group-hover:text-blue-500">{c.fullName}</p>
                    <p className="text-xs text-ink/60">{roleLabel(c, cardLabels)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bg-surface px-6 py-10 text-center text-ink/60">{a.coaches.empty}</p>
          )}
        </div>
      </section>

      {/* Values band */}
      <section className="bg-navy-900 text-white">
        <ul className="wrap grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          {a.values.map((v, i) => (
            <li key={v.title} className="flex items-center gap-4 sm:justify-center">
              <Icon name={VALUE_ICONS[i]} className="h-9 w-9 shrink-0 text-sky-300" />
              <div>
                <p className="font-bold">{v.title}</p>
                <p className="text-sm text-white/75">{v.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
