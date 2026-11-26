import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { getShowcasePhotos } from "@/lib/data/site";
import { MAGAZINE_ISSUES } from "@/lib/club";
import { FlipBook, type MagazinePage } from "@/components/FlipBook";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/revista">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.nav.magazine} “${dict.magazine.title}” · KS Tirana`, description: dict.magazine.body };
}

/** Revista "Ne jemi Tirona" — client's final design, page 28 (magazine with turning pages). */
export default async function MagazinePage({ params, searchParams }: PageProps<"/[lang]/revista">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const requested = Number((await searchParams).numri);
  const issue = MAGAZINE_ISSUES.find((i) => i.number === requested) ?? MAGAZINE_ISSUES[0];
  const [dict, photos] = await Promise.all([
    getDictionary(lang),
    // EXAMPLE pages: club photos, offset per issue so each example issue looks different.
    getShowcasePhotos(lang, { orientation: "portrait", limit: 6, offset: (issue.number - 1) * 6 }),
  ]);
  const m = dict.magazine;
  const pages: MagazinePage[] = [
    { kind: "image", src: issue.cover, alt: `${m.title} — ${m.issue.replace("{n}", String(issue.number))}` },
    ...photos.map((photo) => ({ kind: "photo" as const, photo, caption: m.pageCaption })),
    { kind: "back", title: m.coverTitle },
  ];
  const labels = { read: m.read, close: m.close, prev: m.prev, next: m.next, page: m.page };

  return (
    <section className="bg-navy-900 text-white">
      <div className="wrap grid grid-cols-1 gap-10 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:py-16">
        <FlipBook
          pages={pages}
          labels={labels}
          trigger={
            <button type="button" className="group block w-full max-w-sm bg-white p-1.5 text-left shadow-2xl transition hover:-translate-y-1" aria-label={m.read}>
              <Image src={issue.cover} alt={pages[0].kind === "image" ? pages[0].alt : ""} width={543} height={724} priority className="h-auto w-full" />
            </button>
          }
        />

        <div className="flex flex-col">
          <Reveal className="lg:pt-10">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
              {m.eyebrow} · {m.issue.replace("{n}", String(issue.number))} · {issue.date[lang]}
            </p>
            <h1 className="display mt-6 text-5xl normal-case lg:text-[4rem]">{m.title}</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/90">{m.body}</p>
            <div className="mt-8">
              <FlipBook
                pages={pages}
                labels={labels}
                trigger={
                  <button type="button" className="btn btn-primary !text-base !normal-case !tracking-normal">
                    <Icon name="book" className="h-5 w-5" />
                    {m.read}
                  </button>
                }
              />
            </div>
          </Reveal>

          <div className="mt-12 lg:ml-auto lg:mt-auto lg:w-[30rem]">
            <ul className="grid grid-cols-4 gap-2">
              {[...MAGAZINE_ISSUES].sort((a, b) => a.number - b.number).map((i) => (
                <li key={i.number}>
                  <Link
                    href={`/${lang}/revista?numri=${i.number}`}
                    aria-current={i.number === issue.number ? "true" : undefined}
                    title={`${m.issue.replace("{n}", String(i.number))} · ${i.date[lang]}`}
                    className="flex aspect-[4/5] items-center justify-center bg-white text-6xl font-black italic text-blue-500 transition hover:-translate-y-1 aria-[current=true]:ring-4 aria-[current=true]:ring-sky-300"
                  >
                    {i.number}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 bg-[#eef3fa] px-5 py-2 text-xl font-extrabold text-strong">{m.previous}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
