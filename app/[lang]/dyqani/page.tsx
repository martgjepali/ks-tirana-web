import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { getHeroPhoto, getProducts, getShowcasePhotos } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { MediaImage } from "@/components/MediaImage";
import { PhotoFrame } from "@/components/PhotoFrame";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/dyqani">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.shop.title} · KS Tirana`, description: dict.shop.subtitle };
}

export default async function ShopPage({ params }: PageProps<"/[lang]/dyqani">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, products, hero, [partnerPhoto]] = await Promise.all([
    getDictionary(lang),
    getProducts(lang),
    getHeroPhoto(lang, "basketboll-femra"),
    getShowcasePhotos(lang, { discipline: "volejboll-meshkuj", orientation: "landscape" }),
  ]);
  const s = dict.shop;

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={dict.nav.shop}
        title={s.title}
        subtitle={s.subtitle}
      />

      <section className="bg-paper py-14">
        <div className="wrap reveal">
          <p className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-strong">
            {s.note}
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 lg:pb-24">
        <div className="wrap reveal">
          {products.length > 0 ? (
            <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((item, i) => (
                <StaggerItem key={item.slug}>
                  <div className="card-hover h-full overflow-hidden rounded-xl border border-line bg-card">
                    {item.photo ? (
                      <MediaImage
                        photo={item.photo}
                        alt={item.name}
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                        className="aspect-square"
                      />
                    ) : (
                      <PhotoFrame icon="shirt" variant={i % 2 === 0 ? "navy" : "blue"} label={item.name} className="aspect-square" />
                    )}
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-ink">{item.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-strong">{item.price ?? s.priceOnRequest}</p>
                      {item.description && <p className="mt-2 text-sm text-ink/60">{item.description}</p>}
                      {item.sizes.length > 0 && (
                        <p className="mt-2 text-xs text-ink/50">
                          {s.sizes}: {item.sizes.join(" · ")}
                        </p>
                      )}
                      {!item.inStock && (
                        <span className="mt-3 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                          {s.outOfStock}
                        </span>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <EmptyState icon="shirt" text={s.empty} />
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-24">
        <div className="blob -left-20 top-10 h-[320px] w-[320px] bg-gold-500/15" />
        <div className="wrap reveal relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
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
          {partnerPhoto && (
            <Reveal y={0}>
              <MediaImage
                photo={partnerPhoto}
                alt=""
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="aspect-[4/3] rounded-2xl"
              />
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
