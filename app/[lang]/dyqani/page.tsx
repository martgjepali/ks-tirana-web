import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.shop;

  return (
    <>
      <PageHero eyebrow={dict.nav.shop} title={s.title} subtitle={s.subtitle} />

      <section className="bg-paper py-14">
        <div className="wrap">
          <p className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-navy-900">
            {s.note}
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 lg:pb-24">
        <StaggerGroup className="wrap grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item, i) => (
            <StaggerItem key={item.name}>
              <div className="card-hover h-full overflow-hidden rounded-xl border border-line bg-white">
                <PhotoFrame
                  icon="shirt"
                  variant={i % 2 === 0 ? "navy" : "blue"}
                  label={item.name}
                  className="aspect-square"
                />
                <div className="p-5">
                  {item.tag && (
                    <span className="rounded-full bg-gold-400/15 px-2.5 py-0.5 text-xs font-semibold text-gold-500">
                      {item.tag}
                    </span>
                  )}
                  <h3 className="font-display mt-2.5 text-base font-semibold text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/55">{item.price}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-24">
        <div className="blob -left-20 top-10 h-[320px] w-[320px] bg-gold-500/15" />
        <div className="wrap relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Icon name="handshake" className="h-8 w-8 text-gold-400" />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              {s.partnerTitle}
            </h2>
            <p className="mt-3 text-white/60">{s.partnerBody}</p>
            <ul className="mt-6 space-y-3">
              {s.partnerItems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href={`/${lang}/kontakt`} className="btn btn-primary mt-8">
              {s.cta}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal y={0}>
            <PhotoFrame
              icon="handshake"
              variant="blue"
              label={s.partnerTitle}
              className="aspect-[4/3] rounded-2xl"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
