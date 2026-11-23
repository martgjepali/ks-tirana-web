import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { Photo, type PhotoName } from "@/components/Photo";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

const photos: PhotoName[] = [
  "sportVolleyball",
  "academyTraining",
  "clubHistoryHero",
  "sportBasketball",
  "shopFlatlay",
  "clubTeamHuddle",
];

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const n = dict.news;

  return (
    <>
      <PhotoPageHero
        photo="sportVolleyball"
        eyebrow={dict.nav.news}
        title={n.title}
        subtitle={n.subtitle}
      />

      <section className="bg-paper py-20 lg:py-24">
        <StaggerGroup className="wrap grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {n.items.map((item, i) => (
            <StaggerItem key={item.title}>
              <article className="card-hover h-full overflow-hidden rounded-xl border border-line bg-white">
                <Photo
                  name={photos[i % photos.length]}
                  alt={item.title}
                  sizes="(min-width: 1024px) 32vw, 90vw"
                  className="aspect-[16/10]"
                />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    {item.tag} · {item.date}
                  </p>
                  <h3 className="font-display mt-2 text-lg font-semibold leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {item.excerpt}
                  </p>
                  <span className="link-underline mt-4 inline-block text-sm font-semibold text-navy-900">
                    {n.readMore}
                  </span>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
