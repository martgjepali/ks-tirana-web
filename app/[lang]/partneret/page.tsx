import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getHeroPhoto } from "@/lib/data/site";
import { getPartners, getSiteSettings } from "@/lib/data/club";
import { SponsorBand } from "@/components/SponsorBand";
import { MediaImage } from "@/components/MediaImage";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/partneret">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.partners.title} · KS Tirana`, description: dict.partners.subtitle };
}

/** "PARTNERËT" — client's final design, page 30. */
export default async function PartnersPage({ params }: PageProps<"/[lang]/partneret">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hero, settings, { sponsors: PARTNERS }] = await Promise.all([
    getDictionary(lang),
    getHeroPhoto(lang, "basketboll-meshkuj", 3),
    getSiteSettings(),
    getPartners(),
  ]);
  const email = settings.contact.email;
  const p = dict.partners;
  const subject = encodeURIComponent(p.ctaTitle);

  return (
    <>
      <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Reveal className="px-6 flex flex-col justify-center py-12 lg:py-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+3rem))]">
          <h1 className="display text-6xl normal-case lg:text-[4.75rem]">{p.title}</h1>
          <p className="mt-8 text-white/90">{p.subtitle}</p>
        </Reveal>
        {hero && <MediaImage photo={hero} alt="" sizes="(min-width: 1024px) 42vw, 100vw" priority className="min-h-[220px] lg:min-h-[320px]" />}
      </section>

      <SponsorBand eyebrow={dict.home.sponsors.supporter} label={dict.home.sponsors.partners} />

      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap">
          <h2 className="text-3xl font-extrabold text-strong lg:text-4xl">{p.grid}</h2>
          <StaggerGroup className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {PARTNERS.map((partner) => (
              <StaggerItem key={partner.id}>
                <div className="flex h-28 items-center justify-center bg-[#eef3fa] px-6 transition hover:bg-white hover:shadow-[var(--shadow-card)] [:root[data-theme=dark]_&]:bg-white">
                  <Image unoptimized src={partner.logo} alt={partner.name} width={200} height={80} className="max-h-16 w-auto max-w-[180px] object-contain" />
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="bg-paper pb-12 lg:pb-14">
        <div className="wrap">
          <div className="flex flex-col gap-6 bg-navy-900 px-8 py-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold">{p.ctaTitle}</h2>
              <p className="mt-2 text-lg text-white/90">{p.ctaBody}</p>
            </div>
            <div className="shrink-0 md:text-right">
              <a href={`mailto:${email}?subject=${subject}`} className="btn btn-primary !text-base !normal-case !tracking-normal">
                {p.cta}
              </a>
              <p className="mt-3 text-sm font-bold">{email}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
