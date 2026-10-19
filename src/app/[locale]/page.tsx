import { notFound } from "next/navigation";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { Team } from "@/components/Team";
import { products } from "@/data/menu";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <Hero locale={locale} t={t} />
      <About t={t} />
      <MenuSection locale={locale} t={t} items={featured} showFilters={false} seeAllLink />
      <Team locale={locale} t={t} />
      <Contact locale={locale} t={t} />
    </>
  );
}
