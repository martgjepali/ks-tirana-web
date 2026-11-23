import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { CalendarBoard } from "@/components/CalendarBoard";
import { Reveal } from "@/components/motion/Reveal";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <PhotoPageHero
        photo="sportBasketball"
        eyebrow={dict.nav.calendar}
        title={dict.calendar.title}
        subtitle={dict.calendar.subtitle}
      />
      <section className="bg-paper py-20 lg:py-24">
        <Reveal className="wrap">
          <CalendarBoard dict={dict} />
        </Reveal>
      </section>
    </>
  );
}
