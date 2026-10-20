import type { Localized } from "@/lib/i18n";

// PLACEHOLDER: replace with the real details.
export const shop = {
  phone: "+213 555 00 00 00",
  // Digits only, international format, for the wa.me link.
  whatsapp: "213555000000",
  address: {
    en: "Algiers, Algeria",
    ar: "الجزائر العاصمة، الجزائر",
    fr: "Alger, Algérie",
  } satisfies Localized,
  mapUrl: "https://maps.google.com/?q=Alger",
  hours: [
    { days: { en: "Saturday to Thursday", ar: "السبت إلى الخميس", fr: "Samedi à jeudi" }, time: "07:00 – 20:00" },
    { days: { en: "Friday", ar: "الجمعة", fr: "Vendredi" }, time: "14:00 – 20:00" },
  ] satisfies { days: Localized; time: string }[],
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
};
