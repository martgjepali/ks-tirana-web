import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.contact;

  return (
    <>
      <PhotoPageHero
        photo="clubTeamHuddle"
        eyebrow={dict.nav.contact}
        title={c.title}
        subtitle={c.subtitle}
      />

      <section className="bg-paper py-20 lg:py-24">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <h2 className="font-display text-xl font-semibold text-ink">
              {c.formTitle}
            </h2>
            <div className="mt-6">
              <ContactForm dict={dict} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-line bg-surface p-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              {c.infoTitle}
            </h2>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <span className="text-ink/75">{c.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="mail" className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div className="space-y-1 text-ink/75">
                  <p>{c.email}</p>
                  <p>{c.academyEmail}</p>
                  <p>{c.pressEmail}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div className="text-ink/75">
                  <p className="font-medium text-ink">{c.hoursTitle}</p>
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
