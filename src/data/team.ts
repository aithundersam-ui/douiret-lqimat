import type { Localized } from "@/lib/i18n";

export type TeamMember = {
  name: Localized;
  role: Localized;
  photo?: string; // path under /public, e.g. "/team/fatiha.webp"
};

// PLACEHOLDER: replace with the real team (only people who agree to be shown).
export const team: TeamMember[] = [
  { name: { ar: "الحاجة", fr: "El Hadja" }, role: { ar: "صاحبة الوصفات", fr: "Gardienne des recettes" } },
  { name: { ar: "الاسم", fr: "Prénom" }, role: { ar: "حلواني", fr: "Pâtissier" } },
  { name: { ar: "الاسم", fr: "Prénom" }, role: { ar: "المملحات والفرن", fr: "Salés et four" } },
  { name: { ar: "الاسم", fr: "Prénom" }, role: { ar: "البيع والطلبيات", fr: "Vente et commandes" } },
];
