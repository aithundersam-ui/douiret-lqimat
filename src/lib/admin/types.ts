import type { CategoryId, Unit } from "@/data/menu";

export type ProductSource = "made" | "resale";

export type Product = {
  id: string;
  name_ar: string;
  name_fr: string;
  category: CategoryId;
  source: ProductSource;
  unit: Unit;
  price: number;
  unit_cost: number;
  active: boolean;
  // Shown on the public website.
  description_ar: string;
  description_fr: string;
  featured: boolean;
  image_url: string;
};

export type DailyCount = {
  id: string;
  day: string; // YYYY-MM-DD
  product_id: string;
  produced: number;
  sold: number;
  wasted: number;
  unit_price: number;
  unit_cost: number;
};

export const orderStatuses = ["confirmed", "in_production", "ready", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type Order = {
  id: string;
  customer: string;
  phone: string;
  due_date: string;
  items: string;
  total: number;
  deposit: number;
  status: OrderStatus;
};

export type Purchase = {
  id: string;
  day: string;
  supplier: string;
  item: string;
  total: number;
  paid: number;
};

export const expenseCategories = [
  "rent",
  "electricity",
  "gas",
  "water",
  "wages",
  "packaging",
  "transport",
  "repairs",
  "other",
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];

export type Expense = {
  id: string;
  day: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

export type TeamMemberRow = {
  id: string;
  name_ar: string;
  name_fr: string;
  role_ar: string;
  role_fr: string;
  photo_url: string;
  sort: number;
};

export type Tables = {
  products: Product;
  daily_counts: DailyCount;
  orders: Order;
  purchases: Purchase;
  expenses: Expense;
  team_members: TeamMemberRow;
};

export type TableName = keyof Tables;

/** Optional date filter on a table's date column (inclusive). */
export type Range = { from?: string; to?: string };

export const dateColumn: Record<TableName, string | null> = {
  products: null,
  daily_counts: "day",
  orders: "due_date",
  purchases: "day",
  expenses: "day",
  team_members: null,
};
