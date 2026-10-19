"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage } from "@/components/admin/CrudPage";
import { categories } from "@/data/menu";
import type { Product } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

export default function ProductsPage() {
  const { t, locale } = useAdmin();
  const p = t.products;
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name[locale] ?? id;

  return (
    <CrudPage
      table="products"
      title={t.nav.products}
      fields={[
        { key: "name_ar", label: p.nameAr, type: "text", required: true },
        { key: "name_fr", label: p.nameFr, type: "text" },
        { key: "category", label: p.category, type: "select", options: categories.map((c) => ({ value: c.id, label: c.name[locale] })) },
        { key: "source", label: p.source, type: "select", options: (["made", "resale"] as const).map((v) => ({ value: v, label: p.sources[v] })) },
        { key: "unit", label: p.unit, type: "select", options: (["piece", "kg", "box", "tray"] as const).map((v) => ({ value: v, label: p.units[v] })) },
        { key: "price", label: p.price, type: "number", required: true },
        { key: "unit_cost", label: p.unitCost, type: "number" },
        { key: "active", label: p.active, type: "checkbox" },
      ]}
      emptyRow={() => ({ name_ar: "", name_fr: "", category: "traditional" as const, source: "made" as const, unit: "piece" as const, price: 0, unit_cost: 0, active: true })}
      sort={(a, b) =>
        categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category) ||
        a.name_ar.localeCompare(b.name_ar, "ar")
      }
      card={(row: Product) => {
        const margin = row.price - row.unit_cost;
        const pct = row.price ? Math.round((margin / row.price) * 100) : 0;
        return {
          title: locale === "ar" ? row.name_ar : row.name_fr || row.name_ar,
          subtitle: `${categoryName(row.category)} · ${p.sources[row.source]}${row.active ? "" : ` · ${p.inactive}`}`,
          aside: (
            <>
              {formatPrice(row.price, locale)} / {p.units[row.unit]}
              <small>
                {p.margin} {pct}%
              </small>
            </>
          ),
          muted: !row.active,
        };
      }}
    />
  );
}
