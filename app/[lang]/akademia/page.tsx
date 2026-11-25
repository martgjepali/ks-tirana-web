import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { AcademyForm } from "@/components/AcademyForm";
import { MediaImage } from "@/components/MediaImage";
import { roleLabel } from "@/components/PersonCard";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { getCoaches, getDisciplines } from "@/lib/data/sports";
import { getHeroPhoto, getPrograms } from "@/lib/data/site";
import type { PhotoRef } from "@/lib/data/photos";
import { SPORT_GROUPS } from "@/lib/sport-groups";

export async function generateMetadata({ params }: PageProps<"/[lang]/akademia">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.academy} · KS Tirana`, description: dict.academy.hero.subtitle };
}

const VALUE_ICONS: IconName[] = ["users", "chart", "trophy"];

/** "AKADEMIA" — client proposal, slide 07/10. */
export default async function AcademyPage({ params }: PageProps<"/[lang]/akademia">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, disciplines, programs, coaches, hero] = await Promise.all([
    getDictionary(lang),
    getDisciplines(lang),
    getPrograms(lang),
    getCoaches(lang, 4),
    getHeroPhoto(lang, "basketboll-meshkuj", 4),
  ]);
  const a = dict.academy;
  const cardLabels = {
    headCoach: dict.sports.headCoach,
    assistantCoach: dict.sports.assistantCoach,
    athlete: dict.sports.athlete,
    captain: dict.sports.captain,
  };
  const ages = (min: number | null, max: number | null) =>
    min !== null && max !== null
      ? a.programs.ages.replace("{min}", String(min)).replace("{max}", String(max))
      : min !== null
        ? a.programs.agesFrom.replace("{min}", String(min))
        : null;

  // Programme cards; until the club publishes programmes, one card per sport.
  const cards: { key: string; title: string; sub: string | null; href: string; photo: PhotoRef | null }[] =
    programs.length > 0
      ? programs.map((p) => ({
          key: p.slug,
          title: p.name,
          sub: ages(p.ageMin, p.ageMax),
          href: `#program-${p.slug}`,
          photo: p.cover,
        }))
      : SPORT_GROUPS.map((g) => {
          const own = disciplines.filter((d) => g.slugs.includes(d.slug));
          return {
            key: g.key,
            title: g.name[lang],
            sub: null,
            href: own.length === 1 ? `/${lang}/sportet/${own[0].slug}` : `/${lang}/sportet?sport=${g.key}`,
            photo: own.find((d) => d.cover)?.cover ?? null,
          };
        }).filter((c) => c.photo);
  const wide = cards.length <= 2;

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={a.hero.eyebrow.join(" • ")}
        title={a.hero.title}
        body={a.hero.subtitle}
        script={a.hero.script}
        size="lg"
      >
        <Link href="#apliko" className="btn btn-primary">
          {a.hero.cta}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </PhotoPageHero>

      {/* Choose your age group */}
      <section className="bg-surface py-10 lg:py-12">
        <div className="wrap">
          <Reveal>
            <h2 className="display text-3xl text-strong lg:text-[2.6rem]">{a.groups.title}</h2>
            <p className="mt-2 text-ink/70">{a.groups.subtitle}</p>
          </Reveal>
          <StaggerGroup className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${wide ? "" : "lg:grid-cols-4"}`}>
            {cards.map((c) => (
              <StaggerItem key={c.key}>
                <Link
                  href={c.href}
                  className={`group relative block overflow-hidden rounded-sm bg-navy-900 text-white ${wide ? "aspect-[16/5]" : "aspect-[16/10]"}`}
                >
                  {c.photo && <MediaImage photo={c.photo} alt="" sizes={wide ? "50vw" : "(min-width: 1024px) 25vw, 50vw"} fill position="center 30%" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="display text-2xl lg:text-3xl">{c.title}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/90">
                      {c.sub && <span>{c.sub} ·</span>}
                      {a.groups.program}
                      <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Our coaches */}
      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:items-center">
          <Reveal>
            <p className="eyebrow text-blue-500">{a.coaches.eyebrow}</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold leading-tight text-strong lg:text-[2.2rem]">
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
                      <MediaImage photo={c.portrait} alt="" sizes="(min-width: 1024px) 16vw, 45vw" className="aspect-[16/10]" position="center 20%" />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-surface">
                        <Icon name="users" className="h-10 w-10 text-navy-700/25" />
                      </div>
                    )}
                    <p className="mt-2 text-sm font-bold text-strong group-hover:text-blue-500">
                      {roleLabel(c, cardLabels)} · {c.disciplineName}
                    </p>
                    <p className="text-sm text-ink/60">{c.fullName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-line bg-surface px-6 py-10 text-center text-ink/60">{a.coaches.empty}</p>
          )}
        </div>
      </section>

      {/* Values band */}
      <section className="bg-blue-600 text-white">
        <ul className="wrap grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          {a.values.map((v, i) => (
            <li key={v.title} className="flex items-center gap-4 sm:justify-center">
              <Icon name={VALUE_ICONS[i]} className="h-9 w-9 shrink-0" />
              <div>
                <p className="font-bold">{v.title}</p>
                <p className="text-sm text-white/80">{v.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Practical information (published programmes) */}
      {programs.length > 0 && (
        <section className="bg-paper py-12 lg:py-14">
          <div className="wrap">
            <h2 className="section-label">{a.programs.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{a.programs.body}</p>
            <ul className="mt-6 overflow-hidden rounded-md border border-line bg-card">
              {programs.map((p, i) => (
                <li
                  key={p.slug}
                  id={`program-${p.slug}`}
                  className={`flex scroll-mt-28 flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${i !== 0 ? "border-t border-line" : ""}`}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-500">{p.discipline.name}</p>
                    <p className="font-display mt-1 font-bold text-strong">{p.name}</p>
                    {p.schedule && <p className="mt-0.5 whitespace-pre-line text-sm text-ink/60">{p.schedule}</p>}
                    {(p.coach || p.fee) && (
                      <p className="mt-1 text-sm text-ink/60">
                        {p.coach && <>{a.programs.coach}: {p.coach}</>}
                        {p.coach && p.fee && " · "}
                        {p.fee && <>{a.programs.fee}: {p.fee}</>}
                      </p>
                    )}
                  </div>
                  {ages(p.ageMin, p.ageMax) && (
                    <span className="w-fit shrink-0 rounded-sm bg-surface px-3 py-1 text-xs font-bold text-strong">{ages(p.ageMin, p.ageMax)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Apply */}
      <section id="apliko" className="scroll-mt-28 bg-surface py-14 lg:py-16">
        <Reveal className="wrap wrap-narrow">
          <h2 className="display text-3xl text-strong lg:text-4xl">{a.formTitle}</h2>
          <p className="mt-3 text-ink/70">{a.formBody}</p>
          <div className="mt-8 rounded-md border border-line bg-card p-6 lg:p-8">
            <AcademyForm dict={dict} sports={disciplines.map(({ slug, name }) => ({ slug, name }))} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
