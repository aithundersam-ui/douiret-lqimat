"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage } from "@/components/admin/CrudPage";
import { categories } from "@/data/menu";
import { inLanguage, type Product } from "@/lib/admin/types";
import { formatPrice, pick } from "@/lib/i18n";

export default function ProductsPage() {
  const { t, locale } = useAdmin();
  const p = t.products;
  const categoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? pick(category.name, locale) : id;
  };

  return (
    <CrudPage
      table="products"
      title={t.nav.products}
      fields={[
        { key: "name_en", label: p.nameEn, type: "text", required: true },
        { key: "name_ar", label: p.nameAr, type: "text" },
        { key: "name_fr", label: p.nameFr, type: "text" },
        { key: "category", label: p.category, type: "select", options: categories.map((c) => ({ value: c.id, label: pick(c.name, locale) })) },
        { key: "source", label: p.source, type: "select", options: (["made", "resale"] as const).map((v) => ({ value: v, label: p.sources[v] })) },
        { key: "unit", label: p.unit, type: "select", options: (["piece", "kg", "box", "tray"] as const).map((v) => ({ value: v, label: p.units[v] })) },
        { key: "price", label: p.price, type: "number", required: true },
        { key: "unit_cost", label: p.unitCost, type: "number" },
        { key: "active", label: p.active, type: "checkbox" },
        { key: "featured", label: p.featured, type: "checkbox" },
        { key: "description_en", label: p.descriptionEn, type: "text" },
        { key: "description_ar", label: p.descriptionAr, type: "text" },
        { key: "description_fr", label: p.descriptionFr, type: "text" },
        { key: "image_url", label: p.photo, type: "image" },
      ]}
      emptyRow={() => ({ name_en: "", name_ar: "", name_fr: "", category: "traditional" as const, source: "made" as const, unit: "piece" as const, price: 0, unit_cost: 0, active: true, description_en: "", description_ar: "", description_fr: "", featured: false, image_url: "" })}
      sort={(a, b) =>
        categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category) ||
        inLanguage(locale, a.name_en, a.name_ar, a.name_fr).localeCompare(inLanguage(locale, b.name_en, b.name_ar, b.name_fr), locale)
      }
      card={(row: Product) => {
        const margin = row.price - row.unit_cost;
        const pct = row.price ? Math.round((margin / row.price) * 100) : 0;
        return {
          title: inLanguage(locale, row.name_en, row.name_ar, row.name_fr),
          subtitle: `${categoryName(row.category)} · ${p.sources[row.source]}${row.featured ? ` · ★ ${p.onHome}` : ""}${row.active ? "" : ` · ${p.inactive}`}`,
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
