import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getHeroPhoto, getProducts, PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { MediaImage } from "@/components/MediaImage";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/dyqani">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.shop} · KS Tirana`, description: dict.shop.hero.tagline };
}

/** "SHOP" — client proposal, slide 10/16. */
export default async function ShopPage({ params, searchParams }: PageProps<"/[lang]/dyqani">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const requested = (await searchParams).kategoria;
  const category = PRODUCT_CATEGORIES.find((c) => c === requested) as ProductCategory | undefined;
  const [dict, products, hero, fansPhoto] = await Promise.all([
    getDictionary(lang),
    getProducts(lang, category),
    getHeroPhoto(lang, "volejboll-femra", 2),
    getHeroPhoto(lang, "basketboll-femra", 2),
  ]);
  const s = dict.shop;

  return (
    <>
      <PhotoPageHero photo={hero} title={s.hero.title} accentLine={1} side={s.hero.side} size="md">
        <p className="w-full text-sm font-semibold uppercase tracking-[0.35em] text-white/90 lg:text-base">{s.hero.tagline}</p>
        <Link href="#koleksioni" className="btn btn-primary">
          {s.hero.cta}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </PhotoPageHero>

      <section id="koleksioni" className="scroll-mt-28 bg-paper py-8 lg:py-10">
        <div className="wrap">
          <nav className="flex justify-center gap-8 sm:gap-14" aria-label={dict.nav.shop}>
            {PRODUCT_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={category === c ? `/${lang}/dyqani#koleksioni` : `/${lang}/dyqani?kategoria=${c}#koleksioni`}
                aria-current={category === c ? "true" : undefined}
                className={`border-b-2 px-3 pb-2 text-lg font-semibold transition ${
                  category === c ? "border-blue-500 text-blue-500" : "border-transparent text-strong hover:text-blue-500"
                }`}
              >
                {s.tabs[c]}
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            {products.length > 0 ? (
              <StaggerGroup className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                {products.map((p) => (
                  <StaggerItem key={p.slug}>
                    <Link href={`/${lang}/dyqani/${p.slug}`} className="group block">
                      {p.photo ? (
                        <MediaImage photo={p.photo} alt={p.name} sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 48vw" className="aspect-square bg-surface" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-surface">
                          <Icon name="shirt" className="h-16 w-16 text-navy-700/25" />
                        </div>
                      )}
                      <p className="mt-3 text-sm font-semibold leading-snug text-strong">{p.name}</p>
                      {p.price && <p className="mt-0.5 text-sm text-ink/60">{p.price}</p>}
                      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
                        {s.view}
                        <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            ) : (
              <EmptyState icon="shirt" text={s.empty} />
            )}
          </div>
        </div>
      </section>

      {/* Official collection */}
      <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Reveal className="flex flex-col justify-center px-6 py-12 lg:py-14 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-12">
          <p className="eyebrow tracking-[0.3em] text-white/85">{s.collection.eyebrow}</p>
          <h2 className="display mt-3 text-4xl lg:text-5xl">
            {s.collection.title.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{s.collection.tagline}</p>
          <Link href={`/${lang}/dyqani#koleksioni`} className="btn btn-ghost-light mt-7 w-fit">
            {s.collection.cta}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </Reveal>
        {fansPhoto && <MediaImage photo={fansPhoto} alt="" sizes="(min-width: 1024px) 60vw, 100vw" className="min-h-[260px]" />}
      </section>
    </>
  );
}
