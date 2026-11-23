import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getArticle, getNews } from "@/lib/data/site";
import { MediaImage } from "@/components/MediaImage";
import { NewsCard } from "@/components/NewsCard";
import { Icon } from "@/components/Icons";
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
  const [dict, article, recent] = await Promise.all([getDictionary(lang), getArticle(slug, lang), getNews(lang, 4)]);
  if (!article) notFound();
  const more = recent.filter((n) => n.slug !== article.slug).slice(0, 3);
  // Body is plain text from the admin panel: blank lines separate paragraphs.
  const paragraphs = article.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <article>
        <header className="bg-navy-950 text-white">
          <div className="wrap wrap-narrow py-14 lg:py-16">
            <Reveal>
              <Link
                href={`/${lang}/lajme`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
              >
                <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
                {dict.news.back}
              </Link>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-sky-300">
                {article.discipline ? `${article.discipline} · ` : ""}
                <time dateTime={article.publishedAt}>{article.date}</time>
              </p>
              <h1 className="font-display mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>
              {article.excerpt && <p className="mt-5 text-lg leading-relaxed text-white/70">{article.excerpt}</p>}
            </Reveal>
          </div>
        </header>

        {article.cover && (
          <div className="wrap wrap-medium -mb-2 pt-10">
            <MediaImage
              photo={article.cover}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="aspect-[16/9] rounded-2xl"
              priority
            />
          </div>
        )}

        <div className="wrap wrap-narrow py-12 lg:py-14">
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-ink/80">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-surface py-14 lg:py-16">
          <div className="wrap">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-ink">{dict.news.latest}</h2>
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <li key={item.slug}>
                  <NewsCard item={item} href={`/${lang}/lajme/${item.slug}`} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
