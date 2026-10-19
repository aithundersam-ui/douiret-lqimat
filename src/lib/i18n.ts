export const locales = ["ar", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type Localized = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function formatPrice(amount: number, locale: Locale) {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
  return locale === "ar" ? `${n} دج` : `${n} DA`;
}
