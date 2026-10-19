import type { Localized } from "@/lib/i18n";

// Mirrors the Settings and Products tabs of the store management workbook,
// so this list can later be loaded from the admin database instead.

export type CategoryId = "traditional" | "modern" | "savory" | "bread" | "drinks";

export const categories: { id: CategoryId; name: Localized }[] = [
  { id: "traditional", name: { ar: "حلويات تقليدية", fr: "Gâteaux traditionnels" } },
  { id: "modern", name: { ar: "حلويات عصرية", fr: "Douceurs modernes" } },
  { id: "savory", name: { ar: "مملحات صغيرة", fr: "Mini salés" } },
  { id: "bread", name: { ar: "خبز", fr: "Pain" } },
  { id: "drinks", name: { ar: "مشروبات", fr: "Boissons" } },
];

export type Unit = "piece" | "kg" | "box" | "tray";

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
  { id: "PRD-001", name: { ar: "مقروط", fr: "Makrout" }, description: { ar: "سميد، تمر وعسل", fr: "Semoule, dattes et miel" }, category: "traditional", price: 80, unit: "piece", featured: true },
  { id: "PRD-003", name: { ar: "اللقيمات", fr: "Lqimat" }, description: { ar: "كويرات مقلية بالعسل والجلجلان", fr: "Beignets au miel et sésame" }, category: "traditional", price: 1200, unit: "kg", featured: true },
  { id: "PRD-004", name: { ar: "بقلاوة", fr: "Baklawa" }, description: { ar: "لوز وعسل", fr: "Amandes et miel" }, category: "traditional", price: 150, unit: "piece", featured: true },
  { id: "PRD-005", name: { ar: "قريوش", fr: "Griwech" }, category: "traditional", price: 1000, unit: "kg" },
  { id: "PRD-006", name: { ar: "مشوك", fr: "Mchewek" }, description: { ar: "لوز", fr: "Amandes" }, category: "traditional", price: 100, unit: "piece" },
  { id: "PRD-007", name: { ar: "دزيريات", fr: "Dziriettes" }, category: "traditional", price: 120, unit: "piece" },
  { id: "PRD-010", name: { ar: "تارت بالفواكه", fr: "Tartelette aux fruits" }, category: "modern", price: 120, unit: "piece" },
  { id: "PRD-011", name: { ar: "براونيز", fr: "Brownie" }, category: "modern", price: 100, unit: "piece" },
  { id: "PRD-012", name: { ar: "علبة حلويات مشكّلة", fr: "Boîte de gâteaux assortis" }, category: "modern", price: 2500, unit: "box", featured: true },
  { id: "PRD-020", name: { ar: "بوراك", fr: "Bourek" }, category: "savory", price: 50, unit: "piece", featured: true },
  { id: "PRD-021", name: { ar: "محاجب", fr: "Mhadjeb" }, category: "savory", price: 70, unit: "piece", featured: true },
  { id: "PRD-022", name: { ar: "بيتزا صغيرة", fr: "Mini pizza" }, category: "savory", price: 40, unit: "piece" },
  { id: "PRD-023", name: { ar: "كوكا", fr: "Coca" }, description: { ar: "بالفلفل والطماطم", fr: "Poivrons et tomates" }, category: "savory", price: 60, unit: "piece" },
  { id: "PRD-024", name: { ar: "مسمن", fr: "Msemen" }, category: "savory", price: 50, unit: "piece" },
  { id: "PRD-030", name: { ar: "خبز الدار", fr: "Khobz eddar" }, category: "bread", price: 100, unit: "piece" },
  { id: "PRD-002", name: { ar: "مشروب غازي 33cl", fr: "Soda 33cl" }, category: "drinks", price: 100, unit: "piece" },
];
