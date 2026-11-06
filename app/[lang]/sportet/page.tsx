import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export default async function SportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const items = dict.home.sports.items;

  return (
    <>
      <PageHero
        eyebrow={dict.home.sports.eyebrow}
        title={dict.sports.title}
        subtitle={dict.sports.subtitle}
      />

      <section className="bg-paper py-20 lg:py-24">
        <StaggerGroup className="wrap grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <StaggerItem key={s.name}>
              <div className="card-hover h-full overflow-hidden rounded-xl border border-line bg-white">
                <PhotoFrame
                  icon={s.icon as IconName}
                  variant={i % 3 === 0 ? "navy" : i % 3 === 1 ? "blue" : "light"}
                  label={s.name}
                  className="aspect-[16/10]"
                />
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/55">{s.teams}</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink/65">
                    <li className="flex items-center gap-2">
                      <Icon name="users" className="h-4 w-4 text-blue-500" />
                      {dict.sports.categories}
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="calendar" className="h-4 w-4 text-blue-500" />
                      {dict.sports.results}
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="trophy" className="h-4 w-4 text-blue-500" />
                      {dict.sports.history}
                    </li>
                  </ul>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal y={0}>
            <PhotoFrame
              icon="users"
              variant="navy"
              label={dict.sports.profileTitle}
              className="aspect-[4/5] rounded-2xl lg:order-last"
            />
          </Reveal>
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              {dict.sports.title}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink">
              {dict.sports.profileTitle}
            </h2>
            <p className="mt-4 text-ink/60">{dict.sports.profileBody}</p>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink/70">
              {[
                dict.sports.categories,
                dict.sports.staff,
                dict.sports.results,
                dict.sports.gallery,
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-lg border border-line bg-white px-3.5 py-2.5"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
