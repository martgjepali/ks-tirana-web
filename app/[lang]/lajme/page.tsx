import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getHeroPhoto, getNews } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/lajme">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.news.title} · KS Tirana`, description: dict.news.subtitle };
}

export default async function NewsPage({ params }: PageProps<"/[lang]/lajme">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, news, hero] = await Promise.all([
    getDictionary(lang),
    getNews(lang, 48),
    getHeroPhoto(lang, "volejboll-femra"),
  ]);
  const n = dict.news;

  return (
    <>
      <PhotoPageHero photo={hero} eyebrow={dict.nav.news} title={n.title} subtitle={n.subtitle} />

      <section className="bg-paper py-20 lg:py-24">
        <div className="wrap">
          {news.length > 0 ? (
            <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <StaggerItem key={item.slug}>
                  <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} readMore={n.readMore} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <EmptyState icon="mail" text={n.empty} />
          )}
        </div>
      </section>
    </>
  );
}
