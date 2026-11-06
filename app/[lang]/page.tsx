import Link from "next/link";
import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";
import { Hero3D } from "@/components/Hero3D";
import { Icon, type IconName } from "@/components/Icons";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

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
        <div className="blob -left-32 -top-32 h-[420px] w-[420px] bg-blue-600/35" />
        <div className="blob -right-40 top-24 h-[380px] w-[380px] bg-gold-500/15" />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 560px at 85% -10%, rgba(29,90,230,0.3), transparent 60%), radial-gradient(800px 440px at 0% 115%, rgba(21,44,98,0.65), transparent 60%)",
          }}
        />
        <div className="wrap relative grid grid-cols-1 items-center gap-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                {h.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="text-gradient">{h.hero.title}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 lg:text-lg">
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
              <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-7">
                {h.hero.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-3xl font-semibold text-white sm:text-4xl">
                      <Counter value={s.value} />
                    </dd>
                    <dd className="mt-1 text-xs leading-snug text-white/55">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="order-first lg:order-none">
            <Hero3D />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="relative overflow-hidden bg-paper py-20 lg:py-28">
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

      {/* SPORTS */}
      <section className="bg-surface py-20 lg:py-28">
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
                {h.sports.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {h.sports.title}
              </h2>
              <p className="mt-3 text-ink/60">{h.sports.body}</p>
            </div>
            <Link
              href={`/${lang}/sportet`}
              className="link-underline hidden items-center gap-1.5 text-sm font-semibold text-navy-900 sm:inline-flex"
            >
              {h.sports.cta}
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </Reveal>

          <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {h.sports.items.map((s) => (
              <StaggerItem key={s.name}>
                <Link
                  href={`/${lang}/sportet`}
                  className="card-hover group block h-full rounded-xl border border-line bg-white p-5"
                >
                  <Icon
                    name={s.icon as IconName}
                    className="h-7 w-7 text-blue-500 transition group-hover:scale-110 group-hover:text-navy-900"
                  />
                  <p className="font-display mt-4 text-sm font-semibold text-ink">
                    {s.name}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">{s.teams}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ACADEMY */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal y={0} className="order-last lg:order-first">
            <PhotoFrame
              icon="users"
              variant="blue"
              label={h.academy.title}
              className="aspect-[4/3] rounded-2xl"
            />
          </Reveal>
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              {h.academy.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {h.academy.title}
            </h2>
            <p className="mt-4 text-ink/60">{h.academy.body}</p>
            <ul className="mt-6 space-y-3">
              {h.academy.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-ink/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href={`/${lang}/akademia`} className="btn btn-primary mt-8">
              {h.academy.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CALENDAR */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white lg:py-28">
        <div className="blob -right-24 bottom-0 h-[360px] w-[360px] bg-blue-600/25" />
        <div className="wrap relative">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                {h.calendar.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {h.calendar.title}
              </h2>
              <p className="mt-3 text-white/60">{h.calendar.body}</p>
            </div>
            <Link href={`/${lang}/kalendari`} className="btn btn-ghost-light">
              {h.calendar.cta}
            </Link>
          </Reveal>

          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StaggerItem>
              <div className="glass card-hover h-full rounded-xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                  {h.calendar.next.label}
                </p>
                <p className="font-display mt-3 text-xl font-semibold">
                  {h.calendar.next.teams}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                  <Icon name="calendar" className="h-4 w-4" />
                  {h.calendar.next.detail}
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass card-hover h-full rounded-xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                  {h.calendar.last.label}
                </p>
                <p className="font-display mt-3 text-xl font-semibold">
                  {h.calendar.last.teams}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                  <Icon name="trophy" className="h-4 w-4" />
                  {h.calendar.last.detail}
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* NEWS */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
                {h.news.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {h.news.title}
              </h2>
            </div>
            <Link
              href={`/${lang}/lajme`}
              className="link-underline hidden items-center gap-1.5 text-sm font-semibold text-navy-900 sm:inline-flex"
            >
              {h.news.cta}
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </Reveal>

          <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {h.news.items.map((n, i) => (
              <StaggerItem key={n.title}>
                <Link
                  href={`/${lang}/lajme`}
                  className="card-hover group block h-full overflow-hidden rounded-xl border border-line bg-white"
                >
                  <PhotoFrame
                    icon={(["trophy", "users", "shield"] as const)[i]}
                    variant={i === 1 ? "blue" : "navy"}
                    label={n.title}
                    className="aspect-[16/10]"
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
        </div>
      </section>

      {/* CLUB */}
      <section className="bg-surface py-20 lg:py-28">
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
            <PhotoFrame
              icon="trophy"
              variant="light"
              label={h.club.title}
              className="aspect-[4/3] rounded-2xl"
            />
          </Reveal>
        </div>
      </section>

      {/* SHOP + PARTNERS */}
      <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-28">
        <div className="blob -left-20 top-10 h-[320px] w-[320px] bg-gold-500/15" />
        <div className="wrap relative grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass card-hover flex h-full flex-col justify-between rounded-2xl p-8">
              <div>
                <Icon name="shirt" className="h-8 w-8 text-gold-400" />
                <p className="font-display mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  {h.shop.eyebrow}
                </p>
                <h3 className="font-display mt-2 text-2xl font-semibold">
                  {h.shop.title}
                </h3>
                <p className="mt-3 text-sm text-white/60">{h.shop.body}</p>
              </div>
              <Link href={`/${lang}/dyqani`} className="btn btn-ghost-light mt-8 self-start">
                {h.shop.cta}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass card-hover flex h-full flex-col justify-between rounded-2xl p-8">
              <div>
                <Icon name="handshake" className="h-8 w-8 text-gold-400" />
                <p className="font-display mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  {h.partners.eyebrow}
                </p>
                <h3 className="font-display mt-2 text-2xl font-semibold">
                  {h.partners.title}
                </h3>
                <p className="mt-3 text-sm text-white/60">{h.partners.body}</p>
              </div>
              <Link href={`/${lang}/kontakt`} className="btn btn-ghost-light mt-8 self-start">
                {h.partners.cta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
