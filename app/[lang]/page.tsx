import Link from "next/link";
import Image from "next/image";
import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Photo, type PhotoName } from "@/components/Photo";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

const sportPhotos: PhotoName[] = [
  "sportBasketball",
  "sportVolleyball",
  "sportAthletics",
  "sportWrestling",
  "sportSwimming",
  "sportBoxing",
];

const newsPhotos: PhotoName[] = ["sportVolleyball", "academyTraining", "sportBasketball"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const h = dict.home;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <Photo name="heroVolleyball" alt="" priority sizes="100vw" fill />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,14,31,0.96) 20%, rgba(6,14,31,0.75) 48%, rgba(6,14,31,0.25) 75%), linear-gradient(0deg, rgba(6,14,31,0.9), transparent 45%)",
          }}
        />
        <div className="wrap relative flex min-h-[560px] flex-col justify-end py-16 lg:min-h-[680px] lg:py-20">
          <Reveal>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              {h.hero.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display mt-5 max-w-2xl text-5xl font-bold uppercase leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              {h.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 lg:text-lg">
              {h.hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link href={`/${lang}/akademia`} className="btn btn-primary">
                {h.hero.ctaPrimary}
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link href={`/${lang}/sportet`} className="btn btn-ghost-light">
                {h.hero.ctaSecondary}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-7">
              {h.hero.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl font-semibold text-white sm:text-4xl">
                    <Counter value={s.value} />
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-white/60">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <Image
          src="/images/Tirana_Club_Logo.svg.webp"
          alt=""
          width={120}
          height={190}
          className="pointer-events-none absolute right-6 top-6 hidden h-24 w-auto opacity-90 drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] sm:block lg:right-10 lg:top-10 lg:h-32"
        />
      </section>

      {/* NEWS + FIXTURE */}
      <section className="bg-paper py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-4">
          <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-3">
            {h.news.items.map((n, i) => (
              <StaggerItem key={n.title}>
                <Link
                  href={`/${lang}/lajme`}
                  className="card-hover group block h-full overflow-hidden rounded-xl border border-line bg-white"
                >
                  <Photo
                    name={newsPhotos[i]}
                    alt={n.title}
                    sizes="(min-width: 1024px) 24vw, 90vw"
                    className="aspect-[4/3]"
                  />
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                      {n.tag} · {n.date}
                    </p>
                    <h3 className="font-display mt-2 text-base font-semibold leading-snug text-ink">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-between rounded-xl bg-navy-950 p-6 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                  {h.calendar.next.label}
                </p>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Image
                      src="/images/Tirana_Club_Logo.svg.webp"
                      alt=""
                      width={36}
                      height={57}
                      className="h-9 w-auto"
                    />
                    <span className="text-xs font-semibold">KS Tirana</span>
                  </div>
                  <span className="font-display text-sm font-semibold text-white/40">
                    VS
                  </span>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                      <Icon name="shield" className="h-5 w-5 text-white/70" />
                    </span>
                    <span className="text-xs font-semibold">Partizani</span>
                  </div>
                </div>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-white/55">
                <Icon name="calendar" className="h-4 w-4" />
                {h.calendar.next.detail}
              </p>
              <Link
                href={`/${lang}/kalendari`}
                className="btn btn-ghost-light mt-5 justify-center"
              >
                {h.calendar.cta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SPORTS */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
                {h.sports.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {h.sports.title}
              </h2>
            </div>
            <Link
              href={`/${lang}/sportet`}
              className="link-underline hidden items-center gap-1.5 text-sm font-semibold text-navy-900 sm:inline-flex"
            >
              {h.sports.cta}
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </Reveal>

          <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {h.sports.items.map((s, i) => (
              <StaggerItem key={s.name}>
                <Link
                  href={`/${lang}/sportet`}
                  className="card-hover group relative block aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <Photo
                    name={sportPhotos[i]}
                    alt={s.name}
                    sizes="(min-width: 1024px) 16vw, 45vw"
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-white">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-white/60">{s.teams}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ACADEMY + SHOP PROMO */}
      <section className="bg-paper py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <Link
              href={`/${lang}/akademia`}
              className="card-hover group relative block aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]"
            >
              <Photo
                name="academyTraining"
                alt={h.academy.title}
                sizes="(min-width: 1024px) 48vw, 100vw"
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                  {h.academy.eyebrow}
                </p>
                <h3 className="font-display mt-2 max-w-xs text-2xl font-bold uppercase leading-tight text-white">
                  {h.academy.title}
                </h3>
                <span className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  {h.academy.cta}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href={`/${lang}/dyqani`}
              className="card-hover group relative block aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]"
            >
              <Photo
                name="shopFlatlay"
                alt={h.shop.title}
                sizes="(min-width: 1024px) 48vw, 100vw"
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                  {h.shop.eyebrow}
                </p>
                <h3 className="font-display mt-2 max-w-xs text-2xl font-bold uppercase leading-tight text-white">
                  {h.shop.title}
                </h3>
                <span className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  {h.shop.cta}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="wrap">
          <Reveal className="max-w-2xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              {h.why.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {h.why.title}
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.why.items.map((item, i) => (
              <StaggerItem key={item.title}>
                <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
                  <span className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-sm font-semibold text-blue-500">
                    0{i + 1}
                  </span>
                  <h3 className="font-display mt-4 text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {item.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CLUB */}
      <section className="bg-paper py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              {h.club.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {h.club.title}
            </h2>
            <p className="mt-4 text-ink/60">{h.club.body}</p>
            <Link href={`/${lang}/klubi`} className="btn btn-ghost mt-8">
              {h.club.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal y={0}>
            <Photo
              name="clubHistoryHero"
              alt={h.club.title}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="aspect-[4/3] rounded-2xl"
            />
          </Reveal>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="relative overflow-hidden bg-navy-950 py-16 text-white lg:py-20">
        <div className="blob -left-20 top-10 h-[320px] w-[320px] bg-gold-500/15" />
        <div className="wrap relative flex flex-col items-center gap-6 text-center">
          <Icon name="handshake" className="h-8 w-8 text-gold-400" />
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
              {h.partners.eyebrow}
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
              {h.partners.title}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              {h.partners.body}
            </p>
            <Link href={`/${lang}/kontakt`} className="btn btn-primary mt-7">
              {h.partners.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
