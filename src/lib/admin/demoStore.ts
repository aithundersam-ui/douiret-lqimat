import { products as menu } from "@/data/menu";
import { team as defaultTeam } from "@/data/team";
import type { HomeContent, ProductRow, TeamRow } from "@/lib/site/content";
import { addDays, isoDay } from "./dates";
import type { BusinessDetails } from "./invoices";
import type { NewRow, Store } from "./store";
import { dateColumn, type DailyCount, type Member, type Range, type TableName, type Tables } from "./types";

// Demo mode: data lives only in this browser, seeded with sample numbers so
// every screen has something to show. Used until Supabase is configured.

const KEY = "douiret-demo-v3";
type Data = { [T in TableName]: Tables[T][] } & { site_content?: HomeContent; business?: BusinessDetails; members?: Member[] };

function id() {
  return Math.random().toString(36).slice(2, 10);
}

// Small deterministic pseudo-random generator so the sample data is stable.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function seed(): Data {
  const today = isoDay();
  const rand = rng(42);
  const products = menu.map((p) => ({
    id: p.id,
    name_en: p.name.en,
    name_ar: p.name.ar,
    name_fr: p.name.fr,
    category: p.category,
    source: p.category === "drinks" ? ("resale" as const) : ("made" as const),
    unit: p.unit,
    price: p.price,
    unit_cost: Math.round(p.price * (p.category === "drinks" ? 0.7 : 0.4)),
    active: true,
    description_en: p.description?.en ?? "",
    description_ar: p.description?.ar ?? "",
    description_fr: p.description?.fr ?? "",
    featured: Boolean(p.featured),
    image_url: p.image ?? "",
  }));

  const daily_counts: DailyCount[] = [];
  for (let i = 45; i >= 1; i--) {
    const day = addDays(today, -i);
    const weekend = new Date(day).getDay() === 5 ? 0.5 : 1;
    for (const p of products) {
      const base = p.unit === "piece" ? 30 + rand() * 50 : 2 + rand() * 4;
      const produced = Math.round(base * weekend);
      const wasted = Math.round(produced * rand() * 0.12);
      const sold = Math.max(0, produced - wasted - Math.round(rand() * produced * 0.05));
      daily_counts.push({ id: id(), day, product_id: p.id, produced, sold, wasted, unit_price: p.price, unit_cost: p.unit_cost });
    }
  }

  return {
    products,
    daily_counts,
    orders: [
      { id: id(), customer: "Samira B.", phone: "0555 12 34 56", due_date: addDays(today, 2), items: "200 مقروط، 100 بقلاوة", total: 31000, deposit: 10000, status: "in_production" },
      { id: id(), customer: "Karim H.", phone: "0661 98 76 54", due_date: addDays(today, 5), items: "3 kg lqimat, 80 bourek", total: 7600, deposit: 3000, status: "confirmed" },
      { id: id(), customer: "Nadia M.", phone: "0770 11 22 33", due_date: addDays(today, -3), items: "2 علب حلويات مشكّلة", total: 5000, deposit: 5000, status: "delivered" },
    ],
    purchases: [
      { id: id(), day: addDays(today, -6), supplier: "Grossiste Belcourt", item: "Semoule 25 kg", total: 2600, paid: 2600 },
      { id: id(), day: addDays(today, -4), supplier: "Amandes El Harrach", item: "Amandes 5 kg", total: 11000, paid: 6000 },
      { id: id(), day: addDays(today, -2), supplier: "Grossiste Belcourt", item: "Miel 3 kg, beurre 4 kg", total: 9400, paid: 5000 },
    ],
    invoices: [
      {
        id: id(), kind: "invoice", number: `FAC-${today.slice(0, 4)}-0001`, issue_date: addDays(today, -3), due_date: addDays(today, -3),
        customer_name: "Nadia M.", customer_address: "Kouba, Alger", customer_phone: "0770 11 22 33", customer_tax_id: "",
        payment_method: "cash", discount: 0, vat_rate: 0, stamp_duty: 0, notes: "", order_id: null,
        lines: [
          { description: "Makrout", unit: "pièce", qty: 24, unit_price: 80 },
          { description: "Lqimat (boîte)", unit: "boîte", qty: 2, unit_price: 600 },
        ],
      },
      {
        id: id(), kind: "proforma", number: `PRO-${today.slice(0, 4)}-0001`, issue_date: today, due_date: addDays(today, 15),
        customer_name: "Samira B.", customer_address: "", customer_phone: "0555 12 34 56", customer_tax_id: "",
        payment_method: "transfer", discount: 1000, vat_rate: 0, stamp_duty: 0, notes: "Acompte de 10 000 DA à la commande.", order_id: null,
        lines: [
          { description: "Makrout", unit: "pièce", qty: 200, unit_price: 80 },
          { description: "Baklawa", unit: "pièce", qty: 100, unit_price: 150 },
        ],
      },
    ],
    team_members: defaultTeam.map((m, i) => ({
      id: id(),
      name_en: m.name.en,
      name_ar: m.name.ar,
      name_fr: m.name.fr,
      role_en: m.role.en,
      role_ar: m.role.ar,
      role_fr: m.role.fr,
      photo_url: m.photo ?? "",
      sort: i + 1,
    })),
    expenses: [
      { id: id(), day: addDays(today, -20), category: "rent", description: "Loyer du mois", amount: 60000 },
      { id: id(), day: addDays(today, -10), category: "electricity", description: "Sonelgaz", amount: 8500 },
      { id: id(), day: addDays(today, -3), category: "packaging", description: "Boîtes et plateaux", amount: 4200 },
    ],
  };
}

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as Data;
      data.invoices ??= []; // demo data saved before invoices existed
      return data;
    }
  } catch {}
  return seed();
}

/** What the public pages need, read from the demo data (null if the demo was never opened). */
export function readDemoSiteParts(): { content?: HomeContent; products: ProductRow[]; team: TeamRow[] } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Data;
    return { content: data.site_content, products: data.products, team: data.team_members };
  } catch {
    return null;
  }
}

export function createDemoStore(): Store {
  let data = load();
  save();
  let user: string | null = null;
  try {
    user = sessionStorage.getItem(KEY + ":user");
  } catch {}

  function members(): Member[] {
    return (data.members ??= [
      { id: "demo", email: "demo@douiret-lqimat.dz", name: "Demo", role: "master", active: true, lastSignIn: new Date().toISOString() },
      { id: id(), email: "amina@douiret-lqimat.dz", name: "Amina", role: "staff", active: true, lastSignIn: null },
    ]);
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
      // Usually the browser's storage is full (too many demo photos).
      if ((err as Error).name === "QuotaExceededError") throw err;
    }
  }

  return {
    mode: "demo",
    async currentUser() {
      return user;
    },
    async signIn(email) {
      user = email || "demo";
      try {
        sessionStorage.setItem(KEY + ":user", user);
      } catch {}
    },
    async signOut() {
      user = null;
      try {
        sessionStorage.removeItem(KEY + ":user");
      } catch {}
    },
    async list<T extends TableName>(table: T, range: Range = {}) {
      const col = dateColumn[table];
      const rows = data[table] as Tables[T][];
      if (!col) return [...rows];
      return rows.filter((r) => {
        const v = (r as Record<string, unknown>)[col] as string;
        return (!range.from || v >= range.from) && (!range.to || v <= range.to);
      });
    },
    async insert<T extends TableName>(table: T, row: NewRow<T>) {
      (data[table] as Tables[T][]).push({ ...row, id: id() } as Tables[T]);
      save();
    },
    async update<T extends TableName>(table: T, rowId: string, patch: Partial<NewRow<T>>) {
      data = { ...data, [table]: (data[table] as Tables[T][]).map((r) => (r.id === rowId ? { ...r, ...patch } : r)) };
      save();
    },
    async remove(table, rowId) {
      if (table === "invoices") throw new Error("Invoices are kept and can't be deleted.");
      data = { ...data, [table]: (data[table] as { id: string }[]).filter((r) => r.id !== rowId) };
      if (table === "products") data.daily_counts = data.daily_counts.filter((c) => c.product_id !== rowId);
      save();
    },
    async getContent() {
      return data.site_content ?? null;
    },
    async saveContent(content) {
      data.site_content = content;
      save();
    },
    // Demo accounts are only a list in this browser; the demo user is the master admin.
    async currentRole() {
      return "master";
    },
    async listMembers() {
      return { members: members(), me: "demo" };
    },
    async createMember({ email, name, role }) {
      if (members().some((m) => m.email === email.toLowerCase())) throw new Error("A user with this email address has already been registered");
      members().push({ id: id(), email: email.toLowerCase(), name, role, active: true, lastSignIn: null });
      save();
    },
    async updateMember(memberId, { name, role, active }) {
      if (memberId === "demo" && (role === "staff" || active === false)) throw new Error("You can't remove your own master access.");
      const m = members().find((x) => x.id === memberId);
      if (m) Object.assign(m, name !== undefined && { name }, role && { role }, active !== undefined && { active });
      save();
    },
    async deleteMember(memberId) {
      if (memberId === "demo") throw new Error("You can't delete your own account.");
      data.members = members().filter((m) => m.id !== memberId);
      save();
    },
    async getBusiness() {
      return data.business ?? null;
    },
    async saveBusiness(details) {
      data.business = details;
      save();
    },
    async uploadImage(image) {
      // Demo mode keeps photos inside the browser as data URLs.
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(image);
      });
    },
    async saveDailyCounts(rows) {
      for (const row of rows) {
        const existing = data.daily_counts.find((c) => c.day === row.day && c.product_id === row.product_id);
        if (existing) Object.assign(existing, row);
        else data.daily_counts.push({ ...row, id: id() });
      }
      save();
    },
  };
}
