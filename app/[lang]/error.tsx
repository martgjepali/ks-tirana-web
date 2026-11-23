"use client"; // Error boundaries must be Client Components

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const TEXT = {
  sq: {
    title: "Faqja nuk u ngarkua dot",
    body: "Diçka nuk shkoi mirë nga ana jonë. Provoni përsëri pas pak.",
    retry: "Provo përsëri",
    home: "Kryefaqja",
  },
  en: {
    title: "This page couldn't load",
    body: "Something went wrong on our side. Please try again in a moment.",
    retry: "Try again",
    home: "Home",
  },
};

/**
 * Shown inside the normal header/footer when a page fails to render,
 * e.g. the database is unreachable. `retry` re-fetches the page.
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const t = lang === "en" ? TEXT.en : TEXT.sq;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-paper px-6 py-20">
      <div className="max-w-md text-center">
        <Image src="/images/ks-tirana-crest.png" alt="" width={65} height={80} className="mx-auto h-20 w-auto opacity-90" />
        <h1 className="font-display mt-8 text-3xl font-bold uppercase tracking-tight text-ink">{t.title}</h1>
        <p className="mt-3 text-ink/60">{t.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            {t.retry}
          </button>
          <Link href={`/${lang === "en" ? "en" : "sq"}`} className="btn btn-ghost">
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
