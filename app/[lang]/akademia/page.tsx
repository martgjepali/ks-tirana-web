import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { PhotoPageHero } from "@/components/PhotoPageHero";
import { AcademyForm } from "@/components/AcademyForm";
import { Icon } from "@/components/Icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const a = dict.academy;

  return (
    <>
      <PhotoPageHero
        photo="academyTraining"
        eyebrow={dict.nav.academy}
        title={a.title}
        subtitle={a.subtitle}
      />

      <section className="bg-paper py-20 lg:py-24">
        <StaggerGroup className="wrap grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="trophy" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.programsTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.programsBody}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="clock" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.infoTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.infoBody}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card-hover h-full rounded-xl border border-line bg-white p-6">
              <Icon name="users" className="h-7 w-7 text-blue-500" />
              <h3 className="font-display mt-4 text-base font-semibold text-ink">
                {a.findTitle}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{a.findBody}</p>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="wrap">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {a.programsTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 overflow-hidden rounded-xl border border-line bg-white">
            {a.programs.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col gap-1.5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div>
                  <p className="font-display font-semibold text-ink">{p.name}</p>
                  <p className="mt-0.5 text-sm text-ink/55">{p.schedule}</p>
                </div>
                <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-navy-800">
                  {p.age}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-20 lg:py-24">
        <Reveal className="wrap max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {a.formTitle}
          </h2>
          <p className="mt-2 text-ink/60">{a.formBody}</p>
          <div className="mt-8">
            <AcademyForm dict={dict} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
