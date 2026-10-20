import type { HomeContent } from "@/lib/site/content";
import type { BusinessDetails } from "./invoices";
import type { Member, MemberChanges, Range, StaffRole, TableName, Tables } from "./types";

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
  /** The home page texts and contact details saved from the Website screen (null if never saved). */
  getContent(): Promise<Partial<HomeContent> | null>;
  saveContent(content: HomeContent): Promise<void>;
  /** The shop's details printed on invoices (null if never saved). */
  getBusiness(): Promise<Partial<BusinessDetails> | null>;
  saveBusiness(details: BusinessDetails): Promise<void>;
  /** The signed-in person's role: only the master admin manages accounts. */
  currentRole(): Promise<StaffRole>;
  /** Staff accounts, master admin only. `me` is the signed-in account's id. */
  listMembers(): Promise<{ members: Member[]; me: string }>;
  createMember(member: { email: string; password: string; name: string; role: StaffRole }): Promise<void>;
  updateMember(id: string, changes: MemberChanges): Promise<void>;
  deleteMember(id: string): Promise<void>;
  /** Store a photo for the website and return its public address. */
  uploadImage(image: Blob): Promise<string>;
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
