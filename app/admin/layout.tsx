import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "./admin.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: "Paneli · KS Tirana", template: "%s · Paneli KS Tirana" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [{ media: "(width < 64rem)", color: "#021f48" }, { media: "(width >= 64rem)", color: "#fff" }],
};

/** Root layout of the staff panel (Albanian only, light theme, no public header). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" data-theme="light" className={`${inter.variable} admin-root antialiased`}>
      <body className="min-h-dvh bg-surface text-ink">{children}</body>
    </html>
  );
}
