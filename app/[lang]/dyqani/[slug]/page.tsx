import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getProduct } from "@/lib/data/site";
import { MediaImage } from "@/components/MediaImage";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Icon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/dyqani/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProduct(slug, lang);
  if (!product) return {};
  return {
    title: `${product.name} · KS Tirana Shop`,
    description: product.description?.slice(0, 160) ?? undefined,
    openGraph: product.photo ? { images: [{ url: product.photo.large }] } : undefined,
  };
}

/**
 * Product page ("Shiko produktin"). The proposal lists photos, sizes and
 * prices, ordering and delivery, and online payment at a later stage — so
 * orders go through the contact form for now.
 */
export default async function ProductPage({ params }: PageProps<"/[lang]/dyqani/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, product] = await Promise.all([getDictionary(lang), getProduct(slug, lang)]);
  if (!product) notFound();
  const s = dict.shop;
  const p = s.product;

  return (
    <section className="bg-paper py-8 lg:py-12">
      <div className="wrap">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.nav.shop, href: `/${lang}/dyqani` },
            { label: s.tabs[product.category], href: `/${lang}/dyqani?kategoria=${product.category}#koleksioni` },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {product.photo ? (
            <MediaImage photo={product.photo} alt={product.name} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-square bg-surface" priority />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-surface">
              <Icon name="shirt" className="h-24 w-24 text-navy-700/25" />
            </div>
          )}
          <div>
            <p className="eyebrow text-blue-500">{s.tabs[product.category]}</p>
            <h1 className="display mt-3 text-4xl text-strong lg:text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-bold text-strong">{product.price ?? p.priceOnRequest}</p>
            <p className={`mt-2 text-sm font-semibold ${product.inStock ? "text-blue-500" : "text-ink/50"}`}>
              {product.inStock ? p.inStock : p.outOfStock}
            </p>
            {product.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-ink/75">{product.description}</p>}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{p.sizes}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <li key={size} className="min-w-11 rounded-sm border border-line px-3 py-2 text-center text-sm font-semibold text-strong">
                      {size}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.inStock && (
              <Link href={`/${lang}/kontakt?subjekti=shop&produkti=${encodeURIComponent(product.name)}`} className="btn btn-primary mt-8">
                <Icon name="bag" className="h-4 w-4" />
                {p.order}
              </Link>
            )}
            <p className="mt-4 max-w-md text-sm text-ink/60">{p.orderNote}</p>
            <Link href={`/${lang}/dyqani`} className="link-arrow mt-8">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              {p.back}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
