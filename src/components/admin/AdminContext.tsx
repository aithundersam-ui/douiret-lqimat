"use client";

import { createContext, useContext } from "react";
import type { AdminDictionary } from "@/lib/admin/dictionary";
import type { Store } from "@/lib/admin/store";
import type { Locale } from "@/lib/i18n";

export type AdminContextValue = { store: Store; t: AdminDictionary; locale: Locale };

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminShell");
  return ctx;
}
