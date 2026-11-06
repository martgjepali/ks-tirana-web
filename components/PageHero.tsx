import { Reveal } from "./motion/Reveal";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white lg:py-24">
      <div className="blob -right-28 -top-24 h-[360px] w-[360px] bg-blue-600/30" />
      <div className="blob -left-24 bottom-0 h-[260px] w-[260px] bg-gold-500/10" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 360px at 90% -10%, rgba(29,90,230,0.3), transparent 60%)",
        }}
      />
      <div className="wrap relative">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {eyebrow}
          </span>
          <h1 className="font-display mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-white/65">{subtitle}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
