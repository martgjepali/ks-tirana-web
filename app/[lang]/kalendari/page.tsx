import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getFixtures, getHeroPhoto } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { CalendarBoard } from "@/components/CalendarBoard";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/kalendari">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.calendar.title} · KS Tirana`, description: dict.calendar.subtitle };
}

export default async function CalendarPage({ params }: PageProps<"/[lang]/kalendari">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, fixtures, hero] = await Promise.all([
    getDictionary(lang),
    getFixtures(lang),
    getHeroPhoto(lang, "basketboll-meshkuj"),
  ]);

  return (
    <>
      <PhotoPageHero
        photo={hero}
        eyebrow={dict.nav.calendar}
        title={dict.calendar.title}
        subtitle={dict.calendar.subtitle}
      />
      <section className="bg-paper py-20 lg:py-24">
        <Reveal className="wrap">
          <CalendarBoard dict={dict} upcoming={fixtures.upcoming} results={fixtures.results} />
        </Reveal>
      </section>
    </>
  );
}
