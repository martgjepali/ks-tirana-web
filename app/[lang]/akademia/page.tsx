import type { Metadata } from "next";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { AcademyForm } from "@/components/AcademyForm";
import { getDisciplines } from "@/lib/data/sports";
import { getHeroPhoto, getPrograms } from "@/lib/data/site";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/akademia">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.academy.title} · KS Tirana`, description: dict.academy.subtitle };
}

export default async function AcademyPage({ params }: PageProps<"/[lang]/akademia">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, disciplines, programs, hero] = await Promise.all([
    getDictionary(lang),
    getDisciplines(lang),
    getPrograms(lang),
    getHeroPhoto(lang, "atletike", 2),
  ]);
  const a = dict.academy;
  const ages = (min: number | null, max: number | null) =>
    min !== null && max !== null
      ? a.ages.replace("{min}", String(min)).replace("{max}", String(max))
      : min !== null
        ? a.agesFrom.replace("{min}", String(min))
        : null;

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={dict.nav.academy}
        title={a.title}
        subtitle={a.subtitle}
      />

      <section className="bg-paper py-20 lg:py-24">
        <StaggerGroup className="wrap grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="trophy" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.programsTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.programsBody}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="clock" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.infoTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.infoBody}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="users" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.findTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.findBody}</p>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="wrap">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {a.programsTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            {programs.length > 0 ? (
              <ul className="overflow-hidden rounded-xl border border-line bg-white">
                {programs.map((p, i) => (
                  <li
                    key={p.slug}
                    className={`flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
                      i !== 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">{p.discipline.name}</p>
                      <p className="font-display mt-1 font-semibold text-ink">{p.name}</p>
                      {p.schedule && <p className="mt-0.5 whitespace-pre-line text-sm text-ink/60">{p.schedule}</p>}
                      {(p.coach || p.fee) && (
                        <p className="mt-1 text-sm text-ink/60">
                          {p.coach && <>{a.coach}: {p.coach}</>}
                          {p.coach && p.fee && " · "}
                          {p.fee && <>{a.fee}: {p.fee}</>}
                        </p>
                      )}
                    </div>
                    {ages(p.ageMin, p.ageMax) && (
                      <span className="w-fit shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-navy-800">
                        {ages(p.ageMin, p.ageMax)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="users" text={a.emptyPrograms} />
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-20 lg:py-24">
        <Reveal className="wrap wrap-narrow">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {a.formTitle}
          </h2>
          <p className="mt-2 text-ink/60">{a.formBody}</p>
          <div className="mt-8">
            <AcademyForm dict={dict} sports={disciplines.map(({ slug, name }) => ({ slug, name }))} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
