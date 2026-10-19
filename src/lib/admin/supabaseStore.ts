import { createClient } from "@supabase/supabase-js";
import type { NewRow, Store } from "./store";
import { dateColumn, type Range, type TableName, type Tables } from "./types";

// Postgres numeric columns come back as strings; turn them into numbers.
const numericColumns = new Set(["price", "unit_cost", "produced", "sold", "wasted", "unit_price", "total", "deposit", "paid", "amount"]);

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
  };
}
