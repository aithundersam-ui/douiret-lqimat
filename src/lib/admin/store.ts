import type { Range, TableName, Tables } from "./types";

export type NewRow<T extends TableName> = Omit<Tables[T], "id">;

/**
 * Everything the admin screens need from the database. Two implementations:
 * Supabase (real, shared between staff) and a demo store kept in the browser,
 * used until Supabase is configured.
 */
export interface Store {
  mode: "supabase" | "demo";
  currentUser(): Promise<string | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  list<T extends TableName>(table: T, range?: Range): Promise<Tables[T][]>;
  insert<T extends TableName>(table: T, row: NewRow<T>): Promise<void>;
  update<T extends TableName>(table: T, id: string, patch: Partial<NewRow<T>>): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  /** Insert or replace the counts for (day, product). */
  saveDailyCounts(rows: Omit<Tables["daily_counts"], "id">[]): Promise<void>;
}

let store: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  if (!store) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    store =
      url && key
        ? import("./supabaseStore").then((m) => m.createSupabaseStore(url, key))
        : import("./demoStore").then((m) => m.createDemoStore());
  }
  return store;
}
