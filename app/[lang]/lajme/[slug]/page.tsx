import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getArticle, getNews } from "@/lib/data/site";
import { MediaImage } from "@/components/MediaImage";
import { NewsCard } from "@/components/NewsCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/lajme/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const article = await getArticle(slug, lang);
  if (!article) return {};
  return {
    title: `${article.title} · KS Tirana`,
    description: article.excerpt ?? undefined,
    openGraph: {
      type: "article",
      publishedTime: article.publishedAt,
      images: article.cover ? [{ url: article.cover.large }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/lajme/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, article, recent] = await Promise.all([getDictionary(lang), getArticle(slug, lang), getNews(lang, 6)]);
  if (!article) notFound();
  const n = dict.news;
  const label = article.discipline ?? n.categories[article.category];
  const more = recent.filter((r) => r.slug !== article.slug).slice(0, 4);
  // Body is plain text from the admin panel: blank lines separate paragraphs.
  const paragraphs = article.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <article>
        <header className="bg-paper">
          <div className="wrap wrap-medium pt-8 lg:pt-10">
            <Breadcrumb items={[{ label: dict.nav.home, href: `/${lang}` }, { label: n.title, href: `/${lang}/lajme` }, { label }]} />
            <Reveal className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider">
                <span className="text-blue-500">{label}</span>
                <span className="mx-2 text-ink/30">|</span>
                <time dateTime={article.publishedAt} className="text-ink/55">
                  {article.date}
                </time>
              </p>
              <h1 className="display mt-4 text-4xl text-strong lg:text-6xl">{article.title}</h1>
              {article.excerpt && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/70">{article.excerpt}</p>}
            </Reveal>
          </div>
        </header>

        {article.cover && (
          <div className="wrap wrap-medium pt-8">
            <MediaImage photo={article.cover} sizes="(min-width: 1024px) 1000px, 100vw" className="aspect-[16/9] rounded-sm" priority />
          </div>
        )}

        <div className="wrap wrap-narrow py-10 lg:py-12">
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-ink/85">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-surface py-12 lg:py-14">
          <div className="wrap">
            <h2 className="section-label">{n.more}</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {more.map((item) => (
                <li key={item.slug}>
                  <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} label={item.discipline ?? n.categories[item.category]} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
