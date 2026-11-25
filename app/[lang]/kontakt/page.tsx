import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getHeroPhoto } from "@/lib/data/site";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/kontakt">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.contact} · KS Tirana`, description: dict.contact.subtitle };
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/kontakt">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const [dict, hero] = await Promise.all([getDictionary(lang), getHeroPhoto(lang, "mundje-e-lire", 1)]);
  const c = dict.contact;
  // Links from the Shop, Media and Partner pages pre-fill the subject (?subjekti=shop&produkti=...).
  const subjects = c.subjects as Record<string, string>;
  const topic = typeof sp.subjekti === "string" ? subjects[sp.subjekti] : undefined;
  const product = typeof sp.produkti === "string" ? sp.produkti.slice(0, 120) : undefined;
  const defaultSubject = topic ? (product ? `${topic}: ${product}` : topic) : undefined;

  return (
    <>
      <PhotoPageHero photo={hero} eyebrow={c.eyebrow} title={[c.title]} body={c.subtitle} size="sm" />

      <section className="bg-paper py-14 lg:py-16">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="rule" />
            <h2 className="display mt-4 text-3xl text-strong">{c.formTitle}</h2>
            <div className="mt-6">
              <ContactForm dict={dict} defaultSubject={defaultSubject} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-fit bg-navy-900 p-8 text-white">
            <h2 className="display text-2xl">{c.infoTitle}</h2>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <span className="text-white/85">{c.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="mail" className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <div className="space-y-1 text-white/85">
                  <p>{c.email}</p>
                  <p>{c.academyEmail}</p>
                  <p>{c.pressEmail}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <div className="text-white/85">
                  <p className="font-semibold text-white">{c.hoursTitle}</p>
                  <p>{c.hours}</p>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
