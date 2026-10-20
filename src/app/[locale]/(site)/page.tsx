import { notFound } from "next/navigation";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { Team } from "@/components/Team";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} t={t} />
      <About locale={locale} />
      <MenuSection locale={locale} t={t} featuredOnly />
      <Team locale={locale} t={t} />
      <Contact locale={locale} t={t} />
    </>
  );
}
