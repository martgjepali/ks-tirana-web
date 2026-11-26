import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import { ViewTransition } from "react";
import { SPLASH_SCRIPT, THEME_SCRIPT } from "@/lib/theme";
import { InlineScript } from "@/components/InlineScript";
import { Splash } from "@/components/Splash";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getSiteSettings } from "@/lib/data/club";

// Handwritten accents ("Sot më mirë se dje").
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([getDictionary(lang), getSiteSettings()]);

  return (
    <html
      lang={lang}
      data-theme="light"
      // Lets Next.js turn off smooth scrolling while it restores scroll on navigation.
      data-scroll-behavior="smooth"
      // The inline script below sets data-theme / data-splash before React hydrates.
      suppressHydrationWarning
      className={`${caveat.variable} ${inter.variable} antialiased`}
    >
      <head>
        <InlineScript html={`${THEME_SCRIPT};${SPLASH_SCRIPT}`} />
      </head>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <Splash />
        <MotionProvider>
          <Header lang={lang} dict={dict} />
          {/* Route changes fade the page content; the header is anchored (see globals.css). */}
          <ViewTransition update="page" enter="page" exit="page" default="none">
            <main className="flex-1">{children}</main>
          </ViewTransition>
          <Footer lang={lang} dict={dict} socials={settings.socials} />
        </MotionProvider>
      </body>
    </html>
  );
}
