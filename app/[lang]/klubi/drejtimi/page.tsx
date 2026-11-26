import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getHeroPhoto } from "@/lib/data/site";
import { getSiteSettings } from "@/lib/data/club";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { OrgChart } from "@/components/OrgChart";
import { MediaImage } from "@/components/MediaImage";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/klubi/drejtimi">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.management} · KS Tirana`, description: dict.org.hero.body };
}

/** "DREJTIMI & ORGANIZIMI" — client proposal, slide 08/12 ("Klubi / Drejtimi & Organizimi"). */
export default async function ManagementPage({ params }: PageProps<"/[lang]/klubi/drejtimi">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, hero, teamPhoto, settings] = await Promise.all([
    getDictionary(lang),
    getHeroPhoto(lang, "volejboll-femra", 1),
    getHeroPhoto(lang, "basketboll-femra", 1),
    getSiteSettings(),
  ]);
  const ORG_CHART_PDF_URL = settings.orgChartPdfUrl;
  const o = dict.org;

  return (
    <>
      <PhotoPageHero photo={hero} eyebrow={`${o.hero.eyebrow} ———`} title={o.hero.title} body={o.hero.body} size="md" />

      <section className="bg-paper py-10 lg:py-12">
        <div className="wrap">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="eyebrow flex items-center gap-4 text-[0.625rem] text-ink/60">
              {o.label}
              <span className="h-px w-12 bg-ink/30" />
            </p>
            <div className="flex items-center gap-5">
              <p className="max-w-md text-xs leading-snug text-ink/70 lg:text-right">{o.note}</p>
              {ORG_CHART_PDF_URL && (
                <a href={ORG_CHART_PDF_URL} download className="flex shrink-0 items-center gap-2 rounded-sm border border-line px-4 py-2.5 text-sm font-semibold text-strong hover:border-blue-500">
                  <Icon name="download" className="h-4 w-4" />
                  {o.download}
                </a>
              )}
            </div>
          </div>
          <div className="mt-8">
            <OrgChart root={o.root} units={o.units} labels={{ unit: o.unit, responsibilities: o.responsibilities, close: o.close }} />
          </div>
        </div>
      </section>

      {/* Good governance */}
      <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Reveal className="flex flex-col justify-center px-6 py-12 lg:py-14 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-12">
          <p className="eyebrow flex items-center gap-4 text-[0.625rem] text-white/80">
            {o.governance.eyebrow}
            <span className="h-px w-12 bg-white/40" />
          </p>
          <h2 className="display mt-4 text-3xl lg:text-4xl">
            {o.governance.title.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-white/85">{o.governance.body}</p>
          <Link href={`/${lang}/klubi`} className="mt-6 inline-flex items-center gap-2 font-semibold hover:text-sky-300">
            {o.governance.cta}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </Reveal>
        {teamPhoto && <MediaImage photo={teamPhoto} alt="" sizes="(min-width: 1024px) 60vw, 100vw" className="min-h-[260px]" />}
      </section>
    </>
  );
}
