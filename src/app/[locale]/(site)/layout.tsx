import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteDataProvider } from "@/components/SiteData";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { defaultSiteData } from "@/lib/site/content";
import { loadSiteData } from "@/lib/site/load";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const initial = (await loadSiteData()) ?? defaultSiteData;

  return (
    <SiteDataProvider initial={initial}>
      <Header locale={locale} t={t} />
      <main>{children}</main>
      <Footer locale={locale} t={t} />
      <WhatsAppButton label={t.hero.order} />
    </SiteDataProvider>
  );
}
