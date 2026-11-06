import { Reveal } from "./motion/Reveal";
import { Photo, type PhotoName } from "./Photo";

export function PhotoPageHero({
  photo,
  eyebrow,
  title,
  subtitle,
}: {
  photo: PhotoName;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <Photo name={photo} alt="" priority sizes="100vw" fill />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(6,14,31,0.96) 25%, rgba(6,14,31,0.72) 55%, rgba(6,14,31,0.2) 88%)",
        }}
      />
      <div className="wrap relative flex min-h-[380px] flex-col justify-end py-14 lg:min-h-[440px]">
        <Reveal>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {eyebrow}
          </span>
          <h1 className="font-display mt-4 max-w-xl text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-md text-white/65">{subtitle}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
