import type { Localized } from "@/lib/i18n";

// Mirrors the Settings and Products tabs of the store management workbook,
// so this list can later be loaded from the admin database instead.

export type CategoryId = "traditional" | "modern" | "savory" | "bread" | "drinks";

export const categories: { id: CategoryId; name: Localized }[] = [
  { id: "traditional", name: { en: "Traditional sweets", ar: "حلويات تقليدية", fr: "Gâteaux traditionnels" } },
  { id: "modern", name: { en: "Modern pastries", ar: "حلويات عصرية", fr: "Douceurs modernes" } },
  { id: "savory", name: { en: "Mini savouries", ar: "مملحات صغيرة", fr: "Mini salés" } },
  { id: "bread", name: { en: "Bread", ar: "خبز", fr: "Pain" } },
  { id: "drinks", name: { en: "Drinks", ar: "مشروبات", fr: "Boissons" } },
];

// The shop's three menus: sweets, salty and drinks.
export type MenuId = "sweets" | "salty" | "drinks";

export const menus: { id: MenuId; categories: CategoryId[] }[] = [
  { id: "sweets", categories: ["traditional", "modern"] },
  { id: "salty", categories: ["savory", "bread"] },
  { id: "drinks", categories: ["drinks"] },
];

export function menuOf(category: CategoryId): MenuId {
  return menus.find((m) => m.categories.includes(category))?.id ?? "sweets";
}

export type Unit = "piece" | "kg" | "box" | "tray" | "cup";

export type Product = {
  id: string;
  name: Localized;
  description?: Localized;
  category: CategoryId;
  price: number; // DZD
  unit: Unit;
  image?: string; // path under /public, e.g. "/menu/makrout.webp"
  featured?: boolean;
};

// PLACEHOLDER prices and items: replace with the real menu.
export const products: Product[] = [
  { id: "PRD-001", name: { en: "Makrout", ar: "مقروط", fr: "Makrout" }, description: { en: "Semolina, dates and honey", ar: "سميد، تمر وعسل", fr: "Semoule, dattes et miel" }, category: "traditional", price: 80, unit: "piece", featured: true },
  { id: "PRD-003", name: { en: "Lqimat", ar: "اللقيمات", fr: "Lqimat" }, description: { en: "Fried dough balls with honey and sesame", ar: "كويرات مقلية بالعسل والجلجلان", fr: "Beignets au miel et sésame" }, category: "traditional", price: 1200, unit: "kg", featured: true },
  { id: "PRD-004", name: { en: "Baklawa", ar: "بقلاوة", fr: "Baklawa" }, description: { en: "Almonds and honey", ar: "لوز وعسل", fr: "Amandes et miel" }, category: "traditional", price: 150, unit: "piece", featured: true },
  { id: "PRD-005", name: { en: "Griwech", ar: "قريوش", fr: "Griwech" }, category: "traditional", price: 1000, unit: "kg" },
  { id: "PRD-006", name: { en: "Mchewek", ar: "مشوك", fr: "Mchewek" }, description: { en: "Almonds", ar: "لوز", fr: "Amandes" }, category: "traditional", price: 100, unit: "piece" },
  { id: "PRD-007", name: { en: "Dziriettes", ar: "دزيريات", fr: "Dziriettes" }, category: "traditional", price: 120, unit: "piece" },
  { id: "PRD-010", name: { en: "Fruit tartlet", ar: "تارت بالفواكه", fr: "Tartelette aux fruits" }, category: "modern", price: 120, unit: "piece" },
  { id: "PRD-011", name: { en: "Brownie", ar: "براونيز", fr: "Brownie" }, category: "modern", price: 100, unit: "piece" },
  { id: "PRD-012", name: { en: "Box of assorted sweets", ar: "علبة حلويات مشكّلة", fr: "Boîte de gâteaux assortis" }, category: "modern", price: 2500, unit: "box", featured: true },
  { id: "PRD-020", name: { en: "Bourek", ar: "بوراك", fr: "Bourek" }, category: "savory", price: 50, unit: "piece", featured: true },
  { id: "PRD-021", name: { en: "Mhadjeb", ar: "محاجب", fr: "Mhadjeb" }, category: "savory", price: 70, unit: "piece", featured: true },
  { id: "PRD-022", name: { en: "Mini pizza", ar: "بيتزا صغيرة", fr: "Mini pizza" }, category: "savory", price: 40, unit: "piece" },
  { id: "PRD-023", name: { en: "Coca (savoury turnover)", ar: "كوكا", fr: "Coca" }, description: { en: "Peppers and tomatoes", ar: "بالفلفل والطماطم", fr: "Poivrons et tomates" }, category: "savory", price: 60, unit: "piece" },
  { id: "PRD-024", name: { en: "Msemen", ar: "مسمن", fr: "Msemen" }, category: "savory", price: 50, unit: "piece" },
  { id: "PRD-030", name: { en: "Khobz eddar (homemade bread)", ar: "خبز الدار", fr: "Khobz eddar" }, category: "bread", price: 100, unit: "piece" },
  { id: "PRD-002", name: { en: "Soft drink 33cl", ar: "مشروب غازي 33cl", fr: "Soda 33cl" }, category: "drinks", price: 100, unit: "piece" },
  { id: "PRD-030", name: { en: "Mint tea", ar: "أتاي بالنعناع", fr: "Thé à la menthe" }, category: "drinks", price: 80, unit: "cup", featured: true },
  { id: "PRD-031", name: { en: "Coffee", ar: "قهوة", fr: "Café" }, category: "drinks", price: 70, unit: "cup" },
  { id: "PRD-032", name: { en: "Fresh orange juice", ar: "عصير برتقال طبيعي", fr: "Jus d'orange pressé" }, category: "drinks", price: 200, unit: "cup" },
  { id: "PRD-033", name: { en: "Lben (buttermilk)", ar: "لبن", fr: "Lben (lait fermenté)" }, category: "drinks", price: 100, unit: "piece" },
  { id: "PRD-034", name: { en: "Mineral water 50cl", ar: "ماء معدني 50cl", fr: "Eau minérale 50cl" }, category: "drinks", price: 40, unit: "piece" },
];
