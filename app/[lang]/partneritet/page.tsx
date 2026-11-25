import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getHeroPhoto } from "@/lib/data/site";
import { MEDIA_KIT_URL } from "@/lib/club";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/partneritet">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.partner} · KS Tirana`, description: dict.partner.hero.body };
}

/** Photo source and destination for the three opportunity cards (Disiplinat, Akademia, Aktivitetet). */
const CARDS = [
  { discipline: "basketboll-meshkuj", path: "sportet" },
  { discipline: "atletike", path: "akademia" },
  { discipline: "volejboll-femra", path: "kalendari" },
];

/** "BËHU PARTNER" — client proposal, slide 10/17. */
export default async function PartnerPage({ params }: PageProps<"/[lang]/partneritet">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hero, kitPhoto, ...cardSets] = await Promise.all([
    getDictionary(lang),
    getHeroPhoto(lang, "basketboll-femra", 1),
    getHeroPhoto(lang, "volejboll-meshkuj", 3),
    ...CARDS.map((c) => getHeroPhoto(lang, c.discipline, 3)),
  ]);
  const p = dict.partner;
  const contact = `/${lang}/kontakt?subjekti=partner`;
  // Download the media kit once the club provides it; until then, request it.
  const kit = MEDIA_KIT_URL
    ? { href: MEDIA_KIT_URL, label: p.hero.mediaKit, icon: "download" as const, download: true }
    : { href: contact, label: p.hero.requestKit, icon: "arrowRight" as const, download: false };

  return (
    <>
      <PhotoPageHero photo={hero} eyebrow={p.hero.eyebrow} title={p.hero.title} accentLine={1} body={p.hero.body} size="lg">
        <Link href={kit.href} download={kit.download || undefined} className="btn btn-primary">
          {kit.label}
          <Icon name={kit.icon} className="h-4 w-4" />
        </Link>
        <Link href={contact} className="btn btn-ghost-light">
          {p.hero.contact}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </PhotoPageHero>

      {/* Partnership opportunities */}
      <section className="bg-surface py-10 lg:py-12">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:items-center">
          <Reveal>
            <p className="eyebrow font-semibold tracking-[0.14em] text-ink/55">{p.platform.eyebrow}</p>
            <h2 className="display mt-3 text-3xl text-strong lg:text-[2.5rem]">
              {p.platform.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
            <p className="mt-4 leading-relaxed text-ink/70">{p.platform.body}</p>
            <span className="rule mt-6 w-16" />
          </Reveal>
          <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {p.platform.cards.map((card, i) => {
              const photo = cardSets[i];
              return (
                <StaggerItem key={card.title}>
                  <Link href={`/${lang}/${CARDS[i].path}`} className="group block">
                    {photo ? (
                      <MediaImage photo={photo} alt="" sizes="(min-width: 1024px) 20vw, (min-width: 640px) 32vw, 100vw" className="aspect-[16/10]" />
                    ) : (
                      <div className="aspect-[16/10] bg-navy-900" />
                    )}
                    <h3 className="mt-3 flex items-center justify-between text-xl font-bold text-strong group-hover:text-blue-500">
                      {card.title}
                      <Icon name="arrowRight" className="h-5 w-5 text-blue-500 transition group-hover:translate-x-1" />
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/65">{card.body}</p>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Media kit */}
      <section className="grid grid-cols-1 bg-blue-600 text-white lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-10">
          {/* Booklet drawn in CSS until the real media kit cover exists. */}
          <div aria-hidden className="hidden w-40 shrink-0 -rotate-6 rounded-sm bg-navy-900 p-4 shadow-2xl sm:block">
            <Image src="/images/ks-tirana-crest.png" alt="" width={26} height={32} className="h-8 w-auto" />
            <p className="font-display mt-6 text-lg font-black leading-none">KS TIRANA</p>
            <p className="mt-1 text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/70">Partnership media kit</p>
          </div>
          <div className="flex-1">
            <p className="eyebrow text-white/80">{p.kit.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-bold lg:text-[1.75rem]">{p.kit.title}</h2>
            <p className="mt-1 text-white/85">{p.kit.body}</p>
          </div>
          <Link href={kit.href} download={kit.download || undefined} className="btn btn-white shrink-0">
            {kit.label}
            <Icon name={kit.icon} className="h-4 w-4" />
          </Link>
        </div>
        {kitPhoto && <MediaImage photo={kitPhoto} alt="" sizes="(min-width: 1024px) 30vw, 100vw" className="min-h-[180px]" />}
      </section>
    </>
  );
}
