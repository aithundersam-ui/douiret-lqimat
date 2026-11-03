import type { MenuId } from "@/data/menu";
import { locales, type Locale } from "@/lib/i18n";

/**
 * The address printed in the menu QR code. It never changes, so printed codes
 * keep working: the /qr/ page sends visitors on to the menu the master admin chose.
 */
export const menuQrUrl = "https://douiret-lqimat.netlify.app/qr/";

/** Where the menu QR code leads: a language ("auto" = the visitor's phone language) and a menu ("" = all). */
export type MenuQrTarget = { lang: "auto" | Locale; section: "" | MenuId };

export const defaultMenuQr: MenuQrTarget = { lang: "auto", section: "" };

/** The menu page a visitor lands on, like /ar/menu/#drinks. */
export function menuQrPath(target: MenuQrTarget, browserLanguage = ""): string {
  const auto: Locale = /^ar/i.test(browserLanguage) ? "ar" : /^fr/i.test(browserLanguage) ? "fr" : "en";
  const lang = locales.includes(target.lang as Locale) ? (target.lang as Locale) : auto;
  return `/${lang}/menu/${target.section ? `#${target.section}` : ""}`;
}
