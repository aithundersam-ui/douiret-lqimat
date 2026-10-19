"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}/`;
  const other: Locale = locale === "ar" ? "fr" : "ar";
  const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);

  return (
    <Link href={href} hrefLang={other} lang={other} className="lang-switch">
      {label}
    </Link>
  );
}
