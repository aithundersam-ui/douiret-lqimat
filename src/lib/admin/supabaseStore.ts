import { createClient } from "@supabase/supabase-js";
import type { HomeContent } from "@/lib/site/content";
import type { BusinessDetails } from "./invoices";
import type { NewRow, Store } from "./store";
import { dateColumn, type Range, type TableName, type Tables } from "./types";

// Postgres numeric columns come back as strings; turn them into numbers.
const numericColumns = new Set(["price", "unit_cost", "produced", "sold", "wasted", "unit_price", "total", "deposit", "paid", "amount", "discount", "vat_rate", "stamp_duty"]);

function toNumbers<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...row };
  for (const k of Object.keys(out)) if (numericColumns.has(k) && out[k] != null) out[k] = Number(out[k]);
  return out as T;
}

export function createSupabaseStore(url: string, key: string): Store {
  const db = createClient(url, key);

  function check<T>(res: { data: T; error: { message: string } | null }) {
    if (res.error) throw new Error(res.error.message);
    return res.data;
  }

  return {
    mode: "supabase",

    async currentUser() {
      const { data } = await db.auth.getSession();
      return data.session?.user.email ?? null;
    },

    async signIn(email, password) {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },

    async signOut() {
      await db.auth.signOut();
    },

    async list<T extends TableName>(table: T, range: Range = {}) {
      let q = db.from(table).select("*");
      const col = dateColumn[table];
      if (col && range.from) q = q.gte(col, range.from);
      if (col && range.to) q = q.lte(col, range.to);
      const rows = check(await q.order("created_at", { ascending: true }).limit(10000));
      return (rows ?? []).map((r) => toNumbers<Tables[T]>(r));
    },

    async insert<T extends TableName>(table: T, row: NewRow<T>) {
      check(await db.from(table).insert(row as never));
    },

    async update<T extends TableName>(table: T, id: string, patch: Partial<NewRow<T>>) {
      check(await db.from(table).update(patch as never).eq("id", id));
    },

    async remove(table, id) {
      check(await db.from(table).delete().eq("id", id));
    },

    async saveDailyCounts(rows) {
      if (rows.length) check(await db.from("daily_counts").upsert(rows as never, { onConflict: "day,product_id" }));
    },

    async getContent() {
      const rows = check(await db.from("site_content").select("value").eq("key", "home").limit(1));
      return (rows?.[0] as { value: Partial<HomeContent> } | undefined)?.value ?? null;
    },

    async saveContent(content) {
      check(
        await db
          .from("site_content")
          .upsert({ key: "home", value: content, updated_at: new Date().toISOString() } as never, { onConflict: "key" }),
      );
    },

    async getBusiness() {
      const rows = check(await db.from("settings").select("value").eq("key", "business").limit(1));
      return (rows?.[0] as { value: Partial<BusinessDetails> } | undefined)?.value ?? null;
    },

    async saveBusiness(details) {
      check(
        await db
          .from("settings")
          .upsert({ key: "business", value: details, updated_at: new Date().toISOString() } as never, { onConflict: "key" }),
      );
    },

    async uploadImage(image) {
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
      const { error } = await db.storage.from("site").upload(path, image, { contentType: image.type || "image/jpeg" });
      if (error) throw new Error(error.message);
      return db.storage.from("site").getPublicUrl(path).data.publicUrl;
    },
  };
}
