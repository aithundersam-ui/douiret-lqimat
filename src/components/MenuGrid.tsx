"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryId, Product, categories as allCategories } from "@/data/menu";
import type { Dictionary } from "@/lib/dictionary";
import { formatPrice, pick, type Locale } from "@/lib/i18n";

export function MenuGrid({
  locale,
  t,
  items,
  categories,
  showFilters,
}: {
  locale: Locale;
  t: Dictionary;
  items: Product[];
  categories: typeof allCategories;
  showFilters: boolean;
}) {
  const [active, setActive] = useState<CategoryId | "all">("all");
  const visible = active === "all" ? items : items.filter((p) => p.category === active);

  return (
    <>
      {showFilters && (
        <div className="menu__filters" role="tablist">
          <button role="tab" aria-selected={active === "all"} onClick={() => setActive("all")}>
            {t.menu.all}
          </button>
          {categories.map((c) => (
            <button key={c.id} role="tab" aria-selected={active === c.id} onClick={() => setActive(c.id)}>
              {pick(c.name, locale)}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="center">{t.menu.empty}</p>
      ) : (
        <ul className="menu__grid">
          {visible.map((p) => (
            <li key={p.id} className="card menu__item">
              <div className="menu__photo">
                {p.image ? (
                  // Photos can live on Supabase Storage, so use a plain <img>.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={pick(p.name, locale)} loading="lazy" />
                ) : (
                  <Image src="/brand/logo.webp" alt="" width={96} height={96} className="menu__placeholder" />
                )}
              </div>
              <div className="menu__body">
                <h3>{pick(p.name, locale)}</h3>
                {p.description && <p>{pick(p.description, locale)}</p>}
                <p className="menu__price">
                  {formatPrice(p.price, locale)} <small>{t.menu.perUnit[p.unit]}</small>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
