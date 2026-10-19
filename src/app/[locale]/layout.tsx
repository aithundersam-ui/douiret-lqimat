import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { dir, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], display: "swap", variable: "--font-cairo" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: `${t.shopName} · ${t.tagline}`, template: `%s · ${t.shopName}` },
    description: t.hero.text,
    openGraph: { title: t.shopName, description: t.tagline, images: ["/brand/og.jpg"], locale },
    alternates: { languages: { ar: "/ar/", fr: "/fr/" } },
  };
}

export const viewport: Viewport = { themeColor: "#72252A" };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dir(locale)} className={cairo.variable}>
      <body>{children}</body>
    </html>
  );
}
