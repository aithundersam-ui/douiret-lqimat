// The A4 shop posters (French and Arabic), printed from the Posters screen.
// Every text on them can be changed there; these are the original texts.

export const posterThemes = ["white", "peach", "burgundy"] as const;
export type PosterTheme = (typeof posterThemes)[number];

export type PosterItem = Record<string, string>;
/** A poster's texts: plain texts, plus lists (menu tiles, occasions, opening days). */
export type PosterContent = Record<string, string | PosterItem[]>;

type Label = { en: string; ar: string };
type TextField = { key: string; label: Label; long?: boolean };
type ListField = { key: string; label: Label; list: TextField[]; max: number };
export type PosterField = TextField | ListField;

export const isList = (f: PosterField): f is ListField => "list" in f;

export type PosterKind = "welcome" | "selection" | "orders" | "hours" | "open" | "closed" | "noTouch" | "thanks" | "menuQr";

export type PosterSpec = { id: PosterKind; name: Label; fields: PosterField[]; defaults: PosterContent };

const titleAr: TextField = { key: "titleAr", label: { en: "Title (Arabic)", ar: "العنوان (بالعربية)" } };
const titleFr: TextField = { key: "titleFr", label: { en: "Title (French)", ar: "العنوان (بالفرنسية)" } };
const subAr: TextField = { key: "subAr", label: { en: "Line under it (Arabic)", ar: "السطر تحته (بالعربية)" } };
const subFr: TextField = { key: "subFr", label: { en: "Line under it (French)", ar: "السطر تحته (بالفرنسية)" } };
const ar: TextField = { key: "ar", label: { en: "Arabic", ar: "بالعربية" } };
const fr: TextField = { key: "fr", label: { en: "French", ar: "بالفرنسية" } };

export const posters: PosterSpec[] = [
  {
    id: "welcome",
    name: { en: "Welcome", ar: "أهلاً وسهلاً" },
    fields: [titleAr, titleFr, { key: "sub", label: { en: "Line at the bottom", ar: "السطر في الأسفل" } }],
    defaults: { titleAr: "أهلاً وسهلاً", titleFr: "Bienvenue", sub: "Pâtisseries traditionnelles & modernes · Salés maison" },
  },
  {
    id: "selection",
    name: { en: "Our selection", ar: "تشكيلتنا" },
    fields: [
      titleAr,
      titleFr,
      { key: "tiles", label: { en: "Boxes", ar: "الخانات" }, max: 6, list: [ar, fr, { key: "note", label: { en: "Small line", ar: "سطر صغير" } }] },
      { key: "footerFr", label: { en: "Bottom line (French)", ar: "السطر الأخير (بالفرنسية)" } },
      { key: "footerAr", label: { en: "Bottom line (Arabic)", ar: "السطر الأخير (بالعربية)" } },
    ],
    defaults: {
      titleAr: "تشكيلتنا",
      titleFr: "Notre sélection",
      tiles: [
        { ar: "حلويات تقليدية", fr: "Pâtisseries traditionnelles", note: "Le goût de chez nous" },
        { ar: "حلويات عصرية", fr: "Pâtisseries modernes", note: "La tradition revisitée" },
        { ar: "مملحات", fr: "Salés & mini-snacks", note: "Petites bouchées salées" },
        { ar: "مشروبات", fr: "Boissons", note: "Chaudes & fraîches" },
      ],
      footerFr: "Fait maison, chaque jour",
      footerAr: "صنع منزلي كل يوم",
    },
  },
  {
    id: "orders",
    name: { en: "We take orders", ar: "نستقبل طلبياتكم" },
    fields: [
      titleAr,
      titleFr,
      { key: "items", label: { en: "Occasions", ar: "المناسبات" }, max: 8, list: [ar, fr] },
      { key: "askAr", label: { en: "Highlighted line (Arabic)", ar: "السطر المميّز (بالعربية)" } },
      { key: "askFr", label: { en: "Highlighted line (French)", ar: "السطر المميّز (بالفرنسية)" } },
      { key: "phone", label: { en: "Phone (leave empty to write it by hand)", ar: "الهاتف (اتركه فارغاً لكتابته باليد)" } },
    ],
    defaults: {
      titleAr: "نستقبل طلبياتكم",
      titleFr: "Nous prenons vos commandes",
      items: [
        { ar: "الأعراس والخطوبة", fr: "Mariages & fiançailles" },
        { ar: "أعياد الميلاد", fr: "Anniversaires" },
        { ar: "الأعياد والمناسبات الدينية", fr: "Aïd & fêtes religieuses" },
        { ar: "الحفلات العائلية", fr: "Fêtes de famille" },
        { ar: "المؤسسات والملتقيات", fr: "Entreprises & séminaires" },
      ],
      askAr: "اطلبوا مسبقاً",
      askFr: "Pensez à commander à l'avance",
      phone: "",
    },
  },
  {
    id: "hours",
    name: { en: "Opening hours", ar: "أوقات العمل" },
    fields: [
      titleAr,
      titleFr,
      {
        key: "days",
        label: { en: "Days", ar: "الأيام" },
        max: 8,
        list: [ar, fr, { key: "time", label: { en: "Hours (empty = write by hand)", ar: "الساعات (فارغ = باليد)" } }],
      },
    ],
    defaults: {
      titleAr: "أوقات العمل",
      titleFr: "Horaires d'ouverture",
      days: [
        { ar: "السبت", fr: "Samedi", time: "" },
        { ar: "الأحد", fr: "Dimanche", time: "" },
        { ar: "الاثنين", fr: "Lundi", time: "" },
        { ar: "الثلاثاء", fr: "Mardi", time: "" },
        { ar: "الأربعاء", fr: "Mercredi", time: "" },
        { ar: "الخميس", fr: "Jeudi", time: "" },
        { ar: "الجمعة", fr: "Vendredi", time: "" },
      ],
    },
  },
  {
    id: "open",
    name: { en: "Open", ar: "مفتوح" },
    fields: [
      { key: "signAr", label: { en: "Sign (Arabic)", ar: "اللافتة (بالعربية)" } },
      { key: "signFr", label: { en: "Sign (French)", ar: "اللافتة (بالفرنسية)" } },
      subAr,
      subFr,
    ],
    defaults: { signAr: "مفتوح", signFr: "OUVERT", subAr: "تفضلوا بالدخول", subFr: "Entrez, c'est ouvert !" },
  },
  {
    id: "closed",
    name: { en: "Closed", ar: "مغلق" },
    fields: [
      { key: "signAr", label: { en: "Sign (Arabic)", ar: "اللافتة (بالعربية)" } },
      { key: "signFr", label: { en: "Sign (French)", ar: "اللافتة (بالفرنسية)" } },
      subAr,
      subFr,
    ],
    defaults: { signAr: "مغلق", signFr: "FERMÉ", subAr: "إلى اللقاء قريباً", subFr: "À très bientôt !" },
  },
  {
    id: "noTouch",
    name: { en: "Please don't touch", ar: "عدم اللمس" },
    fields: [{ ...titleAr, long: true }, titleFr, subAr, subFr],
    defaults: {
      titleAr: "الرجاء عدم لمس\nالمنتجات",
      titleFr: "Merci de ne pas toucher les produits",
      subAr: "البائع في خدمتكم بكل سرور",
      subFr: "Nous vous servons avec plaisir",
    },
  },
  {
    id: "thanks",
    name: { en: "Thank you", ar: "شكراً" },
    fields: [titleAr, titleFr, subAr, subFr],
    defaults: { titleAr: "شكراً على زيارتكم", titleFr: "Merci de votre visite", subAr: "صحة وهناء", subFr: "Bon appétit !" },
  },
  {
    id: "menuQr",
    name: { en: "Menu QR code", ar: "رمز القائمة" },
    fields: [titleAr, titleFr, subAr, subFr],
    defaults: {
      titleAr: "اكتشفوا قائمتنا",
      titleFr: "Découvrez notre menu",
      subAr: "امسحوا الرمز بهاتفكم",
      subFr: "Scannez le code avec votre téléphone",
    },
  },
];

/** The saved texts on top of the originals, so a poster always has every text it needs. */
export function posterContent(spec: PosterSpec, saved?: PosterContent | null): PosterContent {
  return { ...spec.defaults, ...(saved ?? {}) };
}
