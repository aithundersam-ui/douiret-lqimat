"use client";

import { useCallback, useEffect, useState } from "react";
import type { Range, TableName, Tables } from "@/lib/admin/types";
import { useAdmin } from "./AdminContext";

export function useRows<T extends TableName>(table: T, range?: Range) {
  const { store } = useAdmin();
  const [rows, setRows] = useState<Tables[T][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const from = range?.from;
  const to = range?.to;

  const reload = useCallback(async () => {
    try {
      setRows(await store.list(table, { from, to }));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [store, table, from, to]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, error, reload };
}
