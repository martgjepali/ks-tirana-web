import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { Photo, type PhotoName } from "@/components/Photo";
import { Icon, type IconName } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

const sportPhotos: PhotoName[] = [
  "sportBasketball",
  "sportVolleyball",
  "sportAthletics",
  "sportWrestling",
  "sportSwimming",
  "sportBoxing",
];

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
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <Photo name="sportAthletics" alt="" priority sizes="100vw" fill />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,14,31,0.96) 25%, rgba(6,14,31,0.7) 55%, rgba(6,14,31,0.2) 85%)",
          }}
        />
        <div className="wrap relative flex min-h-[380px] flex-col justify-end py-14 lg:min-h-[440px]">
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
              {dict.home.sports.eyebrow}
            </p>
            <h1 className="font-display mt-3 max-w-xl text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
              {dict.sports.title}
            </h1>
            <p className="mt-4 max-w-md text-white/65">{dict.sports.subtitle}</p>
          </Reveal>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-paper py-16 lg:py-20">
        <StaggerGroup className="wrap grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <StaggerItem key={s.name}>
              <Link
                href={`/${lang}/sportet`}
                className="card-hover group relative block aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Photo
                  name={sportPhotos[i]}
                  alt={s.name}
                  sizes="(min-width: 1024px) 32vw, 90vw"
                  fill
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
                      {s.name}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-white/60">
                      <Icon name={s.icon as IconName} className="h-3.5 w-3.5" />
                      {s.teams}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-blue-500">
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ACADEMY PROMO */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="wrap">
          <Reveal>
            <Link
              href={`/${lang}/akademia`}
              className="card-hover group relative block overflow-hidden rounded-2xl"
            >
              <Photo
                name="academyTraining"
                alt={dict.home.academy.title}
                sizes="100vw"
                className="aspect-[21/9]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(6,14,31,0.95) 30%, rgba(6,14,31,0.5) 60%, transparent 90%)",
                }}
              />
              <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-8 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                  {dict.home.academy.eyebrow}
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
                  {dict.home.academy.title}
                </h2>
                <span className="link-underline mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white">
                  {dict.home.academy.cta}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PROFILE TEASER */}
      <section className="bg-paper py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal y={0}>
            <Photo
              name="athletePortrait"
              alt={dict.sports.profileTitle}
              sizes="(min-width: 1024px) 40vw, 100vw"
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
                  className="rounded-lg border border-line bg-surface px-3.5 py-2.5"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-paper py-12">
        <div className="wrap grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4">
          {[
            { icon: "users" as const, label: dict.sports.categories },
            { icon: "trophy" as const, label: dict.sports.history },
            { icon: "calendar" as const, label: dict.sports.results },
            { icon: "shield" as const, label: dict.sports.gallery },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <Icon name={s.icon} className="h-5 w-5 shrink-0 text-blue-500" />
              <span className="text-sm text-ink/70">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
