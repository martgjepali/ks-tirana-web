import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { CLUB_NAME, SOCIAL_LABELS, type SocialName } from "@/lib/club";
import { getSiteSettings } from "@/lib/data/club";

export async function generateMetadata({ params }: PageProps<"/[lang]/kontakt">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.contact} · KS Tirana`, description: dict.contact.subtitle };
}

/** "KONTAKT" — client's final design, page 31. */
export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/kontakt">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const [dict, settings] = await Promise.all([getDictionary(lang), getSiteSettings()]);
  const c = dict.contact;
  const CLUB_INFO = { name: CLUB_NAME, ...settings.contact };
  const socials = (Object.keys(SOCIAL_LABELS) as SocialName[]).filter((k) => settings.socials[k]);
  // Links from the Shop, Media and Partner pages pre-fill the subject (?subjekti=shop&produkti=...).
  const subjects = c.subjects as Record<string, string>;
  const topic = typeof sp.subjekti === "string" ? subjects[sp.subjekti] : undefined;
  const product = typeof sp.produkti === "string" ? sp.produkti.slice(0, 120) : undefined;
  const defaultSubject = topic ? (product ? `${topic}: ${product}` : topic) : undefined;

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Reveal className="wrap py-8 lg:py-10">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-300">{c.eyebrow}</p>
          <h1 className="display mt-2 text-5xl normal-case lg:text-[4rem]">{c.title}</h1>
          <p className="mt-5 text-lg text-white/90">{c.subtitle}</p>
        </Reveal>
      </section>

      <section className="bg-paper py-6 lg:py-8">
        <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="border border-line bg-[#eef3fa] p-6 lg:p-8 [:root[data-theme=dark]_&]:bg-surface">
            <h2 className="mb-5 text-2xl font-extrabold text-strong lg:text-3xl">{c.formTitle}</h2>
            <ContactForm dict={dict} lang={lang} defaultSubject={defaultSubject} />
          </div>

          <div className="space-y-5">
            <div className="bg-[#eef3fa] p-7 [:root[data-theme=dark]_&]:bg-surface">
              <h2 className="text-3xl font-extrabold text-strong">{CLUB_INFO.name}</h2>
              <p className="mt-3 text-sm font-bold text-blue-500">{c.labels.address}</p>
              <p className="text-lg font-bold text-strong">{CLUB_INFO.venue}</p>
              <p className="text-ink/65">{CLUB_INFO.address}</p>
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-blue-500">{c.labels.phone}</p>
                  <a href={`tel:${CLUB_INFO.phone.replace(/\s/g, "")}`} className="text-xl font-bold text-strong hover:text-blue-500">
                    {CLUB_INFO.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-500">{c.labels.email}</p>
                  <a href={`mailto:${CLUB_INFO.email}`} className="text-xl font-bold text-strong hover:text-blue-500">
                    {CLUB_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 p-7 text-white">
              <h2 className="text-3xl font-extrabold">{c.labels.follow}</h2>
              <ul className="mt-5 grid grid-cols-4 gap-3">
                {socials.map((name) => (
                  <li key={name}>
                    <a href={settings.socials[name]} target="_blank" rel="noreferrer" className="group block">
                      <span className="flex h-12 w-12 items-center justify-center bg-blue-500 transition group-hover:bg-white group-hover:text-blue-500">
                        <Icon name={name} className="h-6 w-6" />
                      </span>
                      <span className="mt-2 block text-sm font-bold">{SOCIAL_LABELS[name]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
