"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage } from "@/components/admin/CrudPage";
import { isoDay } from "@/lib/admin/dates";
import { formatPrice } from "@/lib/i18n";

export default function PurchasesPage() {
  const { t, locale } = useAdmin();
  const p = t.purchases;

  return (
    <CrudPage
      table="purchases"
      title={t.nav.purchases}
      fields={[
        { key: "day", label: t.common.date, type: "date", required: true },
        { key: "supplier", label: p.supplier, type: "text" },
        { key: "item", label: p.item, type: "text", required: true },
        { key: "total", label: p.total, type: "number", required: true },
        { key: "paid", label: p.paid, type: "number" },
      ]}
      emptyRow={() => ({ day: isoDay(), supplier: "", item: "", total: 0, paid: 0 })}
      sort={(a, b) => b.day.localeCompare(a.day)}
      card={(row) => {
        const owed = row.total - row.paid;
        return {
          title: row.item,
          subtitle: `${row.day}${row.supplier ? ` · ${row.supplier}` : ""}`,
          aside: (
            <>
              {formatPrice(row.total, locale)}
              {owed > 0 && (
                <small className="admin-warn">
                  {p.owed} {formatPrice(owed, locale)}
                </small>
              )}
            </>
          ),
        };
      }}
    />
  );
}
