"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage } from "@/components/admin/CrudPage";
import { isoDay } from "@/lib/admin/dates";
import { orderStatuses, type Order } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

const closed = (o: Order) => o.status === "delivered" || o.status === "cancelled";

export default function OrdersPage() {
  const { t, locale } = useAdmin();
  const o = t.orders;
  const today = isoDay();

  return (
    <CrudPage
      table="orders"
      title={t.nav.orders}
      fields={[
        { key: "customer", label: o.customer, type: "text", required: true },
        { key: "phone", label: o.phone, type: "tel" },
        { key: "due_date", label: o.dueDate, type: "date", required: true },
        { key: "items", label: o.items, type: "textarea" },
        { key: "total", label: o.total, type: "number" },
        { key: "deposit", label: o.deposit, type: "number" },
        { key: "status", label: o.status, type: "select", options: orderStatuses.map((s) => ({ value: s, label: o.statuses[s] })) },
      ]}
      emptyRow={() => ({ customer: "", phone: "", due_date: today, items: "", total: 0, deposit: 0, status: "confirmed" as const })}
      sort={(a, b) => a.due_date.localeCompare(b.due_date)}
      sections={[
        { label: o.upcoming, filter: (r) => !closed(r) },
        { label: o.past, filter: closed },
      ]}
      card={(row) => {
        const balance = row.total - row.deposit;
        return {
          title: `${row.customer} · ${row.due_date}`,
          subtitle: `${o.statuses[row.status]}${row.items ? ` · ${row.items}` : ""}`,
          aside: (
            <>
              {formatPrice(row.total, locale)}
              {balance > 0 && (
                <small>
                  {o.balance} {formatPrice(balance, locale)}
                </small>
              )}
            </>
          ),
          muted: closed(row),
        };
      }}
    />
  );
}
