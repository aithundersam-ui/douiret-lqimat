import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

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

  return (
    <>
      <Header locale={locale} t={t} />
      <main>{children}</main>
      <Footer locale={locale} t={t} />
      <WhatsAppButton label={t.hero.order} />
    </>
  );
}
