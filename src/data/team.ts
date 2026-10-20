import type { Localized } from "@/lib/i18n";

export type TeamMember = {
  name: Localized;
  role: Localized;
  photo?: string; // path under /public, e.g. "/team/fatiha.webp"
};

// PLACEHOLDER: replace with the real team (only people who agree to be shown).
export const team: TeamMember[] = [
  { name: { en: "El Hadja", ar: "الحاجة", fr: "El Hadja" }, role: { en: "Keeper of the recipes", ar: "صاحبة الوصفات", fr: "Gardienne des recettes" } },
  { name: { en: "Name", ar: "الاسم", fr: "Prénom" }, role: { en: "Pastry chef", ar: "حلواني", fr: "Pâtissier" } },
  { name: { en: "Name", ar: "الاسم", fr: "Prénom" }, role: { en: "Savouries and oven", ar: "المملحات والفرن", fr: "Salés et four" } },
  { name: { en: "Name", ar: "الاسم", fr: "Prénom" }, role: { en: "Sales and orders", ar: "البيع والطلبيات", fr: "Vente et commandes" } },
];
