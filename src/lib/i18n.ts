export const locales = ["en", "ar", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** The staff area is only in English and Arabic. */
export const adminLocales = ["en", "ar"] as const satisfies readonly Locale[];
export type AdminLocale = (typeof adminLocales)[number];

export const languageNames: Record<Locale, string> = { en: "English", ar: "العربية", fr: "Français" };

export type Localized = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isAdminLocale(value: string): value is AdminLocale {
  return (adminLocales as readonly string[]).includes(value);
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Text in the wanted language, falling back to English, then French, then Arabic. */
export function pick(text: Partial<Localized> | undefined, locale: Locale) {
  return text?.[locale] || text?.en || text?.fr || text?.ar || "";
}

const numberLocale: Record<Locale, string> = { en: "en-DZ", ar: "ar-DZ", fr: "fr-DZ" };
const currency: Record<Locale, string> = { en: "DZD", ar: "دج", fr: "DA" };

export function formatPrice(amount: number, locale: Locale) {
  const n = new Intl.NumberFormat(numberLocale[locale], { maximumFractionDigits: 0, numberingSystem: "latn" }).format(amount);
  return `${n} ${currency[locale]}`;
}
