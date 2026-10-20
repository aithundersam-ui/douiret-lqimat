"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { languageNames, locales, type Locale } from "@/lib/i18n";

/** Links to the same page in the other two languages. */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}/`;

  return (
    <span className="lang-switch">
      {locales
        .filter((l) => l !== locale)
        .map((l) => (
          <Link key={l} href={pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${l}`)} hrefLang={l} lang={l}>
            {languageNames[l]}
          </Link>
        ))}
    </span>
  );
}
