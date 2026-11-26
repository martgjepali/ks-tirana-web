import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { getPrograms } from "@/lib/data/site";
import { AcademyForm } from "@/components/AcademyForm";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/akademia/apliko">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.academy.apply.title} · KS Tirana` };
}

/** "Formulari i regjistrimit" — client's final design, page 25. */
export default async function ApplyPage({ params, searchParams }: PageProps<"/[lang]/akademia/apliko">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, programs] = await Promise.all([getDictionary(lang), getPrograms(lang)]);
  const requested = (await searchParams).programi;
  const defaultProgram = programs.find((p) => p.slug === requested)?.slug;
  const f = dict.academy.apply;

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Reveal className="wrap py-10 lg:py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
            <Link href={`/${lang}/akademia`} className="hover:text-white">
              {f.eyebrow}
            </Link>
          </p>
          <h1 className="display mt-4 text-4xl normal-case lg:text-[3.25rem]">{f.title}</h1>
        </Reveal>
      </section>

      <section className="bg-paper py-6 lg:py-8">
        <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <div className="border border-line bg-[#eef3fa] p-6 lg:p-8 [:root[data-theme=dark]_&]:bg-surface">
            <AcademyForm dict={dict} programs={programs.map(({ slug, name }) => ({ slug, name }))} defaultProgram={defaultProgram} />
          </div>
          <aside className="space-y-5">
            <div className="border border-line bg-[#eef3fa] p-6 [:root[data-theme=dark]_&]:bg-surface">
              <h2 className="text-2xl font-extrabold text-strong">{f.programs}</h2>
              <ul className="mt-4 space-y-2.5">
                {programs.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/${lang}/akademia/apliko?programi=${p.slug}`}
                      aria-current={p.slug === defaultProgram ? "true" : undefined}
                      className="block bg-card px-4 py-2.5 font-bold text-strong transition hover:bg-blue-500 hover:text-white aria-[current=true]:bg-blue-500 aria-[current=true]:text-white"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy-900 p-6 text-white">
              <h2 className="text-2xl font-extrabold">{f.after}</h2>
              <p className="mt-3 text-white/90">{f.afterBody}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
