import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminDictionary } from "@/lib/admin/dictionary";
import { isLocale } from "@/lib/i18n";
import "../../admin.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: isLocale(locale) ? getAdminDictionary(locale).title : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminShell locale={locale}>{children}</AdminShell>;
}
