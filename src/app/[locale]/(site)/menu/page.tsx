import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuSection } from "@/components/MenuSection";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).menu.title } : {};
}

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return <MenuSection locale={locale} t={t} featuredOnly={false} headingLevel={1} />;
}
