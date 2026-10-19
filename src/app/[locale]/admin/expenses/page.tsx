"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage } from "@/components/admin/CrudPage";
import { isoDay } from "@/lib/admin/dates";
import { expenseCategories } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

export default function ExpensesPage() {
  const { t, locale } = useAdmin();
  const e = t.expenses;

  return (
    <CrudPage
      table="expenses"
      title={t.nav.expenses}
      fields={[
        { key: "day", label: t.common.date, type: "date", required: true },
        { key: "category", label: e.category, type: "select", options: expenseCategories.map((c) => ({ value: c, label: e.categories[c] })) },
        { key: "description", label: e.description, type: "text" },
        { key: "amount", label: e.amount, type: "number", required: true },
      ]}
      emptyRow={() => ({ day: isoDay(), category: "other" as const, description: "", amount: 0 })}
      sort={(a, b) => b.day.localeCompare(a.day)}
      card={(row) => ({
        title: e.categories[row.category],
        subtitle: `${row.day}${row.description ? ` · ${row.description}` : ""}`,
        aside: formatPrice(row.amount, locale),
      })}
    />
  );
}
